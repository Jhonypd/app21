import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface CriarContaPayload {
  nome: string;
  email: string;
  senha: string;
}

export interface NovoCodigoPayload {
  email: string;
}

export interface ConfirmacaoContaEmilPayload {
  codigo: string;
  confirmarConta: boolean;
}

export interface ResponseLogin {
  token: string;
  dataExpiracao: Date;
}

export interface ResponseCriarConta {
  id: string;
}

export interface ResponseConfirmacaoCodigo {
  id: string;
  contaConfirmada: boolean;
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
      CriarContaPayload
    >({
      query: (userData) => ({
        url: '/auth/criarConta',
        method: 'POST',
        body: userData,
      }),
    }),
    novoCodigo: builder.mutation<
      ApiResponse,
      NovoCodigoPayload
    >({
      query: (email) => ({
        url: '/auth/novoCodigo',
        method: 'POST',
        body: email,
      }),
    }),

    validaCodigoEmail: builder.mutation<
      ApiResponse<ResponseConfirmacaoCodigo>,
      ConfirmacaoContaEmilPayload
    >({
      query: () => ({
        url: '/auth/validaCodigoEmail',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useCriarContaMutation,
  useNovoCodigoMutation,
} = AuthApi;
