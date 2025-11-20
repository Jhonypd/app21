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
  tokenAcesso: { token: string; dataExpiracao: Date };
  refreshToken: {
    token: string;
    dataExpiracao: Date;
  };
}

export interface ResponseCriarConta {
  id: string;
}

export interface ResponseConfirmacaoCodigo {
  id: string;
  contaConfirmada: boolean;
}

export interface EsqueciMinhaSenhaPayload {
  email: string;
}

export interface RedefinirSenhaPayload {
  codigo: string;
  novaSenha: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
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
