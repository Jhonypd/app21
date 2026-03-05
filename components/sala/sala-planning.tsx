'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, RotateCcw, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { toastError, toastSuccess } from '../custom-toast';
import { useVotosPolling } from '@/hooks/useVotosPolling';
import { useSalaPlanningData } from '@/hooks/useSalaPlanning';
import { ModalAdicionarParticipanteOuVisitante } from '../sala/modal-adicionar-visitante';
import CardVotos from '../sala/card-votos';
import ListaParticipantes from '../sala/lista-participantes';
import HeaderSala from '../sala/header-sala';
import { ListaHistorias } from '../sala/lista-historias';
import { Badge } from '../ui/badge';
import CardMediaVotacao from '../sala/card-media-votacao';
import { ButtonCustom } from '../button-custom';
import Loading from '../loading';
import { SalaCompleta, VotosPorHistoriaResponse } from '@/services/types';

interface Historia {
   id: string;
   titulo: string;
   descricao?: string;
   jaFoiVotada: boolean;
   historiaAtual: boolean;
   ordem: number;
   voto: number[] | [];
}

interface SalaPlanningProps {
   sala: SalaCompleta;
   historias: Historia[];
   usuarioAtualId: string;
   sessaoId: string;
   meuRole: number;
   aoVoltar: () => void | Promise<void>;
   aoEnviarVoto?: (valor: number, participaVotacao: boolean, historiaId: string) => Promise<void>;
   aoRevelarVotos?: () => Promise<void>;
   aoResetarVotos?: () => Promise<void>;
   aoSelecionarHistoria?: (historiaId: string) => Promise<void>;
   aoEncerrarSessao?: () => void | Promise<void>;
   aoAnularVoto?: (votoId: string) => Promise<void>;
   aoReordenarHistorias?: (
      historias: Historia[],
   ) => Promise<void | boolean | { Sucesso?: boolean }>;
   aoAdicionarHistorias?: (
      historias: Array<{ titulo: string; descricao?: string; ordem: number }>,
   ) => Promise<void>;
   aoBuscarVotosPorHistoria?: (
      historiaId: string,
   ) => Promise<VotosPorHistoriaResponse | null>;
   modoVisualizacao?: boolean;
   historiaVisualizadaId?: string | null;
   onModoVisualizacaoChange?: (ativo: boolean, historiaId?: string) => void;
   carregandoHistorias?: boolean;
}

const VOTO_MAP: Record<string, number> = {
   '?': 0,
   '☕': -1,
   '1': 1,
   '2': 2,
   '3': 3,
   '5': 5,
   '8': 8,
   '13': 13,
   '21': 21,
   '34': 34,
   '55': 55,
   '89': 89,
};

const createEmptyVotes = (): VotosPorHistoriaResponse => ({
   media: 0,
   voto_vencedor: 0,
   votos: [],
});

export function SalaPlanning({
   sala,
   historias,
   usuarioAtualId,
   sessaoId,
   meuRole = 2,
   aoVoltar,
   aoEnviarVoto,
   aoRevelarVotos,
   aoResetarVotos,
   aoSelecionarHistoria,
   aoEncerrarSessao,
   aoAnularVoto,
   aoReordenarHistorias,
   aoAdicionarHistorias,
   aoBuscarVotosPorHistoria,
   modoVisualizacao = false,
   historiaVisualizadaId,
   onModoVisualizacaoChange,
   carregandoHistorias = false,
}: SalaPlanningProps) {
   // Estados
   const [historiaAtualId, setHistoriaAtualId] = useState<string | null>(null);
   const [modalVisitantesAberto, setModalVisitantesAberto] = useState(false);
   const [modalParticipantesAberto, setModalParticipantesAberto] =
      useState(false);
   const [loadingAcao, setLoadingAcao] = useState(false);
   const [termoBusca, setTermoBusca] = useState('');
   const [carregandoVotos, setCarregandoVotos] = useState(false);
   const [pausarPolling, setPausarPolling] = useState(false);

   const eProprietario = sala && sala.criado_por === usuarioAtualId;
   const iniciouSessao =
      sala && sala.sessaoAtiva?.iniciada_por === usuarioAtualId;
   const podeEncerrarSessao = eProprietario || iniciouSessao;
   const participaSempre = meuRole === 2 || meuRole === 3;
   const [participaVotacao, setParticipaVotacao] = useState(true);

   const {
      state: {
         participantes,
         pessoasEncontradas,
         loadingApi,
         listaVotosCarregados,
      },
      actions: {
         onBuscarParticipantes,
         onBuscarPessoas,
         onAdicionarVisitante,
         onAdicionarParticipante,
         onCarregarVotos,
         onAtualizarParticipaVotacao,
         resetBuscaPessoas,
         setListaVotosCarregados,
      },
   } = useSalaPlanningData({
      salaId: sala.id,
      sessaoId,
      aoBuscarVotosPorHistoria,
   });

   // Verifica se está em modo prática (sem histórias)
   const emModoPratica = !historias || historias.length === 0;
   const votosRevelados = modoVisualizacao ? true : sala.votos_revelados;
   const loadingGlobal =
      loadingAcao || carregandoVotos || carregandoHistorias || loadingApi;
   const uiDisabled = loadingGlobal;

   useEffect(() => {
      if (participaSempre) {
         setParticipaVotacao(true);
      }
   }, [participaSempre]);

   // Hook de polling de votos a cada 3 segundos
   // Apenas gerencia os timers, a busca é feita pela função aoBuscarVotosPorHistoria
   useVotosPolling({
      intervalo: 5000,
      // Habilitado apenas quando sala está na história atual (sem visualização)
      habilitado:
         !!sessaoId &&
         !!sala.sessaoAtiva?.id &&
         !!sala.historia_atual_id &&
         !modoVisualizacao &&
         !pausarPolling,
      onBuscaIntervalo: async () => {
         // Em modo visualização não realiza polling
         if (modoVisualizacao) {
            return;
         }

         // Buscar votos apenas da história atual da sala
         const idHistoria = sala.historia_atual_id;

         if (idHistoria) {
            try {
               await onCarregarVotos(idHistoria);
            } catch (erro) {
               if (process.env.NODE_ENV === 'development') {
                  console.error('[Polling] Erro ao buscar votos:', erro);
               }
            }
         }
      },
   });

   // Forçar busca imediata quando é selecionada uma história em modo visualização
   useEffect(() => {
      if (modoVisualizacao && historiaVisualizadaId) {
         // Limpar votos antes de buscar
         setListaVotosCarregados(createEmptyVotes());
         setCarregandoVotos(true);

         onCarregarVotos(historiaVisualizadaId)
            .catch((erro: unknown) => {
               setListaVotosCarregados(createEmptyVotes());
               toastError({
                  title: 'Erro ao carregar votos',
                  description:
                     erro instanceof Error ? erro.message : 'Tente novamente',
               });
            })
            .finally(() => {
               setCarregandoVotos(false);
            });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [historiaVisualizadaId, modoVisualizacao]);

   // Forçar busca quando voltamos do modo visualização para a história atual
   useEffect(() => {
      if (!modoVisualizacao && sala.historia_atual_id) {
         // Limpar votos antes de buscar
         setListaVotosCarregados(createEmptyVotes());
         setCarregandoVotos(true);
         setPausarPolling(true);

         onCarregarVotos(sala.historia_atual_id)
            .catch((erro: unknown) => {
               setListaVotosCarregados(createEmptyVotes());
               if (process.env.NODE_ENV === 'development') {
                  console.error('Erro ao buscar votos:', erro);
               }
            })
            .finally(() => {
               setCarregandoVotos(false);
               setPausarPolling(false);
            });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [modoVisualizacao, sala.historia_atual_id]);

   // Inicializar com a história atual da sala (ou primeira se não houver)
   useEffect(() => {
      if (historias && historias.length > 0 && !historiaAtualId) {
         // Priorizar historia_atual_id da sala
         const historiaInicial = sala.historia_atual_id
            ? sala.historia_atual_id
            : historias[0].id;
         setHistoriaAtualId(historiaInicial);
      }
   }, [historias, sala.historia_atual_id, historiaAtualId]);

   // Usar votos do estado carregado
   // Sempre usar votosCarregados (atualizado via polling e visualização)
   const votosAtivos = useMemo(() => {
      const votos = listaVotosCarregados?.votos;
      return Array.isArray(votos) ? votos : [];
   }, [listaVotosCarregados]);
   const votosPorPessoaId = useMemo(
      () => new Map(votosAtivos.map((voto) => [voto.pessoa_id, voto])),
      [votosAtivos],
   );

   // Verificar se o usuário atual já votou (usando votos ativos)
   const votoUsuario = votosPorPessoaId.get(usuarioAtualId);
   const votoDoServidor = votoUsuario?.valor;
   const votoEstaConfirmado = !!votoUsuario;
   const votoSelecionado = votoEstaConfirmado
      ? votoDoServidor !== undefined
         ? votoDoServidor.toString()
         : null
      : null;

   // Usar resumoParticipantes do backend para contadores
   const totalDevemVotar = sala.resumoParticipantes?.totalDevemVotar ?? 0;
   const totalVotosParticipantes = votosAtivos.length;
   const todosVotaram =
      totalDevemVotar > 0 && totalVotosParticipantes >= totalDevemVotar;
   const totalOnline = sala.resumoParticipantes?.totalOnline ?? 0;
   const totalParticipantes = sala.resumoParticipantes?.totalParticipantes ?? 0;

   // Handlers
   const handleSelecionarVoto = async (
      carta: string,
      participaVotacao: boolean,
   ) => {
      // Impossível votar em modo visualização ou após revelar votos
      if (modoVisualizacao || votosRevelados) return;

      try {
         setLoadingAcao(true);
         const valorNumerico = VOTO_MAP[carta];
         if (valorNumerico === undefined) {
            toast.error('Voto inválido');
            return;
         }

         // Se já tem um voto e clica no mesmo → CANCELA
         if (
            votoSelecionado === carta &&
            votoEstaConfirmado &&
            votoUsuario?.id &&
            aoAnularVoto
         ) {
            console.log('Cancelando voto:', votoUsuario.id);
            await aoAnularVoto(votoUsuario.id);
            toastSuccess({ description: 'Voto cancelado' });
         } else {
            // Novo voto → ENVIA
            console.log('Enviando novo voto:', valorNumerico);
            if (aoEnviarVoto && historiaAtualId) {
               await aoEnviarVoto(valorNumerico, participaVotacao, historiaAtualId);
            }
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao selecionar voto:', error);
         }
         toastError({ description: 'Erro ao processar voto' });
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleRevelarVotos = async () => {
      if (!todosVotaram) return;

      setLoadingAcao(true);
      try {
         if (aoRevelarVotos) {
            await aoRevelarVotos();
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao revelar votos:', error);
         }
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleResetarVotacao = async () => {
      setLoadingAcao(true);
      try {
         if (aoResetarVotos) {
            await aoResetarVotos();
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao resetar votação:', error);
         }
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleMudarHistoria = async (historiaId: string) => {
      const historiaAnterior = historiaAtualId;
      try {
         setLoadingAcao(true);
         setHistoriaAtualId(historiaId);

         if (aoSelecionarHistoria) {
            await aoSelecionarHistoria(historiaId);
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao buscar votos da história:', error);
         }
         setHistoriaAtualId(historiaAnterior);
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleReordenarHistorias = async (novasHistorias: Historia[]) => {
      if (!aoReordenarHistorias) {
         return false;
      }

      return aoReordenarHistorias(novasHistorias);
   };

   const handleEncerrarSessao = async () => {
      setLoadingAcao(true);
      if (!podeEncerrarSessao) {
         toast.error('Apenas o dono ou quem iniciou a sessão pode encerrá-la');
         setLoadingAcao(false);
         return;
      }

      try {
         if (aoEncerrarSessao) {
            await aoEncerrarSessao();
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao encerrar sessão:', error);
         }
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleBuscarPessoas = (termo: string) => {
      setTermoBusca(termo);
      onBuscarPessoas(termo);
   };

   const handleAdicionarVisitante = async (pessoaId: string) => {
      const sucesso = await onAdicionarVisitante(pessoaId);
      if (sucesso) {
         setModalVisitantesAberto(false);
         setTermoBusca('');
         resetBuscaPessoas();
      }
   };

   const handleBuscarParticipantes = async () => {
      const sucesso = await onBuscarParticipantes();
      if (sucesso) {
         setModalParticipantesAberto(true);
      }
   };

   const handleToggleParticipacao = async (ativo: boolean) => {
      if (participaSempre) return;
      if (!sessaoId) {
         setParticipaVotacao(ativo);
         return;
      }

      const sucesso = await onAtualizarParticipaVotacao(ativo);
      if (!sucesso) return;

      setParticipaVotacao(ativo);
      toastSuccess({
         description: ativo
            ? 'Agora você está participando da votação'
            : 'Agora você não está participando da votação',
      });
   };

   const handleAnularVoto = async (
      votoId: string,
      nomeParticipante: string,
   ) => {
      if (!confirm(`Anular voto de ${nomeParticipante}?`)) return;

      setLoadingAcao(true);
      try {
         if (aoAnularVoto) {
            await aoAnularVoto(votoId);
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao anular voto:', error);
         }
      } finally {
         setLoadingAcao(false);
      }
   };

   return (
      <>
         {loadingGlobal && (
            <Loading
               active
               type="transaction"
            />
         )}
         <div className="min-h-screen bg-slate-950 pb-6 text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
               <div className="px-4 py-4">
                  <HeaderSala
                     aoVoltar={aoVoltar}
                     titulo={sala.titulo}
                     subtitulo={sala.proprietario.nome}
                     podeEncerrarSessao={podeEncerrarSessao}
                     handleEncerrarSessao={handleEncerrarSessao}
                     loadingAcao={uiDisabled}
                  />

                  {/* Lista de Histórias - apenas se não estiver em modo prática */}

                  <div className="mt-4">
                     <ListaHistorias
                        loading={carregandoVotos || carregandoHistorias}
                        uiDisabled={uiDisabled}
                        role={meuRole}
                        historias={historias}
                        historiaAtualId={historiaAtualId || undefined}
                        modoVisualizacao={modoVisualizacao}
                        historiaVisualizadaId={historiaVisualizadaId}
                        votacaoFinalizada={votosRevelados}
                        onMudarHistoria={handleMudarHistoria}
                        onReordenar={handleReordenarHistorias}
                        onModoVisualizacaoChange={onModoVisualizacaoChange}
                        onAdicionarHistorias={aoAdicionarHistorias}
                     />
                  </div>
               </div>
            </div>

            <div className="mt-6 space-y-6 px-4">
               {/* Participantes */}
               <div className="mx-auto w-11/12 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                  <div className="mb-3 flex w-full items-center justify-between">
                     <Badge
                        key={`${totalVotosParticipantes}-${totalDevemVotar}`}
                        variant="neutral"
                        className="flex items-center gap-1 text-sm"
                     >
                        <span className="font-semibold">
                           {totalVotosParticipantes}
                        </span>
                        <span className="text-white/60">/</span>
                        <span>{totalDevemVotar}</span>
                        <span className="text-white/70">votaram</span>
                     </Badge>

                     {/* Modal de lista de participantes */}

                     <ListaParticipantes
                        participantes={participantes}
                        open={modalParticipantesAberto}
                        onOpenChange={setModalParticipantesAberto}
                        onBuscarParticipantes={handleBuscarParticipantes}
                        uiDisabled={uiDisabled}
                        votos={votosAtivos}
                        totalOnline={totalOnline}
                        totalParticipantes={totalParticipantes}
                        meuRole={meuRole}
                        votosRevelados={votosRevelados || modoVisualizacao}
                        handleAnularVoto={handleAnularVoto}
                        pessoasEncontradas={pessoasEncontradas}
                        onBuscarPessoas={onBuscarPessoas}
                        onAdicionarParticipante={onAdicionarParticipante}
                     />
                  </div>
               </div>

               {/* Resultados - mostrar quando votos revelados OU em modo visualização (história já votada) */}
               {(votosRevelados || modoVisualizacao) && (
                  <CardMediaVotacao
                     modoVisualizacao={modoVisualizacao}
                     listaVotos={listaVotosCarregados}
                     carregandoVotos={carregandoVotos}
                  />
               )}

               {/* Cards de votos */}
               <CardVotos
                  role={meuRole}
                  emModoPratica={emModoPratica}
                  votosRevelados={votosRevelados}
                  votoSelecionado={votoSelecionado}
                  uiDisabled={uiDisabled}
                  participaVotacao={participaVotacao}
                  modoVisualizacao={modoVisualizacao}
                  onToggleParticipacao={handleToggleParticipacao}
                  handleSelecionarVoto={handleSelecionarVoto}
               />

               {/* Action Buttons */}
               <div className="flex w-full justify-center gap-3">
                  {/* Adicionar Visitante */}
                  {sessaoId && meuRole <= 1 && (
                     <ButtonCustom
                        icon={<UserPlus className="h-4 w-4" />}
                        disabled={uiDisabled}
                        onClick={() => {
                           setModalVisitantesAberto(true);
                           resetBuscaPessoas();
                        }}
                     >
                        <span className="text-sm">Adicionar Visitante</span>
                     </ButtonCustom>
                  )}

                  {/* Revelar/Resetar - desabilitado em modo visualização */}

                  {eProprietario && !votosRevelados && !modoVisualizacao && (
                     <ButtonCustom
                        onClick={handleRevelarVotos}
                        disabled={!todosVotaram || uiDisabled}
                        loading={loadingAcao}
                        icon={<Eye className="h-5 w-5" />}
                        text="Revelar Votos"
                     ></ButtonCustom>
                  )}

                  {eProprietario && votosRevelados && !modoVisualizacao && (
                     <ButtonCustom
                        onClick={() => handleResetarVotacao()}
                        disabled={uiDisabled}
                        loading={loadingAcao}
                        icon={<RotateCcw className="h-5 w-5" />}
                     >
                        <span className="text-sm">Reiniciar Votação</span>
                     </ButtonCustom>
                  )}
               </div>
            </div>

            {/* Modal Adicionar Visitante */}
            <ModalAdicionarParticipanteOuVisitante
               titulo="Adicionar visitantes"
               open={modalVisitantesAberto}
               onOpenChange={setModalVisitantesAberto}
               termoBusca={termoBusca}
               onBuscar={handleBuscarPessoas}
               pessoas={pessoasEncontradas}
               loading={uiDisabled}
               onAdicionar={handleAdicionarVisitante}
            />
         </div>
      </>
   );
}
