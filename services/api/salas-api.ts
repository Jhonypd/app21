import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface Salas {
  id: string;
  titulo: string;
  codigo: string;
  inativo: boolean;
  salaPrivada: boolean; // Se a sala possui senha
  data_criacao: Date;
  proprietario: {
    id: string;
    nome: string;
    inativo: boolean;
  };
  membros: number; // Quantidade de membros
  meuRole?: number | null; // 0=Dono, 1=Admin, 2=Membro, null=não participante
  temSessaoAtiva: boolean; // Se possui sessão ativa
  status: 'online' | null; // 'online' se tem sessão ativa com participantes
  data_ultima_sessao: Date | null; // Data da última sessão ativa
}

export interface SalaParaEdicao {
  id: string;
  titulo: string;
  salaPrivada: boolean;
  participantes: Array<{
    id: string;
    nome: string;
    inativo: boolean;
    role: number; // 0=Dono, 1=Admin, 2=Membro
  }>;
}

export interface LoginSalaPayload {
  codigo: string;
  senha?: string;
  visitantes?: string[]; // IDs dos visitantes temporários (apenas para dono)
}

export interface CriarSalaPayload {
  titulo: string;
  senha?: string | null;
  salaPrivada: boolean;
  participantesIds?: string[]; // IDs dos participantes permanentes (role 2)
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

export interface AdicionarParticipantePayload {
  sala_id: string;
  pessoa_id: string;
  role: 1 | 2; // 1=Admin, 2=Membro
}

export interface RemoverParticipantePayload {
  sala_id: string;
  pessoa_id: string;
}

export interface AlterarRoleParticipantePayload {
  sala_id: string;
  pessoa_id: string;
  role: 1 | 2; // 1=Admin, 2=Membro
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
      invalidatesTags: ['salaPlaning'], // Invalidar para recarregar dados da sala
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

    obterSalaParaEdicao: builder.query<
      ApiResponse<{ sala: SalaParaEdicao }>,
      string
    >({
      query: (id: string) => ({
        url: `/salas/${id}/editar`,
        method: 'GET',
      }),
      providesTags: ['participantes'],
    }),

    adicionarParticipante: builder.mutation<
      ApiResponse,
      AdicionarParticipantePayload
    >({
      query: ({ sala_id, pessoa_id, role }) => ({
        url: `/salas/${sala_id}/participantes/adicionar`,
        method: 'POST',
        body: { pessoa_id, role },
      }),
      invalidatesTags: ['participantes'],
    }),

    removerParticipante: builder.mutation<
      ApiResponse,
      RemoverParticipantePayload
    >({
      query: ({ sala_id, pessoa_id }) => ({
        url: `/salas/${sala_id}/participantes/${pessoa_id}/remover`,
        method: 'DELETE',
      }),
      invalidatesTags: ['participantes'],
    }),

    alterarRoleParticipante: builder.mutation<
      ApiResponse,
      AlterarRoleParticipantePayload
    >({
      query: ({ sala_id, pessoa_id, role }) => ({
        url: `/salas/${sala_id}/participantes/${pessoa_id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['participantes'],
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
  useLazyObterSalaParaEdicaoQuery,
  useAdicionarParticipanteMutation,
  useRemoverParticipanteMutation,
  useAlterarRoleParticipanteMutation,
} = SalasApi;
