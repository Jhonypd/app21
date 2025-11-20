import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface Salas {
  titulo: string;
  id: string;
  codigo: string;
  inativo: boolean;
  data_criacao: Date;
  data_alteracao: Date | null;
  criado_por: string;
  privada: boolean;
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
  participantes: {
    pessoa_id: string;
    pessoa: {
      id: string;
      inativo: boolean;
      nome: string;
    };
  }[];
}

export interface LoginSalaPayload {
  codigo: string;
  senha?: string;
}

export interface CriarSalaPayload {
  titulo: string;
  senha?: string | null;
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

export interface SalaPorCodigo {
  sala: {
    proprietario: {
      id: string;
      inativo: boolean;
      nome: string;
    };
    historias: [
      {
        id: string;
        titulo: string;
        descricao: string;
      },
    ];
    participantes: [
      {
        id: string;
        nome: string;
        inativo: boolean;
      },
    ];
    votos: [
      {
        pessoa: {
          nome: string;
          inativo: boolean;
        };
        id: string;
        pessoa_id: string;
        valor: number;
      },
    ];
    titulo: string;
    senha: string | null;
    id: string;
    codigo: string;
    inativo: boolean;
    data_criacao: Date;
    data_alteracao: Date | null;
    criado_por: string;
  };
}

export interface AlterarSalaPayload {
  id: string;
  titulo?: string;
  senha?: string | null;
  salaPrivada?: boolean;
}

export interface DeletarSalaPayload {
  id: string;
}

export const SalasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    salaEntrar: builder.mutation<
      ApiResponse<ResponseLoginSala>,
      LoginSalaPayload
    >({
      query: (credenciais) => ({
        url: '/salas/entrar',
        method: 'POST',
        body: credenciais,
      }),
    }),

    sessaoSala: builder.mutation<ApiResponse, string>({
      query: (salaId) => ({
        url: `/salas/${salaId}/sessoes`,
        method: 'POST',
      }),
      invalidatesTags: ['salaPlaning'],
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
      invalidatesTags: ['listarSalas'],
    }),

    alterarSala: builder.mutation<
      ApiResponse,
      AlterarSalaPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/salas/alterar/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['listarSalas', 'salaPlaning'],
    }),

    deletarSala: builder.mutation<
      ApiResponse,
      DeletarSalaPayload
    >({
      query: ({ id }) => ({
        url: `/salas/delete`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['listarSalas'],
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
      providesTags: ['listarSalas'],
    }),

    obterSalaPorCodigo: builder.query<
      ApiResponse<SalaPorCodigo>,
      string
    >({
      query: (codigo: string) => ({
        url: `/salas/obterPorCodigo/${codigo}`,
        method: 'GET',
      }),
      providesTags: ['salaPlaning'],
    }),

    obterSalaPorId: builder.query<
      ApiResponse<SalaPorCodigo>,
      string
    >({
      query: (id: string) => ({
        url: `/salas/obterPorId/${id}`,
        method: 'GET',
      }),
      providesTags: ['salaPlaning'],
    }),
  }),
});

export const {
  useSalaEntrarMutation,
  useCriarSalaMutation,
  useAlterarSalaMutation,
  useDeletarSalaMutation,
  useListarSalasQuery,
  useLazyListarSalasQuery,
  useObterSalaPorCodigoQuery,
  useLazyObterSalaPorCodigoQuery,
  useObterSalaPorIdQuery,
  useLazyObterSalaPorIdQuery,
  useSessaoSalaMutation,
} = SalasApi;
