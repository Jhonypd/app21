import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface HistoriaSala {
  id: string;
  sala_id: string;
  titulo: string;
  descricao: string | null;
  criado_por: string;
  data_criacao: Date;
}

export interface CriarHistoriaPayload {
  salaId: string;
  titulo: string;
  descricao?: string;
}

export interface CriarVariasHistoriasPayload {
  salaId: string;
  historias: Array<{
    titulo: string;
    descricao?: string;
  }>;
}

export interface AtualizarHistoriaPayload {
  id: string;
  titulo?: string;
  descricao?: string;
}

export const HistoriasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /salas/:salaId/historias
    criarHistoria: builder.mutation<
      ApiResponse<{ historia: HistoriaSala }>,
      CriarHistoriaPayload
    >({
      query: ({ salaId, titulo, descricao }) => ({
        url: `/salas/${salaId}/historias`,
        method: 'POST',
        body: { titulo, descricao },
      }),
      invalidatesTags: ['historias', 'salaPlaning'],
    }),

    // POST /salas/:salaId/historias/lote
    criarVariasHistorias: builder.mutation<
      ApiResponse<{ total: number }>,
      CriarVariasHistoriasPayload
    >({
      query: ({ salaId, historias }) => ({
        url: `/salas/${salaId}/historias/lote`,
        method: 'POST',
        body: { historias },
      }),
      invalidatesTags: ['historias', 'salaPlaning'],
    }),

    // GET /salas/:salaId/historias
    listarHistorias: builder.query<
      ApiResponse<{ historias: HistoriaSala[] }>,
      string
    >({
      query: (salaId) => ({
        url: `/salas/${salaId}/historias`,
        method: 'GET',
      }),
      providesTags: ['historias'],
    }),

    // GET /historias/:id
    obterHistoria: builder.query<
      ApiResponse<{ historia: HistoriaSala }>,
      string
    >({
      query: (id) => ({
        url: `/historias/${id}`,
        method: 'GET',
      }),
    }),

    // PUT /historias/:id
    atualizarHistoria: builder.mutation<
      ApiResponse<{ historia: HistoriaSala }>,
      AtualizarHistoriaPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/historias/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['historias', 'salaPlaning'],
    }),

    // DELETE /historias/:id
    deletarHistoria: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/historias/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['historias', 'salaPlaning'],
    }),
  }),
});

export const {
  useCriarHistoriaMutation,
  useCriarVariasHistoriasMutation,
  useListarHistoriasQuery,
  useLazyListarHistoriasQuery,
  useObterHistoriaQuery,
  useLazyObterHistoriaQuery,
  useAtualizarHistoriaMutation,
  useDeletarHistoriaMutation,
} = HistoriasApi;
