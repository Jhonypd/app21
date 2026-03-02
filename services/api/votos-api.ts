import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type { VotarPayload, Voto } from '../types';

// Re-export dos tipos para compatibilidade
export type { VotarPayload, Voto };

export const VotosApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      // POST /sessoes/:id/votos
      votar: builder.mutation<ApiResponse, VotarPayload>({
         query: ({
            sessaoId,
            valor,
            historia_sessao_id,
            participa_votacao,
         }) => ({
            url: `/sessoes/${sessaoId}/votos`,
            method: 'POST',
            body: {
               valor,
               historia_sessao_id,
               participa_votacao,
            },
         }),
         invalidatesTags: ['votos', 'sessao'],
      }),

      // GET /sessoes/:id/votos
      obterVotos: builder.query<ApiResponse<{ votos: Voto[] }>, string>({
         query: (sessaoId) => ({
            url: `/sessoes/${sessaoId}/votos`,
            method: 'GET',
         }),
         providesTags: ['votos'],
         keepUnusedDataFor: 10,
      }),

      // DELETE /votos/:id - Anular voto
      anularVoto: builder.mutation<ApiResponse, string>({
         query: (votoId) => ({
            url: `/votos/${votoId}`,
            method: 'DELETE',
         }),
         invalidatesTags: ['votos', 'sessao'],
      }),
   }),
});

export const {
   useVotarMutation,
   useObterVotosQuery,
   useLazyObterVotosQuery,
   useAnularVotoMutation,
} = VotosApi;
