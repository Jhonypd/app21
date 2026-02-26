import {
   BaseQueryFn,
   FetchArgs,
   FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export interface RawBaseQueryMeta {
   response?: Response;
   request?: { headers: HeadersInit };
}

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
         credentials: 'include',
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
