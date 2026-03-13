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
   AlterarRoleParticipantePayload,
   ListarParticipantesSalaResponse,
   ListarParticipantesSalaPayload,
   AdicionarVisitantePayload,
   RemoverVisitantePayload,
   AdicionarParticipanteOuVisitantePayload,
   ListarHistoriasSessaoResponse,
   AtualizarParticipaVotacaoPayload,
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
      entrarSala: builder.mutation<
         ApiResponse<ResponseLoginSala>,
         LoginSalaPayload
      >({
         query: (credenciais) => ({
            url: '/salas/entrarSala',
            method: 'POST',
            body: credenciais,
         }),
         extraOptions: { maxRetries: 0 },
         invalidatesTags: ['salaPlaning'],
      }),

      // POST /salas/encerrarSessaoSalaAtiva?id={salaId} - Encerrar sessão
      encerrarSessaoSalaAtiva: builder.mutation<ApiResponse, string>({
         query: (salaId) => ({
            url: `/salas/encerrarSessaoSalaAtiva?id=${salaId}`,
            method: 'POST',
         }),
         invalidatesTags: ['sessao', 'salaPlaning'],
      }),

      criarSala: builder.mutation<
         ApiResponse<ResponseCriarSala>,
         CriarSalaPayload
      >({
         query: (salaData) => ({
            url: '/salas/criarSala',
            method: 'POST',
            body: salaData,
         }),
         invalidatesTags: ['listarSalas'],
      }),

      alterarSala: builder.mutation<ApiResponse, AlterarSalaPayload>({
         query: (body) => ({
            url: `/salas/alterarSala`,
            method: 'PUT',
            body,
         }),
         invalidatesTags: ['listarSalas', 'salaPlaning'],
      }),

      excluirSala: builder.mutation<ApiResponse, DeletarSalaPayload>({
         query: (ids) => ({
            url: `/salas/excluirSala`,
            method: 'DELETE',
            headers: { ids: ids.ids.join(',') },
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
         providesTags: ['listarSalas', 'salaPlaning'],
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

      obterDadosFormAlterar: builder.query<
         ApiResponse<{ sala: SalaParaEdicao }>,
         string
      >({
         query: (id: string) => ({
            url: `/salas/obterDadosFormAlterar?id=${id}`,
            method: 'GET',
         }),
         providesTags: ['participantes'],
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
      // adicionarVisitante: builder.mutation<
      //    ApiResponse,
      //    AdicionarVisitantePayload
      // >({
      //    query: ({ sala_id, pessoa_id }) => ({
      //       url: `/salas/${sala_id}/participantes`,
      //       method: 'POST',
      //       body: {
      //          pessoa_id,
      //          role: 3, // 3 = Visitante
      //       },
      //    }),
      //    invalidatesTags: ['participantes', 'salaPlaning'],
      // }),

      // POST /salas/:id/participantes - Adicionar participante ou visitante (rota unificada genérica)
      adicionarParticipanteOuVisitanteSala: builder.mutation<
         ApiResponse,
         AdicionarParticipanteOuVisitantePayload
      >({
         query: ({ pessoa_id, role }) => ({
            url: `/salas/adicionarParticipanteOuVisitanteSala`,
            method: 'POST',
            body: {
               pessoaId: pessoa_id,
               role,
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
            url: `/salas/obterDadosSessaoAtiva?codigo=${codigo}`,
            method: 'GET',
         }),
         providesTags: ['salaPlaning'],
      }),

      // POST /salas/:id/sair - Sair da sala (marca offline e limpa autorização)
      sairDaSala: builder.mutation<ApiResponse, string>({
         query: (salaId) => ({
            url: `/salas/sairDaSala?id=${salaId}`,
            method: 'POST',
         }),
         invalidatesTags: ['salaPlaning', 'listarSalas'],
      }),

      // PUT /salas/:id/historia-atual - Selecionar história atual
      selecionarHistoriaAtual: builder.mutation<
         ApiResponse,
         { historiaId: string }
      >({
         query: ({ historiaId }) => ({
            url: `/salas/selecionarHistoriaAtual?id=${historiaId}`,
            method: 'PUT',
         }),
         invalidatesTags: ['salaPlaning'],
         // Forçar bypass de cache para garantir que sempre usa tokens atuais
         extraOptions: {
            maxRetries: 0, // Sem retry automático
         },
      }),

      // GET /historias/listarHistoriasPorSessaoSala
      listarHistoriasPorSessaoSala: builder.query<
         ApiResponse<ListarHistoriasSessaoResponse>,
         void
      >({
         query: () => ({
            url: `/salas/listarHistoriasPorSessaoSala`,
            method: 'GET',
         }),
         providesTags: ['historias'],
      }),

      // PATCH /sessoes/:id/participa-votacao - Atualizar flag de participação
      atualizarParticipaVotacao: builder.mutation<
         ApiResponse,
         AtualizarParticipaVotacaoPayload
      >({
         query: ({ sessaoId, participaVotacao }) => ({
            url: `/salas/atualizarParticipaVotacaoSessaoSala?id=${sessaoId}`,
            method: 'PATCH',
            body: { participa_votacao: participaVotacao },
         }),
         invalidatesTags: ['salaPlaning'],
      }),
   }),
});

export const {
   useEntrarSalaMutation,
   useEncerrarSessaoSalaAtivaMutation,
   useCriarSalaMutation,
   useAlterarSalaMutation,
   useExcluirSalaMutation,
   useListarSalasQuery,
   useLazyListarSalasQuery,
   useObterSalaPorCodigoQuery,
   useLazyObterSalaPorCodigoQuery,
   useObterSalaPorIdQuery,
   useLazyObterSalaPorIdQuery,
   useLazyObterDadosFormAlterarQuery,
   useAlterarRoleParticipanteMutation,
   useCriarSessaoMutation,
   useObterDadosSessaoAtivaQuery,
   useLazyObterDadosSessaoAtivaQuery,
   useSairDaSalaMutation,
   useSelecionarHistoriaAtualMutation,
   useListarParticipantesSalaQuery,
   useLazyListarParticipantesSalaQuery,
   // useAdicionarVisitanteMutation,
   useAdicionarParticipanteOuVisitanteSalaMutation,
   useRemoverVisitanteMutation,
   useListarHistoriasPorSessaoSalaQuery,
   useLazyListarHistoriasPorSessaoSalaQuery,
   useAtualizarParticipaVotacaoMutation,
} = SalasApi;
