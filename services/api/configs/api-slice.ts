import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauthAndInterceptor } from './store/baseQueryWithReauthAndInterceptor';

export const apiSlice = createApi({
   reducerPath: 'api',
   baseQuery: baseQueryWithReauthAndInterceptor,
   tagTypes: [
      'listarSalas',
      'salaPlaning',
      'sessao',
      'votos',
      'participantes',
      'visitantes',
      'pessoa',
      'historias',
   ],
   keepUnusedDataFor: 30,
   refetchOnReconnect: true,
   refetchOnFocus: true,

   endpoints: () => ({}),
});
