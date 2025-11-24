import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { RootState } from '@/services/api/configs/store/store';

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth
      .accessToken;
    const refreshToken = (getState() as RootState).auth
      .refreshToken;
    const tokenSala = (getState() as RootState).salaAuth
      ?.tokenSala;

    // Headers padrão
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    // Tokens de autenticação
    if (token)
      headers.set('Authorization', `Bearer ${token}`);
    if (refreshToken)
      headers.set('X-Refresh-Token', refreshToken); // Enviar refresh em toda requisição
    if (tokenSala) headers.set('x-token-sala', tokenSala);

    return headers;
  },
});
