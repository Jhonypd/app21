import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// Tipo do meta retornado pelo rawBaseQuery
export interface RawBaseQueryMeta {
  response?: Response;
  request?: { headers: HeadersInit };
}

// fetch NATIVO para controle total dos headers
// O fetchBaseQuery do RTK Query estava ignorando/mesclando headers de forma incorreta
export const rawBaseQuery: BaseQueryFn<
  FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  RawBaseQueryMeta
> = async (args) => {
  const { url, method = 'GET', body, headers } = args;

  const fullUrl = `${baseUrl}${url}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: headers as HeadersInit,
      body: body ? JSON.stringify(body) : undefined,
      // 🔥 REMOVIDO credentials: 'include' - não usamos cookies para auth
      // Isso estava enviando cookies antigos junto com as requisições
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          status: response.status,
          data: data,
        } as FetchBaseQueryError,
        meta: {
          response,
          request: { headers: headers as HeadersInit },
        },
      };
    }

    return {
      data,
      meta: {
        response,
        request: { headers: headers as HeadersInit },
      },
    };
  } catch (error) {
    return {
      error: {
        status: 'FETCH_ERROR',
        error: String(error),
      } as FetchBaseQueryError,
    };
  }
};
