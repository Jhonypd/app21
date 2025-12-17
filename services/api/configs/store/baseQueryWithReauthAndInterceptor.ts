import { toastError } from '@/components/custom-toast';
import { ApiResponse } from '@/services/interfaces';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { rawBaseQuery } from './rawBaseQuery';
import {
  logout,
  setCredentials,
} from '@/services/api/configs/store/auth-slice';
import { limparSalaToken } from './sala-auth-slice';

export type ApiError = FetchBaseQueryError & {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ApiResponse<any>;
};

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'data' in err
  );
}

const baseQueryWithReauthAndInterceptor: BaseQueryFn<
  string | FetchArgs,
  ApiResponse,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // 🔄 Verificar se backend enviou novos tokens (refresh automático)
  const newAccessToken = result.meta?.response?.headers.get(
    'x-new-access-token',
  );
  const newRefreshToken =
    result.meta?.response?.headers.get(
      'x-new-refresh-token',
    );

  if (newAccessToken && newRefreshToken) {
    // Backend fez refresh automático - atualizar tokens
    api.dispatch(
      setCredentials({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }),
    );
    console.log(
      '🔄 Tokens atualizados automaticamente pelo backend',
    );
  }

  // ⚠️ Verificar se backend pediu login (refresh falhou ou sessão inválida)
  const requerLogin =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.error?.data as any)?.requer_login === true;

  // Verificar se é erro da SALA especificamente (limpar_token: true)
  const limparTokenSala =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.error?.data as any)?.Resultado?.limpar_token ===
    true;

  // Verificar se é erro de autenticação (401/403) que não teve refresh automático
  const error = result.error;
  const status =
    isApiError(error) && typeof error.status === 'number'
      ? error.status
      : undefined;
  const ehErroAutenticacao =
    status === 401 || status === 403;
  const teveRefreshAutomatico =
    newAccessToken && newRefreshToken;

  // ✅ CORREÇÃO: Se for erro de sala (limpar_token: true), NÃO fazer logout completo
  if (limparTokenSala && !requerLogin) {
    // Apenas limpar token da sala, não fazer logout
    api.dispatch(limparSalaToken());
    console.log(
      '🧹 Token da sala limpo (erro com limpar_token)',
    );
    return result;
  }

  // Fazer logout completo APENAS se:
  // 1. Backend explicitamente pedir (requer_login: true)
  // 2. OU erro 401/403 sem refresh E sem ser erro de sala
  if (
    requerLogin ||
    (ehErroAutenticacao &&
      !teveRefreshAutomatico &&
      !limparTokenSala)
  ) {
    // Limpar TODOS os tokens (auth + sala)
    api.dispatch(logout());
    api.dispatch(limparSalaToken());

    if (typeof window !== 'undefined') {
      const mensagem = requerLogin
        ? 'Sessão expirada'
        : 'Sessão inválida';

      toastError({
        title: mensagem,
        description:
          'Você será redirecionado para o login em 3 segundos.',
      });
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 3000);
    }

    return result;
  }

  if (result.error) {
    if (isApiError(result.error)) {
      // Verificar se o backend pede para limpar token da sala
      const limparToken =
        result.error.data?.Resultado?.limpar_token;
      if (limparToken === true) {
        api.dispatch(limparSalaToken());
        console.log(
          '🧹 Token da sala limpo (backend solicitou)',
        );
      }

      return {
        error: {
          status: result.error.status ?? 400,
          data: {
            Sucesso: false,
            Mensagem:
              result.error.data?.Mensagem ??
              'Erro inesperado',
            Detalhe: result.error.data?.Detalhe ?? '',
            CodigoRetorno: result.error.status ?? 400,
            Resultado: result.error.data?.Resultado ?? null,
          },
        },
      };
    }
    console.log('result', result);

    return {
      error: {
        status: 400,
        data: {
          Sucesso: false,
          Mensagem: 'Erro inesperado',
          Detalhe: '',
          CodigoRetorno: 400,
          Resultado: null,
        },
      },
    };
  }

  const data = result.data as ApiResponse;

  // Verificar se precisa limpar token da sala (mesmo em sucesso)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((data.Resultado as any)?.limpar_token === true) {
    api.dispatch(limparSalaToken());
    console.log(
      '🧹 Token da sala limpo (resposta de sucesso)',
    );
  }

  if (!data.Sucesso) {
    toastError({
      description:
        data.Mensagem || 'Operação não concluída.',
    });
    return {
      error: {
        status: data.CodigoRetorno ?? 400,
        data,
      }, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  return { data };
};

export { baseQueryWithReauthAndInterceptor };
