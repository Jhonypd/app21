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
  prepareHeaders: (headers) => {
    // Recupera token JWT do localStorage (de forma segura)
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
    if (token)
      headers.set('Authorization', `Bearer ${token}`);
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
    const status = result.error.status;
    const data: any = result.error.data;

    // Extrai mensagem padronizada do backend
    const mensagem =
      data?.Mensagem || data?.message || 'Erro inesperado.';
    const detalhe = data?.Detalhe
      ? ` (${data.Detalhe})`
      : '';

    // Evita toasts múltiplos em chamadas simultâneas (você pode aprimorar isso se quiser)
    toastError({
      description: `${mensagem}${detalhe}`,
    });

    // Retorna erro padronizado
    return {
      error: {
        ...result.error,
        message: mensagem,
        status,
      },
    };
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
