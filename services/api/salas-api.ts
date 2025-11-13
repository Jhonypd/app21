import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface Salas {
  id: string;
  codigo: number;
  titulo: string;
  criado_por: string;
  data_criacao: Date;
  data_alteracao: Date;
  inativo: boolean;
  votos: [];
  proprietario: {
    id: string;
    nome: string;
    inativo: boolean;
  };
  participantes: [];
}

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

export const SalasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<ResponseLogin>,
      LoginPayload
    >({
      query: () => ({
        url: '/salas/listarSalas',
        method: 'GET',
      }),
    }),

    criarConta: builder.mutation<
      ApiResponse<ResponseCriarConta>,
      CriarContaPayload
    >({
      query: (userData) => ({
        url: '/salas/criarConta',
        method: 'POST',
        body: userData,
      }),
    }),
    novoCodigo: builder.mutation<
      ApiResponse,
      NovoCodigoPayload
    >({
      query: (email) => ({
        url: '/salas/novoCodigo',
        method: 'POST',
        body: email,
      }),
    }),

    validaCodigoEmail: builder.mutation<
      ApiResponse<ResponseConfirmacaoCodigo>,
      ConfirmacaoContaEmilPayload
    >({
      query: () => ({
        url: '/salas/validaCodigoEmail',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useCriarContaMutation,
  useNovoCodigoMutation,
} = SalasApi;
