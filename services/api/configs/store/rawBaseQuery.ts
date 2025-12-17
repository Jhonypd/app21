import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { RootState } from '@/services/api/configs/store/store';

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  // ❌ REMOVIDO: credentials: 'include' - não precisamos que o backend envie cookies
  // Tokens são gerenciados via Redux + cookies do lado do cliente apenas
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth
      .accessToken;
    const refreshToken = (getState() as RootState).auth
      .refreshToken;
    const tokenSala = (getState() as RootState).salaAuth
      ?.tokenSala;

    console.log('🔍 [rawBaseQuery] Preparando headers:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasTokenSala: !!tokenSala,
      tokenPreview: token
        ? `${token.substring(0, 20)}...`
        : 'undefined',
      refreshTokenPreview: refreshToken
        ? `${refreshToken.substring(0, 20)}...`
        : 'undefined',
    });

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
