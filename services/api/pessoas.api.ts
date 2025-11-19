import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface DadosContaPessoa {
  id: string;
  nome: string;
  email: string;
  inativo: boolean;
  email_confirmado: boolean;
}

export interface DadosPessoaResumo {
  id: string;
  nome: string;
  email: string;
}

export const PessoasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    obterDadosConta: builder.query<
      ApiResponse<{ pessoa: DadosContaPessoa }>,
      void
    >({
      query: () => ({
        url: '/pessoas/obterDadosConta',
        method: 'GET',
      }),
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
  useLazyPesquisarPorNomeOuEmailQuery,
  usePesquisarPorNomeOuEmailQuery,
} = PessoasApi;
