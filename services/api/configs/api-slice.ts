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
import { ApiResponse } from '@/services/interfaces';
interface ApiError {
  data?: ApiResponse;
  status?: number;
}
// Base query com interceptação global de erros
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    // headers.set('Accept', 'application/json');
    // headers.set('Authorization', 'Bearer token');
    console.log('API Request Headers:', headers);
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
  console.table(result);
  console.table(result.data);
  if (result.error) {
    const data = (result.error as ApiError).data;

    const mensagem =
      data?.Mensagem ||
      'Erro inesperado ao processar sua requisição.';

    const detalhe = data?.Detalhe
      ? ` (${data.Detalhe})`
      : '';

    toastError({
      description: `${mensagem}${detalhe}`,
    });

    return result;
  }

  const data = result.data as ApiResponse;

  if (!data.Sucesso) {
    toastError({
      description:
        data.Mensagem || 'Operação não concluída.',
    });
    // mantém consistência no formato de erro
    return {
      error: {
        status: data.CodigoRetorno ?? 400,
        data,
      } as FetchBaseQueryError,
    };
  }
  return { data };
};

// Slice base da API
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  tagTypes: [],
  endpoints: () => ({}),
});
