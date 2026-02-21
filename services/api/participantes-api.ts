import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type { Participante } from '../types';

// Re-export do tipo para compatibilidade
export type { Participante };

// Payloads locais (diferentes dos de salas-api)
interface AdicionarParticipantePayload {
  salaId: string;
  pessoaId: string;
  permissao?: number;
}

interface RemoverParticipantePayload {
  salaId: string;
  pessoaId: string;
}

export const ParticipantesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /salas/:id/participantes - Adicionar participante permanente
    adicionarParticipante: builder.mutation<
      ApiResponse,
      AdicionarParticipantePayload
    >({
      query: ({ salaId, pessoaId, permissao }) => ({
        url: `/salas/${salaId}/participantes`,
        method: 'POST',
        body: { pessoaId, permissao },
      }),
      invalidatesTags: [
        'participantes',
        'salaPlaning',
        'listarSalas',
      ],
    }),

    // DELETE /salas/:id/participantes/:pessoaId - Remover participante permanente
    removerParticipante: builder.mutation<
      ApiResponse,
      RemoverParticipantePayload
    >({
      query: ({ salaId, pessoaId }) => ({
        url: `/salas/${salaId}/participantes/${pessoaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['participantes', 'salaPlaning'],
    }),

    // GET /salas/:id/participantes - Listar participantes permanentes
    listarParticipantes: builder.query<
      ApiResponse<{ participantes: Participante[] }>,
      string
    >({
      query: (salaId) => ({
        url: `/salas/${salaId}/participantes`,
        method: 'GET',
      }),
      providesTags: ['participantes'],
    }),
  }),
});

export const {
  useAdicionarParticipanteMutation,
  useRemoverParticipanteMutation,
  useListarParticipantesQuery,
  useLazyListarParticipantesQuery,
} = ParticipantesApi;
