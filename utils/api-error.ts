import { ApiResponse } from '@/services/interfaces';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Tipo de erro padronizado para RTK Query
 * Compatível com FetchBaseQueryError mas com data tipada como ApiResponse
 */
export type ApiErrorTyped<T = unknown> = FetchBaseQueryError & {
   data: ApiResponse<T>;
};

/**
 * Interface legada para compatibilidade
 * @deprecated Use ApiErrorTyped
 */
export interface ApiError {
   data?: ApiResponse<unknown>;
   status?: number;
}

export interface ApiErroFormatado {
   Mensagem: string;
   Detalhe: string;
}

/**
 * Type guard para verificar se é um erro tipado da API
 */
export function isApiErrorTyped<T = unknown>(
   error: unknown,
): error is ApiErrorTyped<T> {
   return (
      typeof error === 'object' &&
      error !== null &&
      'data' in error &&
      typeof (error as Record<string, unknown>).data === 'object' &&
      (error as Record<string, unknown>).data !== null &&
      'Sucesso' in ((error as Record<string, unknown>).data as object)
   );
}

/**
 * Type guard legado
 * @deprecated Use isApiErrorTyped
 */
export function isApiError(error: unknown): error is ApiError {
   return (
      typeof error === 'object' &&
      error !== null &&
      'data' in error &&
      typeof (error as Record<string, unknown>).data === 'object'
   );
}

export function getApiErrorMessage(error: unknown): ApiErroFormatado {
   console.error('Erro detectado em getApiErrorMessage:', error);
   // Caso seja o erro padrão da API
   if (isApiErrorTyped(error)) {
      return {
         Mensagem: error.data?.Mensagem || 'Erro inesperado',
         Detalhe: error.data?.Detalhe || 'Erro inesperado',
      };
   }

   // Fallback para erro legado
   if (isApiError(error)) {
      return {
         Mensagem: error.data?.Mensagem || 'Erro inesperado',
         Detalhe: error.data?.Detalhe || 'Erro inesperado',
      };
   }

   // Caso seja um erro nativo JS
   if (error instanceof Error) {
      return {
         Mensagem: error.message,
         Detalhe: error.message,
      };
   }

   // Fallback para qualquer outra coisa
   return {
      Mensagem: 'Erro inesperado',
      Detalhe: 'Erro inesperado',
   };
}
