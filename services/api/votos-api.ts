import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface VotarPayload {
  sessaoId: string;
  valor: number;
  historia_id?: string;
  participa_votacao?: boolean;
}

export interface Voto {
  id: string;
  sessao_id: string;
  pessoa_id: string;
  valor: number;
  data_voto: Date;
  pessoa: {
    id: string;
    nome: string;
    email: string;
    inativo: boolean;
  };
}

export const VotosApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /sessoes/:id/votos
    votar: builder.mutation<ApiResponse, VotarPayload>({
      query: ({
        sessaoId,
        valor,
        historia_id,
        participa_votacao,
      }) => ({
        url: `/sessoes/${sessaoId}/votos`,
        method: 'POST',
        body: { valor, historia_id, participa_votacao },
      }),
      invalidatesTags: ['votos', 'sessao'],
    }),

    // GET /sessoes/:id/votos
    obterVotos: builder.query<
      ApiResponse<{ votos: Voto[] }>,
      string
    >({
      query: (sessaoId) => ({
        url: `/sessoes/${sessaoId}/votos`,
        method: 'GET',
      }),
      providesTags: ['votos'],
    }),
  }),
});

export const {
  useVotarMutation,
  useObterVotosQuery,
  useLazyObterVotosQuery,
} = VotosApi;
