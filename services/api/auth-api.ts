import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type {
  LoginPayload,
  CriarContaPayload,
  NovoCodigoPayload,
  ConfirmacaoContaEmailPayload,
  EsqueciMinhaSenhaPayload,
  RedefinirSenhaPayload,
  RefreshTokenPayload,
  ResponseLogin,
  ResponseCriarConta,
  ResponseConfirmacaoCodigo,
} from '../types';

// Re-export dos tipos para compatibilidade
export type {
  LoginPayload,
  CriarContaPayload,
  NovoCodigoPayload,
  ConfirmacaoContaEmailPayload,
  EsqueciMinhaSenhaPayload,
  RedefinirSenhaPayload,
  RefreshTokenPayload,
  ResponseLogin,
  ResponseCriarConta,
  ResponseConfirmacaoCodigo,
};

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
      ConfirmacaoContaEmailPayload
    >({
      query: (params) => ({
        url: `/auth/validaCodigoEmail?codigo=${params.codigo}&confirmarConta=${params.confirmarConta}`,
        method: 'GET',
      }),
    }),

    esqueciMinhaSenha: builder.mutation<
      ApiResponse,
      EsqueciMinhaSenhaPayload
    >({
      query: (payload) => ({
        url: '/auth/esqueciMinhaSenha',
        method: 'POST',
        body: payload,
      }),
    }),

    redefinirSenha: builder.mutation<
      ApiResponse,
      RedefinirSenhaPayload
    >({
      query: (payload) => ({
        url: '/auth/redefinirSenha',
        method: 'PUT',
        body: payload,
      }),
    }),

    refreshToken: builder.mutation<
      ApiResponse<ResponseLogin>,
      RefreshTokenPayload
    >({
      query: (payload) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: payload,
      }),
    }),

    revogarRefreshToken: builder.mutation<
      ApiResponse,
      RefreshTokenPayload
    >({
      query: (payload) => ({
        url: '/auth/refresh/revogar',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useCriarContaMutation,
  useNovoCodigoMutation,
  useValidaCodigoEmailMutation,
  useEsqueciMinhaSenhaMutation,
  useRedefinirSenhaMutation,
  useRefreshTokenMutation,
  useRevogarRefreshTokenMutation,
} = AuthApi;
