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
  status: 'online' | 'offline'; // 'online' se tem sessão ativa com participantes
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
}

export interface CriarSalaPayload {
  titulo: string;
  senha?: string;
  salaPrivada: boolean;
  participantesIds?: string[]; // IDs dos participantes permanentes (role 2)
}

export interface CriarSessaoPayload {
  salaId: string;
  visitantes?: string[]; // IDs dos visitantes temporários
  historias?: Array<{ titulo: string; descricao?: string }>; // Histórias para vincular à sessão
}

export interface ListarSalasQuery {
  pagina: number;
  itensPagina: number;
}

export interface ResponseLoginSala {
  tokenSala: string;
  dataExpiracao: Date;
  role: number;
  sessaoId?: string;
}

export interface ResponseCriarSala {
  id: string;
}

export interface SessaoAtiva {
  id: string;
  criada_em: Date;
  ativa: boolean;
  iniciada_por: string; // ID da pessoa que iniciou a sessão
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
        role: number; // 0=Dono, 1=Admin, 2=Membro, 3=Visitante
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
    historia_atual_id: string | null;
    votos_revelados: boolean;
    sessaoAtiva?: SessaoAtiva; // Dados da sessão ativa
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

export interface AdicionarVisitantePayload {
  sala_id: string;
  sessao_id: string;
  pessoa_id: string;
  autorizado?: boolean; // Se o voto do visitante conta (padrão false)
}

export interface RemoverVisitantePayload {
  sala_id: string;
  sessao_id: string;
  pessoa_id: string;
}

export interface ListarVisitantesPayload {
  sala_id: string;
  sessao_id: string;
}

export interface Visitante {
  id: string;
  pessoa_id: string;
  autorizado: boolean;
  pessoa?: {
    id: string;
    nome: string;
    email: string;
    inativo: boolean;
  };
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
      providesTags: ['listarSalas', 'listarSalas'],
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
      invalidatesTags: ['participantes', 'listarSalas'],
    }),

    removerParticipante: builder.mutation<
      ApiResponse,
      RemoverParticipantePayload
    >({
      query: ({ sala_id, pessoa_id }) => ({
        url: `/salas/${sala_id}/participantes/${pessoa_id}/remover`,
        method: 'DELETE',
      }),
      invalidatesTags: ['participantes', 'listarSalas'],
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

    // POST /salas/:id/sessoes - Criar nova sessão
    criarSessao: builder.mutation<
      ApiResponse,
      CriarSessaoPayload
    >({
      query: ({ salaId, visitantes, historias }) => ({
        url: `/salas/${salaId}/sessoes`,
        method: 'POST',
        body: {
          ...(visitantes && visitantes.length > 0
            ? { visitantes }
            : {}),
          ...(historias && historias.length > 0
            ? { historias }
            : {}),
        },
      }),
      invalidatesTags: ['salaPlaning', 'visitantes'],
    }),

    // GET /salas/codigo/:codigo/sessao-ativa - Obter dados da sessão ativa
    obterDadosSessaoAtiva: builder.query<
      ApiResponse<SalaPorCodigo>,
      string
    >({
      query: (codigo: string) => ({
        url: `/salas/codigo/${codigo}/sessao-ativa`,
        method: 'GET',
      }),
      providesTags: ['salaPlaning'],
    }),

    // POST /salas/:id/sair - Sair da sala (marca offline e limpa autorização)
    sairDaSala: builder.mutation<ApiResponse, string>({
      query: (salaId) => ({
        url: `/salas/${salaId}/sair`,
        method: 'POST',
      }),
      invalidatesTags: ['salaPlaning', 'listarSalas'],
    }),

    // PUT /salas/:id/historia-atual - Selecionar história atual
    selecionarHistoriaAtual: builder.mutation<
      ApiResponse,
      { salaId: string; historiaId: string }
    >({
      query: ({ salaId, historiaId }) => ({
        url: `/salas/${salaId}/historia-atual`,
        method: 'PUT',
        body: { historia_id: historiaId },
      }),
      invalidatesTags: ['salaPlaning'],
      // Forçar bypass de cache para garantir que sempre usa tokens atuais
      extraOptions: {
        maxRetries: 0, // Sem retry automático
      },
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
  useCriarSessaoMutation,
  useObterDadosSessaoAtivaQuery,
  useLazyObterDadosSessaoAtivaQuery,
  useSairDaSalaMutation,
  useSelecionarHistoriaAtualMutation,
} = SalasApi;
