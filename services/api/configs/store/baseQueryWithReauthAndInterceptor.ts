import { toastError } from '@/components/custom-toast';
import { ApiResponse } from '@/services/interfaces';
import {
   BaseQueryFn,
   FetchArgs,
   FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { rawBaseQuery, RawBaseQueryMeta } from './rawBaseQuery';
import {
   logout,
   getTokensFromStorage,
   clearTokensFromStorage,
} from '@/services/api/configs/store/auth-slice';
import { limparSalaToken } from './sala-auth-slice';
import type { RootState } from './store';

export type ApiError = FetchBaseQueryError & {
   status: number;
   data: ApiResponse<unknown>;
};

function isApiError(err: unknown): err is ApiError {
   return (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      'data' in err
   );
}

// Interface para tipar o Resultado com limpar_token
interface ResultadoComLimparToken {
   limpar_token?: boolean;
}

/**
 * Base query com interceptação de erros e autenticação.
 *
 * Fluxo:
 * - limpar_token: true (sem requer_login) → limpa apenas o token da sala
 * - 401/403 ou requer_login: true → logout completo e redirect para login
 */
const baseQueryWithReauthAndInterceptor: BaseQueryFn<
   string | FetchArgs,
   unknown,
   FetchBaseQueryError,
   object,
   RawBaseQueryMeta
> = async (args, api, extraOptions) => {
   const { accessToken: tokenStorage } = getTokensFromStorage();
   const state = api.getState() as RootState;
   const tokenSalaAtual = state.salaAuth?.tokenSala;

   const tokenAtual = tokenStorage;

   // Criar headers com tokens do localStorage
   const headersObj: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
   };

   if (tokenAtual) {
      headersObj['Authorization'] = `Bearer ${tokenAtual}`;
   }

   if (tokenSalaAtual) {
      headersObj['x-token-sala'] = tokenSalaAtual;
   }

   // Montar args com headers atualizados (merge com headers do endpoint)
   const endpointHeaders =
      typeof args === 'string'
         ? {}
         : ((args.headers as Record<string, string>) ?? {});

   const mergedHeaders: Record<string, string> = {
      ...headersObj,
      ...endpointHeaders,
   };

   const argsWithHeaders: FetchArgs =
      typeof args === 'string'
         ? { url: args, headers: mergedHeaders }
         : { ...args, headers: mergedHeaders };

   const result = await rawBaseQuery(argsWithHeaders, api, extraOptions);

   type ErrorData = {
      requer_login?: boolean;
      Resultado?: { limpar_token?: boolean };
   };
   const errorData = result.error?.data as ErrorData | undefined;

   const requerLogin = errorData?.requer_login === true;

   // Verificar se é erro da SALA especificamente (limpar_token: true)
   const limparTokenSala = errorData?.Resultado?.limpar_token === true;

   // Verificar se é erro de autenticação (401/403)
   const error = result.error;
   const status =
      isApiError(error) && typeof error.status === 'number'
         ? error.status
         : undefined;
   const ehErroAutenticacao = status === 401 || status === 403;

   if (limparTokenSala && !requerLogin) {
      // Apenas limpar token da sala, não fazer logout
      api.dispatch(limparSalaToken());
      return result;
   }

   // Fazer logout completo se:
   // 1. Backend explicitamente pedir (requer_login: true)
   // 2. OU erro 401/403
   if (requerLogin || (ehErroAutenticacao && !limparTokenSala)) {
      // Limpar TODOS os tokens (auth + sala)
      api.dispatch(logout());
      api.dispatch(limparSalaToken());

      // Limpar localStorage diretamente
      clearTokensFromStorage();
      if (typeof window !== 'undefined') {
         localStorage.removeItem('persist:root');
      }

      if (typeof window !== 'undefined') {
         const mensagem = requerLogin ? 'Sessão expirada' : 'Sessão inválida';

         toastError({
            title: mensagem,
            description: 'Você será redirecionado para o login em 2 segundos.',
         });

         setTimeout(() => {
            window.location.href = '/auth/login';
         }, 2000);
      }

      return result;
   }

   if (result.error) {
      if (isApiError(result.error)) {
         const errorResultado = result.error.data?.Resultado as
            | ResultadoComLimparToken
            | undefined;
         const limparToken = errorResultado?.limpar_token;
         if (limparToken === true) {
            api.dispatch(limparSalaToken());
         }

         return {
            error: {
               status: result.error.status ?? 400,
               data: {
                  Sucesso: false,
                  Mensagem: result.error.data?.Mensagem ?? 'Erro inesperado',
                  Detalhe: result.error.data?.Detalhe ?? '',
                  CodigoRetorno: result.error.status ?? 400,
                  Resultado: result.error.data?.Resultado ?? null,
               },
            },
         };
      }

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

   const data = result.data as ApiResponse<{
      limpar_token?: boolean;
   }>;

   if (data.Resultado?.limpar_token === true) {
      api.dispatch(limparSalaToken());
   }

   if (!data.Sucesso) {
      toastError({
         description: data.Mensagem || 'Operação não concluída.',
      });
      return {
         error: {
            status: data.CodigoRetorno ?? 400,
            data: data as ApiResponse<unknown>,
         },
      };
   }

   return { data };
};

export { baseQueryWithReauthAndInterceptor };
