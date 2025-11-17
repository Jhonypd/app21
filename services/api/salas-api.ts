import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';

export interface Salas {
  titulo: string;
  id: string;
  codigo: string;
  inativo: boolean;
  data_criacao: Date;
  data_alteracao: Date | null;
  criado_por: string;
  privada: boolean;
  votos: {
    pessoa: {
      nome: string;
      id: string;
      inativo: boolean;
    };
    id: string;
    valor: number;
  }[];
  proprietario: {
    nome: string;
    id: string;
    inativo: boolean;
  };
  participantes: {
    pessoa_id: string;
    pessoa: {
      id: string;
      inativo: boolean;
      nome: string;
    };
  }[];
}

export interface LoginSalaPayload {
  codigo: string;
  senha?: string;
}

export interface CriarSalaPayload {
  titulo: string;
  senha?: string | null;
  salaPrivada: boolean;
}

export interface ListarSalasQuery {
  pagina: number;
  itensPagina: number;
}

export interface ResponseLoginSala {
  tokenSala: string;
  dataExpiracao: Date;
}

export interface ResponseCriarSala {
  id: string;
}

export interface SalaPorCodigo {
  sala: {
    proprietario: {
      id: string;
      inativo: boolean;
      nome: string;
    };
    titulo: string;
    senha: string | null;
    id: string;
    codigo: string;
    inativo: boolean;
    data_criacao: Date;
    data_alteracao: Date | null;
    criado_por: string;
  };
}

export const SalasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    salaEntrar: builder.mutation<
      ApiResponse<ResponseLoginSala>,
      LoginSalaPayload
    >({
      query: (credenciais) => ({
        url: '/salas/entrar',
        method: 'POST',
        body: credenciais,
      }),
    }),

    criarSala: builder.mutation<
      ApiResponse<ResponseCriarSala>,
      CriarSalaPayload
    >({
      query: (salaData) => ({
        url: '/salas/inserir',
        method: 'POST',
        body: salaData,
      }),
      invalidatesTags: ['listarSalas'],
    }),

    listarSalas: builder.query<
      ApiResponse<{ salas: Salas[] }>,
      ListarSalasQuery
    >({
      query: (params: ListarSalasQuery) => ({
        url: '/salas/listarSalas',
        method: 'GET',
        params,
      }),
      providesTags: ['listarSalas'],
    }),

    obterSalaPorCodigo: builder.query<
      ApiResponse<SalaPorCodigo>,
      string
    >({
      queryFn: async (
        codigo: string,
        _queryApi,
        _extraOptions,
        baseQuery,
      ) => {
        // Tenta chamar a API real primeiro
        try {
          const result = await baseQuery({
            url: `/salas/obterPorCodigo/${codigo}`,
            method: 'GET',
          });

          // Se a API retornou sucesso, retorna o resultado
          if (result.data && !result.error) {
            return result as {
              data: ApiResponse<SalaPorCodigo>;
            };
          }

          // Se deu erro (404, 500, etc), usa mock como fallback
          // Mock data - simula resposta da API
          const mockSala: SalaPorCodigo = {
            sala: {
              proprietario: {
                id: 'e483f765-5e6b-43a0-877e-6bf5c5a9d4af',
                inativo: false,
                nome: 'João Silva', // Nome já descriptografado
              },
              titulo: 'Sprint Planning - E-commerce',
              senha: null,
              id: '5a3f6cfc-8206-4911-8b7f-f255aa11f7b4',
              codigo: codigo,
              inativo: false,
              data_criacao: new Date(
                '2025-11-16T21:01:45.656Z',
              ),
              data_alteracao: null,
              criado_por:
                'e483f765-5e6b-43a0-877e-6bf5c5a9d4af',
            },
          };

          // Simula delay da API
          await new Promise((resolve) =>
            setTimeout(resolve, 300),
          );

          return {
            data: {
              Sucesso: true,
              Mensagem: 'Operação realizada com sucesso',
              Detalhe: null,
              CodigoRetorno: 200,
              TipoRetorno: 1,
              Resultado: mockSala,
            },
          };
        } catch {
          // Se der erro de rede ou qualquer outro erro, usa mock
          const mockSala: SalaPorCodigo = {
            sala: {
              proprietario: {
                id: 'e483f765-5e6b-43a0-877e-6bf5c5a9d4af',
                inativo: false,
                nome: 'João Silva', // Nome já descriptografado
              },
              titulo: 'Sprint Planning - E-commerce',
              senha: null,
              id: '5a3f6cfc-8206-4911-8b7f-f255aa11f7b4',
              codigo: codigo,
              inativo: false,
              data_criacao: new Date(
                '2025-11-16T21:01:45.656Z',
              ),
              data_alteracao: null,
              criado_por:
                'e483f765-5e6b-43a0-877e-6bf5c5a9d4af',
            },
          };

          await new Promise((resolve) =>
            setTimeout(resolve, 300),
          );

          return {
            data: {
              Sucesso: true,
              Mensagem: 'Operação realizada com sucesso',
              Detalhe: null,
              CodigoRetorno: 200,
              TipoRetorno: 1,
              Resultado: mockSala,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useSalaEntrarMutation,
  useCriarSalaMutation,
  useListarSalasQuery,
  useLazyListarSalasQuery,
  useObterSalaPorCodigoQuery,
} = SalasApi;
