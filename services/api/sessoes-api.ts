import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface AdicionarParticipantePayload {
  sessaoId: string;
  pessoaId: string;
}

export interface AdicionarVisitantesPayload {
  salaId: string;
  pessoasIds: string[];
}

export interface RemoverVisitantePayload {
  salaId: string;
  pessoaId: string;
}

export interface Sessao {
  id: string;
  sala_id: string;
  historia_id: string | null;
  data_criacao: Date;
  data_encerramento: Date | null;
  votos_revelados: boolean;
  participantes: {
    id: string;
    pessoa_id: string;
    pessoa: {
      id: string;
      nome: string;
      email: string;
      inativo: boolean;
    };
  }[];
  votos: {
    id: string;
    pessoa_id: string;
    valor: number;
    pessoa: {
      id: string;
      nome: string;
      inativo: boolean;
    };
  }[];
}

export const SessoesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /sessoes/:id/participantes
    adicionarParticipanteSessao: builder.mutation<
      ApiResponse,
      AdicionarParticipantePayload
    >({
      query: ({ sessaoId, pessoaId }) => ({
        url: `/sessoes/${sessaoId}/participantes`,
        method: 'POST',
        body: { pessoaId },
      }),
      invalidatesTags: ['sessao'],
    }),

    // POST /sessoes/:id/revelar
    revelarVotos: builder.mutation<ApiResponse, string>({
      query: (sessaoId) => ({
        url: `/sessoes/${sessaoId}/revelar`,
        method: 'POST',
      }),
      invalidatesTags: ['sessao', 'votos'],
    }),

    // POST /sessoes/:id/resetar
    resetarVotos: builder.mutation<ApiResponse, string>({
      query: (sessaoId) => ({
        url: `/sessoes/${sessaoId}/resetar`,
        method: 'POST',
      }),
      invalidatesTags: ['sessao', 'votos'],
    }),

    // GET /sessoes/:id
    obterSessao: builder.query<
      ApiResponse<{ sessao: Sessao }>,
      string
    >({
      query: (sessaoId) => ({
        url: `/sessoes/${sessaoId}`,
        method: 'GET',
      }),
      providesTags: ['sessao'],
    }),

    // POST /salas/:id/sessoes/visitantes - Adicionar visitantes
    adicionarVisitantes: builder.mutation<
      ApiResponse,
      AdicionarVisitantesPayload
    >({
      query: ({ salaId, pessoasIds }) => ({
        url: `/salas/${salaId}/sessoes/visitantes`,
        method: 'POST',
        body: { pessoasIds },
      }),
      invalidatesTags: ['sessao'],
    }),

    // DELETE /salas/:id/sessoes/visitantes/:pessoaId - Remover visitante
    removerVisitante: builder.mutation<
      ApiResponse,
      RemoverVisitantePayload
    >({
      query: ({ salaId, pessoaId }) => ({
        url: `/salas/${salaId}/sessoes/visitantes/${pessoaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['sessao'],
    }),

    // POST /salas/:id/sessoes/encerrar - Encerrar sessão
    encerrarSessao: builder.mutation<ApiResponse, string>({
      query: (salaId) => ({
        url: `/salas/${salaId}/sessoes/encerrar`,
        method: 'POST',
      }),
      invalidatesTags: ['sessao', 'salaPlaning'],
    }),
  }),
});

export const {
  useAdicionarParticipanteSessaoMutation,
  useRevelarVotosMutation,
  useResetarVotosMutation,
  useObterSessaoQuery,
  useLazyObterSessaoQuery,
  useAdicionarVisitantesMutation,
  useRemoverVisitanteMutation,
  useEncerrarSessaoMutation,
} = SessoesApi;
