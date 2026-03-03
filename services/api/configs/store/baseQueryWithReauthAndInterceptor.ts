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
   getCsrfTokenFromStorage,
   setCsrfToken,
} from '@/services/api/configs/store/auth-slice';
import { limparSalaToken } from './sala-auth-slice';

let logoutEmAndamento: Promise<void> | null = null;

async function chamarLogoutBackend(csrfToken: string | null) {
   const headers: Record<string, string> = {
      Accept: 'application/json',
   };

   if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
   }

   await rawBaseQuery(
      {
         url: '/auth/refresh/revogar',
         method: 'POST',
         headers,
      },
      {} as Parameters<typeof rawBaseQuery>[1],
      {} as Parameters<typeof rawBaseQuery>[2],
   );
}

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
   const csrfToken = getCsrfTokenFromStorage();

   const headersObj: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
   };

   if (csrfToken) {
      headersObj['X-CSRF-Token'] = csrfToken;
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

   // Intercepta header X-CSRF-Token para renovação automática
   if (result.meta?.response?.headers) {
      const csrfHeader = result.meta.response.headers.get('X-CSRF-Token');
      if (csrfHeader) {
         api.dispatch(setCsrfToken(csrfHeader));
      }
   }

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
      if (!logoutEmAndamento) {
         logoutEmAndamento = (async () => {
            // Backend deve limpar cookies (access/refresh/csrf/token_sala)
            await chamarLogoutBackend(csrfToken);
         })().finally(() => {
            logoutEmAndamento = null;
         });
      }

      await logoutEmAndamento;

      // Limpar estado local após tentativa de logout no backend
      api.dispatch(logout());
      api.dispatch(limparSalaToken());

      if (typeof window !== 'undefined') {
         const mensagem = requerLogin ? 'Sessão expirada' : 'Sessão inválida';

         if (!window.location.pathname.startsWith('/auth/login')) {
            toastError({
               title: mensagem,
               description: 'Faça login novamente para continuar.',
            });

            window.location.replace('/auth/login');
         }
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
