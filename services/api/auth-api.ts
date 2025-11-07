import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface LoginPayload {
  email: string;
  senha: string;
}

interface ResponseLogin {
  token: string;
  dataExpiracao: Date;
}

interface ResponseCriarConta {
  id: string;
}

export const AuthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<ResponseLogin>,
      LoginPayload
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    criarConta: builder.mutation<
      ApiResponse<ResponseCriarConta>,
      LoginPayload
    >({
      query: (userData) => ({
        url: '/auth/criarConta',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useCriarContaMutation } =
  AuthApi;
