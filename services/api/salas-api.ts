import { ApiResponse } from '../interfaces';
import { apiSlice } from './configs/api-slice';
import type {
   Salas,
   SalaParaEdicao,
   LoginSalaPayload,
   CriarSalaPayload,
   CriarSessaoPayload,
   ListarSalasQuery,
   ResponseLoginSala,
   ResponseCriarSala,
   SalaPorCodigo,
   AlterarSalaPayload,
   DeletarSalaPayload,
   AdicionarParticipanteSalaPayload,
   RemoverParticipanteSalaPayload,
   AlterarRoleParticipantePayload,
   ListarParticipantesSalaResponse,
   ListarParticipantesSalaPayload,
   AdicionarVisitantePayload,
   RemoverVisitantePayload,
   AdicionarParticipanteOuVisitantePayload,
} from '../types';

// Re-export dos tipos para manter compatibilidade com imports existentes
export type {
   Salas,
   SalaParaEdicao,
   LoginSalaPayload,
   CriarSalaPayload,
   CriarSessaoPayload,
   ListarSalasQuery,
   ResponseLoginSala,
   ResponseCriarSala,
   SalaPorCodigo,
   AlterarSalaPayload,
   DeletarSalaPayload,
   ListarParticipantesSalaResponse,
   ListarParticipantesSalaPayload,
   AdicionarVisitantePayload,
   RemoverVisitantePayload,
   AdicionarParticipanteOuVisitantePayload,
};

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
         extraOptions: { maxRetries: 0 },
         invalidatesTags: ['salaPlaning'],
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

      alterarSala: builder.mutation<ApiResponse, AlterarSalaPayload>({
         query: ({ id, ...body }) => ({
            url: `/salas/alterar/${id}`,
            method: 'PUT',
            body,
         }),
         invalidatesTags: ['listarSalas', 'salaPlaning'],
      }),

      deletarSala: builder.mutation<ApiResponse, DeletarSalaPayload>({
         query: ({ id }) => ({
            url: `/salas/delete`,
            method: 'DELETE',
            body: { id },
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
            credentials: 'include',
         }),
         providesTags: ['salaPlaning'],
      }),

      obterSalaPorCodigo: builder.query<ApiResponse<SalaPorCodigo>, string>({
         query: (codigo: string) => ({
            url: `/salas/obterPorCodigo/${codigo}`,
            method: 'GET',
         }),
         providesTags: ['salaPlaning'],
      }),

      obterSalaPorId: builder.query<ApiResponse<SalaPorCodigo>, string>({
         query: (id: string) => ({
            url: `/salas/obterPorId/${id}`,
            method: 'GET',
         }),
         providesTags: ['salaPlaning'],
      }),

      obterSalaParaEdicao: builder.query<
         ApiResponse<{ sala: SalaParaEdicao }>,
         string
      >({
         query: (id: string) => ({
            url: `/salas/${id}/editar`,
            method: 'GET',
         }),
         providesTags: ['participantes'],
      }),

      adicionarParticipante: builder.mutation<
         ApiResponse,
         AdicionarParticipanteSalaPayload
      >({
         query: ({ sala_id, pessoa_id, role, sessao_id }) => ({
            url: `/salas/${sala_id}/participantes/adicionar`,
            method: 'POST',
            body: { pessoa_id, role, ...(sessao_id ? { sessao_id } : {}) },
         }),
         invalidatesTags: ['participantes', 'listarSalas'],
      }),

      removerParticipante: builder.mutation<
         ApiResponse,
         RemoverParticipanteSalaPayload
      >({
         query: ({ sala_id, pessoa_id }) => ({
            url: `/salas/${sala_id}/participantes/${pessoa_id}/remover`,
            method: 'DELETE',
         }),
         invalidatesTags: ['participantes', 'listarSalas'],
      }),

      alterarRoleParticipante: builder.mutation<
         ApiResponse,
         AlterarRoleParticipantePayload
      >({
         query: ({ sala_id, pessoa_id, role }) => ({
            url: `/salas/${sala_id}/participantes/${pessoa_id}/role`,
            method: 'PATCH',
            body: { role },
         }),
         invalidatesTags: ['participantes'],
      }),

      ListarParticipantesSala: builder.query<
         ApiResponse<ListarParticipantesSalaResponse>,
         ListarParticipantesSalaPayload
      >({
         query: (payload) => ({
            url: `/salas/ListarParticipantesSala`,
            method: 'GET',
            params: {
               ...(payload.apenasOnline ? { apenasOnline: 'true' } : {}),
            },
         }),
         providesTags: ['participantes'],
      }),

      // POST /salas/:id/participantes - Adicionar visitante à sessão ativa (rota unificada)
      adicionarVisitante: builder.mutation<
         ApiResponse,
         AdicionarVisitantePayload
      >({
         query: ({ sala_id, pessoa_id }) => ({
            url: `/salas/${sala_id}/participantes`,
            method: 'POST',
            body: {
               pessoa_id,
               role: 3, // 3 = Visitante
            },
         }),
         invalidatesTags: ['participantes', 'salaPlaning'],
      }),

      // POST /salas/:id/participantes - Adicionar participante ou visitante (rota unificada genérica)
      adicionarParticipanteOuVisitante: builder.mutation<
         ApiResponse,
         AdicionarParticipanteOuVisitantePayload
      >({
         query: ({ sala_id, pessoa_id, role, sessao_id }) => ({
            url: `/salas/${sala_id}/participantes`,
            method: 'POST',
            body: {
               pessoa_id,
               role,
               ...(sessao_id && { sessao_id }),
            },
         }),
         invalidatesTags: ['participantes', 'salaPlaning'],
      }),

      // DELETE /salas/:id/visitantes/:pessoaId - Remover visitante da sessão ativa
      removerVisitante: builder.mutation<ApiResponse, RemoverVisitantePayload>({
         query: ({ sala_id, pessoa_id }) => ({
            url: `/salas/${sala_id}/visitantes/${pessoa_id}`,
            method: 'DELETE',
         }),
         invalidatesTags: ['participantes', 'salaPlaning'],
      }),

      // POST /salas/:id/sessoes - Criar nova sessão
      criarSessao: builder.mutation<ApiResponse, CriarSessaoPayload>({
         query: ({ salaId, visitantes, historias }) => ({
            url: `/salas/${salaId}/sessoes`,
            method: 'POST',
            body: {
               ...(visitantes && visitantes.length > 0 ? { visitantes } : {}),
               ...(historias && historias.length > 0 ? { historias } : {}),
            },
         }),
         invalidatesTags: ['salaPlaning', 'visitantes'],
      }),

      // GET /salas/codigo/:codigo/sessao-ativa - Obter dados da sessão ativa
      obterDadosSessaoAtiva: builder.query<ApiResponse<SalaPorCodigo>, string>({
         query: (codigo: string) => ({
            url: `/salas/codigo/${codigo}/sessao-ativa`,
            method: 'GET',
         }),
         providesTags: ['salaPlaning'],
      }),

      // POST /salas/:id/sair - Sair da sala (marca offline e limpa autorização)
      sairDaSala: builder.mutation<ApiResponse, string>({
         query: (salaId) => ({
            url: `/salas/${salaId}/sair`,
            method: 'POST',
         }),
         invalidatesTags: ['salaPlaning', 'listarSalas'],
      }),

      // PUT /salas/:id/historia-atual - Selecionar história atual
      selecionarHistoriaAtual: builder.mutation<
         ApiResponse,
         { salaId: string; historiaId: string }
      >({
         query: ({ salaId, historiaId }) => ({
            url: `/salas/${salaId}/historia-atual`,
            method: 'PUT',
            body: { historia_id: historiaId },
         }),
         invalidatesTags: ['salaPlaning'],
         // Forçar bypass de cache para garantir que sempre usa tokens atuais
         extraOptions: {
            maxRetries: 0, // Sem retry automático
         },
      }),
   }),
});

export const {
   useSalaEntrarMutation,
   useCriarSalaMutation,
   useAlterarSalaMutation,
   useDeletarSalaMutation,
   useListarSalasQuery,
   useLazyListarSalasQuery,
   useObterSalaPorCodigoQuery,
   useLazyObterSalaPorCodigoQuery,
   useObterSalaPorIdQuery,
   useLazyObterSalaPorIdQuery,
   useLazyObterSalaParaEdicaoQuery,
   useAdicionarParticipanteMutation,
   useRemoverParticipanteMutation,
   useAlterarRoleParticipanteMutation,
   useCriarSessaoMutation,
   useObterDadosSessaoAtivaQuery,
   useLazyObterDadosSessaoAtivaQuery,
   useSairDaSalaMutation,
   useSelecionarHistoriaAtualMutation,
   useListarParticipantesSalaQuery,
   useLazyListarParticipantesSalaQuery,
   useAdicionarVisitanteMutation,
   useAdicionarParticipanteOuVisitanteMutation,
   useRemoverVisitanteMutation,
} = SalasApi;
