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
import type { RootState } from '@/services/api/configs/store/store';

export type ApiError = FetchBaseQueryError & {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ApiResponse<any>;
};

interface RefreshResponseShape {
  Resultado?: {
    tokenAcesso?: { token: string };
    refreshToken?: { token: string };
  };
}

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

  const error = result.error;
  const status =
    isApiError(error) && typeof error.status === 'number'
      ? error.status
      : undefined;

  const isRefreshCall =
    typeof args === 'string'
      ? args === '/auth/refresh'
      : (args as FetchArgs).url === '/auth/refresh';

  if (
    (status === 401 || status === 403) &&
    !isRefreshCall
  ) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    console.log('refreshResult', refreshResult);

    const refreshError = refreshResult.error;
    const refreshStatus =
      isApiError(refreshError) &&
      typeof refreshError.status === 'number'
        ? refreshError.status
        : undefined;

    if (
      refreshStatus === 401 ||
      refreshStatus === 403 ||
      !refreshResult.data
    ) {
      api.dispatch(logout());

      if (typeof window !== 'undefined') {
        toastError({
          description:
            'Não foi possível renovar a autenticação. Você será redirecionado para a tela de login em 5 segundos.',
        });
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 5000);
      }

      return result;
    }

    const payload =
      refreshResult.data as RefreshResponseShape;

    const novoAccess =
      payload.Resultado?.tokenAcesso?.token;
    const novoRefresh =
      payload.Resultado?.refreshToken?.token;

    if (!novoAccess) {
      api.dispatch(logout());
      if (typeof window !== 'undefined') {
        toastError({
          description:
            'Não foi possível renovar a autenticação. Você será redirecionado para a tela de login em 5 segundos.',
        });
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 5000);
      }
      return result;
    }

    api.dispatch(
      setCredentials({
        accessToken: novoAccess,
        refreshToken: novoRefresh ?? refreshToken,
      }),
    );

    await new Promise((r) => setTimeout(r, 0));

    result = await rawBaseQuery(args, api, extraOptions);
  }

  if (result.error) {
    if (isApiError(result.error)) {
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
            Resultado: null,
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

  const data = result.data as ApiResponse;

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
