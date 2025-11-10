import {
  fetchBaseQuery,
  createApi,
} from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { toastError } from '@/components/custom-toast';

// Base query com interceptação global de erros
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(
    args,
    api,
    extraOptions,
  );

  if (result.error) {
    const data = result.error.data as
      | {
          Mensagem?: string;
          message?: string;
          Detalhe?: string;
        }
      | undefined;

    // Extrai mensagem padronizada do backend
    const mensagem =
      data?.Mensagem || data?.message || 'Erro inesperado.';
    const detalhe = data?.Detalhe
      ? ` (${data.Detalhe})`
      : '';

    // Evita toasts múltiplos em chamadas simultâneas
    toastError({
      description: `${mensagem}${detalhe}`,
    });

    return result;
  }

  return result;
};

// Slice base da API
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  tagTypes: [],
  endpoints: () => ({}),
});
