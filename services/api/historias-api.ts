import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type { AdicionarOuRemoverHistoriaSessaoSalaPayload } from '../types';

export type { AdicionarOuRemoverHistoriaSessaoSalaPayload };

export const HistoriasApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      // POST /historias/adicionarOuRemoverHistoriaSessaoSala
      adicionarOuRemoverHistoriaSessaoSala: builder.mutation<
         ApiResponse<{ adicionadas: number; removidas: number }>,
         AdicionarOuRemoverHistoriaSessaoSalaPayload
      >({
         query: (body) => ({
            url: `/historias/adicionarOuRemoverHistoriaSessaoSala`,
            method: 'POST',
            body,
         }),
         invalidatesTags: ['historias', 'salaPlaning'],
      }),
   }),
});

export const { useAdicionarOuRemoverHistoriaSessaoSalaMutation } = HistoriasApi;
