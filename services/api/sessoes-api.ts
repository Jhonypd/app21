import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type {
   AdicionarParticipanteSessaoPayload,
   Sessao,
   AtualizarParticipaVotacaoPayload,
   ObterVotosPorHistoriaPayload,
   VotosPorHistoriaResponse,
   //  ObterVotosPorHistoriaResult,
   ListarHistoriasSessaoResponse,
} from '../types';

// Re-export dos tipos para compatibilidade
export type { Sessao };

export const SessoesApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      // POST /sessoes/:id/participantes
      adicionarParticipanteSessao: builder.mutation<
         ApiResponse,
         AdicionarParticipanteSessaoPayload
      >({
         query: ({ sessaoId, pessoaId }) => ({
            url: `/sessoes/${sessaoId}/participantes`,
            method: 'POST',
            body: { pessoa_id: pessoaId },
         }),
         invalidatesTags: ['sessao', 'salaPlaning'],
      }),

      // POST /sessoes/:id/revelar
      revelarVotos: builder.mutation<ApiResponse, string>({
         query: (sessaoId) => ({
            url: `/sessoes/${sessaoId}/revelar`,
            method: 'POST',
         }),
         invalidatesTags: ['sessao', 'votos', 'salaPlaning'],
      }),

      // POST /sessoes/:id/resetar
      resetarVotos: builder.mutation<ApiResponse, string>({
         query: (sessaoId) => ({
            url: `/sessoes/${sessaoId}/resetar`,
            method: 'POST',
         }),
         invalidatesTags: ['sessao', 'votos', 'salaPlaning'],
      }),

      // GET /sessoes/:id
      obterSessao: builder.query<ApiResponse<{ sessao: Sessao }>, string>({
         query: (sessaoId) => ({
            url: `/sessoes/${sessaoId}`,
            method: 'GET',
         }),
         providesTags: ['sessao', 'salaPlaning'],
      }),

      // POST /salas/:id/sessoes/encerrar - Encerrar sessão
      encerrarSessao: builder.mutation<ApiResponse, string>({
         query: (salaId) => ({
            url: `/salas/${salaId}/sessoes/encerrar`,
            method: 'POST',
         }),
         invalidatesTags: ['sessao', 'salaPlaning'],
      }),

      // PATCH /sessoes/:id/participa-votacao - Atualizar flag de participação
      atualizarParticipaVotacao: builder.mutation<
         ApiResponse,
         AtualizarParticipaVotacaoPayload
      >({
         query: ({ sessaoId, participaVotacao }) => ({
            url: `/sessoes/${sessaoId}/participa-votacao`,
            method: 'PATCH',
            body: { participa_votacao: participaVotacao },
         }),
         invalidatesTags: ['salaPlaning'],
      }),

      // GET /historias/listarHistoriasPorSessaoSala/:sessaoId
      listarHistoriasSessao: builder.query<
         ApiResponse<ListarHistoriasSessaoResponse>,
         string
      >({
         query: (sessaoId) => ({
            url: `/historias/listarHistoriasPorSessaoSala/${sessaoId}`,
            method: 'GET',
         }),
         providesTags: ['historias'],
      }),
   }),
});

export const {
   useAdicionarParticipanteSessaoMutation,
   useRevelarVotosMutation,
   useResetarVotosMutation,
   useObterSessaoQuery,
   useLazyObterSessaoQuery,
   useEncerrarSessaoMutation,
   useAtualizarParticipaVotacaoMutation,
   // useObterVotosPorHistoriaQuery,
   // useLazyObterVotosPorHistoriaQuery,
   useListarHistoriasSessaoQuery,
   useLazyListarHistoriasSessaoQuery,
} = SessoesApi;
