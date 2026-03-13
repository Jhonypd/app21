import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type {
   ObterVotosPorHistoriaPayload,
   VotarPayload,
   Voto,
   VotosPorHistoriaResponse,
} from '../types';

// Re-export dos tipos para compatibilidade
export type { VotarPayload, Voto };

export const VotosApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      // POST /votos/votar
      votar: builder.mutation<ApiResponse, VotarPayload>({
         query: ({ valor, historia_id, participa_votacao }) => ({
            url: `/votos/votar`,
            method: 'POST',
            body: {
               valor,
               historia_id,
               participa_votacao,
            },
         }),
         invalidatesTags: ['votos', 'sessao'],
      }),

      obterVotosPorHistoriaSessaoSessaoSala: builder.query<
         ApiResponse<VotosPorHistoriaResponse>,
         ObterVotosPorHistoriaPayload
      >({
         query: ({ sessaoId, historiaId }) => ({
            url: `/votos/obterVotosPorHistoriaSessaoSessaoSala`,
            method: 'GET',
            credentials: 'include',
            headers: {
               sessao_sala_id: sessaoId,
               historia_id: historiaId,
            },
         }),
         providesTags: ['votos'],
      }),

      // DELETE /votos/deletarVotoPessoa?id={id} - Anular voto
      anularVoto: builder.mutation<ApiResponse, string>({
         query: (votoId) => ({
            url: `/votos/deletarVotoPessoa?id=${votoId}`,
            method: 'DELETE',
         }),
         invalidatesTags: ['votos', 'sessao'],
      }),
   }),
});

export const {
   useVotarMutation,
   useAnularVotoMutation,
   useObterVotosPorHistoriaSessaoSessaoSalaQuery,
   useLazyObterVotosPorHistoriaSessaoSessaoSalaQuery,
} = VotosApi;
