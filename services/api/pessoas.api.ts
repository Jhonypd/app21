import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type {
   DadosContaPessoa,
   DadosPessoaResumo,
   AlterarPessoaPayload,
} from '../types';

// Re-export dos tipos para compatibilidade
export type { DadosContaPessoa, DadosPessoaResumo, AlterarPessoaPayload };

export const PessoasApi = apiSlice.injectEndpoints({
   endpoints: (builder) => ({
      obterDadosConta: builder.query<
         ApiResponse<{ pessoa: DadosContaPessoa }>,
         void
      >({
         query: () => ({
            url: '/pessoas/obterDadosConta',
            method: 'GET',
            credentials: 'include',
         }),
         providesTags: ['pessoa'],
      }),

      obterDadosAlterar: builder.query<
         ApiResponse<{ pessoa: DadosContaPessoa }>,
         void
      >({
         query: () => ({
            url: '/pessoas/obterDadosAlterar',
            method: 'GET',
         }),
      }),

      alterarPessoa: builder.mutation<ApiResponse, AlterarPessoaPayload>({
         query: ({ id, ...body }) => ({
            url: `/pessoas/alterar/${id}`,
            method: 'PUT',
            body,
         }),
         invalidatesTags: ['pessoa'],
      }),

      pesquisarPorNomeOuEmail: builder.query<
         ApiResponse<{ pessoas: DadosPessoaResumo[] }>,
         { termo: string }
      >({
         query: ({ termo }) => ({
            url: `/pessoas/listarPorNomeOuEmail?termo=${encodeURIComponent(termo)}`,
            method: 'GET',
         }),
      }),
   }),
});

export const {
   useLazyObterDadosContaQuery,
   useObterDadosContaQuery,
   useObterDadosAlterarQuery,
   useLazyObterDadosAlterarQuery,
   useAlterarPessoaMutation,
   useLazyPesquisarPorNomeOuEmailQuery,
   usePesquisarPorNomeOuEmailQuery,
} = PessoasApi;
