import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface Salas {
  votos: {
    pessoa: {
      nome: string;
      id: string;
      inativo: boolean;
    };
    id: string;
    valor: number;
  }[];
  proprietario: {
    nome: string;
    id: string;
    inativo: boolean;
  };
  titulo: string;
  id: string;
  codigo: string;
  inativo: boolean;
  data_criacao: Date;
  data_alteracao: Date | null;
  participantes: {
    pessoa_id: string;
    pessoa: {
      id: string;
      inativo: boolean;
      nome: string;
    };
  }[];
  criado_por: string;
}

export interface LoginSalaPayload {
  codigo: string;
  senha?: string;
}

export interface CriarSalaPayload {
  titulo: string;
  senha?: string;
  salaPrivada: boolean;
}

export interface ListarSalasQuery {
  pagina: number;
  itensPagina: number;
}

export interface ResponseLoginSala {
  tokenSala: string;
  dataExpiracao: Date;
}

export interface ResponseCriarSala {
  id: string;
}

export const SalasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginSala: builder.mutation<
      ApiResponse<ResponseLoginSala>,
      LoginSalaPayload
    >({
      query: (credenciais) => ({
        url: '/salas/loginSala',
        method: 'POST',
        body: credenciais,
      }),
    }),

    criarSala: builder.mutation<
      ApiResponse<ResponseCriarSala>,
      CriarSalaPayload
    >({
      query: (salaData) => ({
        url: '/salas/inserir',
        method: 'POST',
        body: salaData,
      }),
    }),

    listarSalas: builder.query<
      ApiResponse<{ salas: Salas[] }>,
      ListarSalasQuery
    >({
      query: (params: ListarSalasQuery) => ({
        url: '/salas/listarSalas',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useLoginSalaMutation,
  useCriarSalaMutation,
  useListarSalasQuery,
  useLazyListarSalasQuery,
} = SalasApi;
