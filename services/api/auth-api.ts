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

export interface ResponseLogin {
  token: string;
  dataExpiracao: Date;
}

export interface ResponseCriarConta {
  id: string;
}
// export interface ResponseNovoCodigo {

// }

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
  }),
});

export const {
  useLoginMutation,
  useCriarContaMutation,
  useNovoCodigoMutation,
} = AuthApi;
