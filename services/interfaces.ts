import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ApiResponse<T = unknown> {
  Resultado: T | null;
  Sucesso: boolean;
  Mensagem: string | null;
  Detalhe: string | null;
  CodigoRetorno: number;
  TipoRetorno: number;
}

/**
 * Tipo de erro padronizado para RTK Query
 * Use com o `error` retornado pelos hooks de query/mutation
 * 
 * @example
 * const { error } = useMinhaQuery();
 * if (error && 'data' in error) {
 *   const apiError = error as ApiQueryError;
 *   console.log(apiError.data.Mensagem);
 * }
 */
export type ApiQueryError<T = unknown> = FetchBaseQueryError & {
  data: ApiResponse<T>;
};

/**
 * Helper para extrair o tipo de erro de uma query/mutation
 * Útil para componentes que precisam do tipo do erro
 */
export type ExtractApiError<T> = T extends { error: infer E } ? E : never;

