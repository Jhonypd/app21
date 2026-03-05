'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSalaAuth } from '@/hooks/salaAuth';
import { useParams, useRouter } from 'next/navigation';
import {
   useObterDadosSessaoAtivaQuery,
   useSairDaSalaMutation,
   useSelecionarHistoriaAtualMutation,
   SalasApi,
} from '@/services/api/salas-api';
import { useDispatch } from 'react-redux';
import Loading from '@/components/loading';
import { toastError, toastSuccess } from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSafeTimer } from '@/hooks/useSafeAsync';
import { SalaPlanning } from '@/components/sala/sala-planning';
import {
   useEncerrarSessaoMutation,
   useRevelarVotosMutation,
   useResetarVotosMutation,
   useListarHistoriasSessaoQuery,
} from '@/services/api/sessoes-api';
import {
   useVotarMutation,
   useAnularVotoMutation,
   useLazyObterVotosPorHistoriaSessaoSessaoSalaQuery,
} from '@/services/api/votos-api';
import { useAdicionarHistoriaDuranteSessaoMutation } from '@/services/api/historias-api';

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import DialogConfirmacao from '@/components/dialog-confirmacao';

const PageSala = () => {
   const params = useParams();
   const router = useRouter();
   const dispatch = useDispatch();
   const codigoSala = params.sala as string;
   const { usuario } = useAuth();
   const { encerrarSessaoAtiva, obterSessaoAtiva, limparTokenSala } =
      useSalaAuth();
   const { schedule: scheduleAutoSelect } = useSafeTimer();

   // Estados de loading
   const [loading, setLoading] = useState(false);
   const [encerrandoSessao, setEncerrandoSessao] = useState(false);
   const [encerrandoDialog, setEncerrandoDialog] = useState(false);

   // Estados de controle
   const [dialogEncerrarAberto, setDialogEncerrarAberto] = useState(false);
   const [skipQuery, setSkipQuery] = useState(false);
   const [modoVisualizacao, setModoVisualizacao] = useState(false);
   const [historiaVisualizadaId, setHistoriaVisualizadaId] = useState<
      string | null
   >(null);

   // Buscar dados da sessão ativa
   const { data, isLoading, error } = useObterDadosSessaoAtivaQuery(
      codigoSala,
      {
         skip: !codigoSala || skipQuery,
      },
   );

   const [encerrarSessao] = useEncerrarSessaoMutation();
   const [sairDaSala] = useSairDaSalaMutation();
   const [selecionarHistoriaAtual, { reset: resetSelecionarHistoria }] =
      useSelecionarHistoriaAtualMutation();
   const [votar] = useVotarMutation();
   const [anularVoto] = useAnularVotoMutation();
   const [revelarVotos] = useRevelarVotosMutation();
   const [resetarVotos] = useResetarVotosMutation();
   const [buscarVotosPorHistoria] =
      useLazyObterVotosPorHistoriaSessaoSessaoSalaQuery();
   const [adicionarHistoriaDuranteSessao] =
      useAdicionarHistoriaDuranteSessaoMutation();

   // Tratar erros da API
   useEffect(() => {
      if (error) {
         const msg = getApiErrorMessage(error);
         toastError({
            description: msg.Mensagem,
         });
      }
   }, [error]);

   // Helper para tratar erros consistentemente
   const tratarErro = useCallback((error: unknown, titulo: string) => {
      const msg = getApiErrorMessage(error);
      toastError({
         title: titulo,
         description: msg.Mensagem,
      });
   }, []);

   const invalidarCacheSalas = useCallback(() => {
      dispatch(SalasApi.util.invalidateTags(['listarSalas', 'salaPlaning']));
   }, [dispatch]);

   // Helper para limpar e sair da sala
   const limparESair = useCallback(
      async (salaId: string) => {
         try {
            await sairDaSala(salaId).unwrap();
            encerrarSessaoAtiva(salaId);
            limparTokenSala();

            // Invalidar cache das salas para recarregar lista atualizada
            invalidarCacheSalas();

            toastSuccess({
               title: 'Saiu da sala',
               description: 'Você saiu da sala com sucesso',
            });
            router.push('/salas');
         } catch (error) {
            tratarErro(error, 'Erro ao sair da sala');
            // Invalidar cache mesmo com erro para garantir dados atualizados
            invalidarCacheSalas();
            // Redireciona mesmo com erro
            router.push('/salas');
         }
      },
      [
         sairDaSala,
         encerrarSessaoAtiva,
         limparTokenSala,
         invalidarCacheSalas,
         router,
         tratarErro,
      ],
   );

   // Validações
   const salaResultado = data?.Resultado?.sala;
   const usuarioId = usuario?.id ?? '';
   const sessaoRegistrada = salaResultado?.id
      ? obterSessaoAtiva(salaResultado.id)
      : null;
   const sessaoAtivaApiId = salaResultado?.sessaoAtiva?.id ?? null;
   const sessaoAtivaId = sessaoAtivaApiId ?? sessaoRegistrada ?? null;

   // Determinar role do usuário (vem calculado do backend)
   const meuRole =
      salaResultado?.meuRole ??
      (usuario?.id === salaResultado?.criado_por ? 0 : 2);

   // Buscar histórias da sessão ativa separadamente
   const {
      data: historiasData,
      isLoading: carregandoHistorias,
      isFetching: buscandoHistorias,
   } = useListarHistoriasSessaoQuery(sessaoAtivaApiId ?? '', {
      skip: !sessaoAtivaApiId,
   });
   const historiasSessao = useMemo(
      () =>
         [...(historiasData?.Resultado?.historias ?? [])].sort(
            (a, b) => a.ordem - b.ordem,
         ),
      [historiasData?.Resultado?.historias],
   );

   // Auto-selecionar primeira história ao entrar na sala
   useEffect(() => {
      const autoSelecionarPrimeiraHistoria = async () => {
         if (
            !salaResultado?.id ||
            !sessaoAtivaApiId ||
            salaResultado.historia_atual_id ||
            !historiasSessao?.length ||
            (meuRole !== 0 && meuRole !== 1)
         ) {
            return;
         }

         const primeiraHistoria = historiasSessao[0];

         if (process.env.NODE_ENV === 'development') {
            console.log(
               '[AUTO-SELECT] Selecionando primeira história automaticamente:',
               primeiraHistoria.titulo,
            );
         }

         try {
            await selecionarHistoriaAtual({
               salaId: salaResultado.id,
               historiaId: primeiraHistoria.id,
            }).unwrap();
         } catch (error) {
            if (process.env.NODE_ENV === 'development') {
               console.error(
                  '[AUTO-SELECT] Erro ao selecionar primeira história:',
                  error,
               );
            }
         }
      };

      scheduleAutoSelect(() => {
         autoSelecionarPrimeiraHistoria();
      }, 3000);
   }, [
      salaResultado?.id,
      salaResultado?.historia_atual_id,
      historiasSessao,
      sessaoAtivaApiId,
      meuRole,
      selecionarHistoriaAtual,
      scheduleAutoSelect,
   ]);

   // Estados computados
   const estaCarregando = isLoading || encerrandoSessao || loading;
   const salaNaoEncontrada =
      !estaCarregando && data && (!data.Sucesso || !data.Resultado?.sala);

   // Handlers
   const handleVoltar = async () => {
      setLoading(true);

      if (!salaResultado) {
         router.push('/salas');
         setLoading(false);
         return;
      }

      await limparESair(salaResultado.id);
      setLoading(false);
   };

   const handleAbrirDialogEncerrar = () => {
      setDialogEncerrarAberto(true);
   };

   const handleEncerrarSessao = async () => {
      if (!salaResultado || !sessaoAtivaId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa para encerrar',
         });
         return;
      }

      try {
         setSkipQuery(true);
         setEncerrandoSessao(true);
         setEncerrandoDialog(true);

         await encerrarSessao(salaResultado.id).unwrap();

         encerrarSessaoAtiva(salaResultado.id);
         limparTokenSala();

         setDialogEncerrarAberto(false);
         toastSuccess({
            title: 'Sessão encerrada',
            description: 'A sessão foi encerrada para todos os participantes',
         });

         router.push('/salas');
      } catch (error) {
         setDialogEncerrarAberto(false);
         setEncerrandoSessao(false);
         setEncerrandoDialog(false);
         setSkipQuery(false);
         tratarErro(error, 'Erro ao encerrar sessão');
      }
   };

   const handleEnviarVoto = async (
      valor: number,
      participaVotacao: boolean,
      historiaId: string,
   ) => {
      const sessaoId = sessaoAtivaApiId;

      if (!sessaoId || !historiaId) {
         toastError({
            title: 'Erro ao votar',
            description: 'Nenhuma história selecionada para votação',
         });
         return;
      }
      try {
         await votar({
            sessaoId,
            valor,
            historia_id: historiaId,
            participa_votacao: participaVotacao,
         }).unwrap();

         toastSuccess({
            description: participaVotacao
               ? 'Voto registrado com sucesso!'
               : 'Você não está participando da votação',
         });
      } catch (error: unknown) {
         const msg = getApiErrorMessage(error);
         tratarErro(error, `Erro ao enviar voto: ${msg.Mensagem}`);
      }
   };

   const handleAnularVoto = async (votoId: string) => {
      try {
         await anularVoto(votoId).unwrap();
         toastSuccess({
            description: 'Voto cancelado com sucesso!',
         });
      } catch (error: unknown) {
         const msg = getApiErrorMessage(error);
         tratarErro(error, `Erro ao cancelar voto: ${msg.Mensagem}`);
      }
   };

   const handleRevelarVotos = async () => {
      if (!sessaoAtivaApiId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return;
      }

      try {
         await revelarVotos(sessaoAtivaApiId).unwrap();
         toastSuccess({
            description: 'Votos revelados com sucesso!',
         });
      } catch (error: unknown) {
         tratarErro(error, 'Erro ao revelar votos');
      }
   };

   const handleResetarVotos = async () => {
      if (!sessaoAtivaApiId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return;
      }

      try {
         await resetarVotos(sessaoAtivaApiId).unwrap();
         toastSuccess({
            description: 'Votos resetados! Podem votar novamente.',
         });
      } catch (error: unknown) {
         tratarErro(error, 'Erro ao resetar votos');
      }
   };

   const handleSelecionarHistoria = async (historiaId: string) => {
      try {
         if (!salaResultado?.id) return;

         // Limpar cache da mutation antes de chamar
         resetSelecionarHistoria();

         await selecionarHistoriaAtual({
            salaId: salaResultado.id,
            historiaId,
         }).unwrap();

         toastSuccess({
            title: 'História alterada',
            description: 'Todos os participantes foram notificados',
         });
      } catch (error: unknown) {
         if (process.env.NODE_ENV === 'development') {
            console.error('[handleSelecionarHistoria] Erro:', error);
         }
         tratarErro(error, 'Erro ao selecionar história');
      }
   };

   const handleModoVisualizacaoChange = (
      ativo: boolean,
      historiaId?: string,
   ) => {
      setModoVisualizacao(ativo);
      setHistoriaVisualizadaId(historiaId || null);

      // Ao voltar para a história atual, recarregar dados da sessão
      if (!ativo) {
         dispatch(SalasApi.util.invalidateTags(['salaPlaning']));
      }
   };

   const handleAdicionarHistorias = async (
      historias: Array<{ titulo: string; descricao?: string; ordem: number }>,
   ) => {
      const sessaoId = sessaoAtivaApiId;

      if (!sessaoId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return;
      }

      await adicionarHistoriaDuranteSessao({
         sessaoId,
         adicionar: historias.map((historia) => ({
            titulo: historia.titulo,
            descricao: historia.descricao,
            ordem: historia.ordem,
         })),
      }).unwrap();
   };

   const handleReordenarHistorias = async (
      novasHistorias: Array<{ id: string; titulo: string; descricao?: string }>,
   ) => {
      const sessaoId = sessaoAtivaApiId;

      if (!sessaoId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return false;
      }

      const idsAtuais = new Set(historiasSessao.map((h) => h.id));
      const idsNovos = new Set(novasHistorias.map((h) => h.id));

      const remover = historiasSessao
         .filter((h) => idsAtuais.has(h.id) && !idsNovos.has(h.id))
         .map((h) => h.id);

      // Se não houve remoção para persistir, não chama API
      if (remover.length === 0) {
         return true;
      }

      try {
         await adicionarHistoriaDuranteSessao({
            sessaoId,
            remover,
         }).unwrap();

         toastSuccess({
            description:
               remover.length === 1
                  ? 'História removida com sucesso!'
                  : 'Histórias removidas com sucesso!',
         });

         return true;
      } catch (error) {
         tratarErro(error, 'Erro ao remover histórias');
         return false;
      }
   };

   const handleBuscarVotosPorHistoria = async (historiaId: string) => {
      const sessaoId = sessaoAtivaApiId;
      if (!sessaoId) {
         console.warn('Nenhuma sessão ativa para buscar votos');
         return {
            voto_vencedor: 0,
            media: 0,
            votos: [],
         };
      }

      try {
         const resultado = await buscarVotosPorHistoria({
            sessaoId,
            historiaId,
         }).unwrap();

         const votos = resultado.Resultado;
         return votos;
      } catch (error) {
         console.error('Erro ao buscar votos da história:', error);
         return {
            voto_vencedor: 0,
            media: 0,
            votos: [],
         };
      }
   };

   // Sala não encontrada (só mostra após loading terminar)
   if (salaNaoEncontrada) {
      return (
         <div className="flex min-h-screen items-center justify-center p-4">
            <div className="max-w-md space-y-6 text-center">
               <div className="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                  <XCircle className="text-destructive h-10 w-10" />
               </div>

               <div className="space-y-2">
                  <h2 className="text-foreground text-2xl font-bold">
                     Sala não encontrada
                  </h2>
                  <p className="text-muted-foreground">
                     A sala{' '}
                     <span className="font-mono font-semibold">
                        {codigoSala}
                     </span>{' '}
                     não existe ou você não tem permissão para acessá-la.
                  </p>
               </div>

               <Button
                  onClick={handleVoltar}
                  size="lg"
                  className="mt-4"
               >
                  Voltar para salas
               </Button>
            </div>
         </div>
      );
   }

   return (
      <>
         {estaCarregando && (
            <Loading
               active
               type="transaction"
            />
         )}

         {!estaCarregando && salaResultado && (
            <SalaPlanning
               usuarioAtualId={usuarioId}
               aoVoltar={handleVoltar}
               sala={salaResultado}
               historias={historiasSessao}
               sessaoId={sessaoAtivaId ?? ''}
               meuRole={meuRole}
               aoEnviarVoto={handleEnviarVoto}
               aoAnularVoto={handleAnularVoto}
               aoRevelarVotos={handleRevelarVotos}
               aoResetarVotos={handleResetarVotos}
               aoSelecionarHistoria={handleSelecionarHistoria}
               aoAdicionarHistorias={handleAdicionarHistorias}
               aoReordenarHistorias={handleReordenarHistorias}
               aoEncerrarSessao={handleAbrirDialogEncerrar}
               aoBuscarVotosPorHistoria={handleBuscarVotosPorHistoria}
               modoVisualizacao={modoVisualizacao}
               historiaVisualizadaId={historiaVisualizadaId}
               onModoVisualizacaoChange={handleModoVisualizacaoChange}
               carregandoHistorias={carregandoHistorias || buscandoHistorias}
            />
         )}

         {/* Dialog de confirmação para encerrar sessão */}

         <DialogConfirmacao
            textoPadrao="Isso vai encerrar a sessão atual de votação 
              para todos os participantes. Deseja continuar?"
            dialogAberto={dialogEncerrarAberto}
            setDialogAberto={setDialogEncerrarAberto}
            dialogLoading={encerrandoDialog}
            handleSubmit={handleEncerrarSessao}
            titulo="Encerrar sessão?"
         />
      </>
   );
};

export default PageSala;
