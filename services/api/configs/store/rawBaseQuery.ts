import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { RootState } from '@/services/api/configs/store/store';

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth
      .accessToken;
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    if (token)
      headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});
