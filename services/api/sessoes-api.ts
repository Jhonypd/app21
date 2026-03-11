import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type {
   AdicionarParticipanteSessaoPayload,
   Sessao,
   // AtualizarParticipaVotacaoPayload,
   //  ObterVotosPorHistoriaResult,
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
   }),
});

export const {
   useAdicionarParticipanteSessaoMutation,
   useRevelarVotosMutation,
   useResetarVotosMutation,
   useObterSessaoQuery,
   useLazyObterSessaoQuery,
   // useAtualizarParticipaVotacaoMutation,
   // useObterVotosPorHistoriaQuery,
   // useLazyObterVotosPorHistoriaQuery,
   // useListarHistoriasSessaoQuery,
   // useLazyListarHistoriasSessaoQuery,
} = SessoesApi;
