'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Eye, RotateCcw, UserPlus } from 'lucide-react';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { useLazyListarParticipantesSalaQuery, useAdicionarVisitanteMutation } from '@/services/api/salas-api';
import { toast } from 'sonner';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useVotosPolling } from '@/hooks/useVotosPolling';
import { ModalAdicionarParticipanteOuVisitante } from './sala/modal-adicionar-visitante';
import CardVotos from './sala/card-votos';
import ListaParticipantes from './sala/lista-participantes';
import HeaderSala from './sala/header-sala';
import { ListaHistorias } from './sala/lista-historias';
import { Badge } from './ui/badge';
import CardMediaVotacao from './sala/card-media-votacao';
import { ButtonCustom } from './button-custom';
import Loading from './loading';
import { SalaCompleta, VotosPorHistoriaResponse } from '@/services/types';

interface Historia {
   id: string;
   titulo: string;
   descricao?: string;
   jaFoiVotada: boolean;
   historiaAtual: boolean;
   voto: number[] | [];
}

interface SalaPlanningProps {
   sala: SalaCompleta;
   historias: Historia[];
   usuarioAtualId: string;
   sessaoId: string;
   meuRole: number;
   aoVoltar: () => void | Promise<void>;
   aoEnviarVoto?: (valor: number, participaVotacao: boolean) => Promise<void>;
   aoRevelarVotos?: () => Promise<void>;
   aoResetarVotos?: () => Promise<void>;
   aoSelecionarHistoria?: (historiaId: string) => Promise<void>;
   aoEncerrarSessao?: () => Promise<void>;
   aoAnularVoto?: (votoId: string) => Promise<void>;
   aoReordenarHistorias?: (historias: Historia[]) => Promise<void>;
   aoBuscarVotosPorHistoria?: (
      historiaId: string,
   ) => Promise<VotosPorHistoriaResponse | null>;
   modoVisualizacao?: boolean;
   historiaVisualizadaId?: string | null;
   onModoVisualizacaoChange?: (ativo: boolean, historiaId?: string) => void;
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
   aoBuscarVotosPorHistoria,
   modoVisualizacao = false,
   historiaVisualizadaId,
   onModoVisualizacaoChange,
}: SalaPlanningProps) {
   // Estados
   const [votoRascunho, setVotoRascunho] = useState<string | null>(null);
   const [historiaAtualId, setHistoriaAtualId] = useState<string | null>(null);
   const [modalVisitantesAberto, setModalVisitantesAberto] = useState(false);
   const [modalParticipantesAberto, setModalParticipantesAberto] =
      useState(false);
   const [loadingAcao, setLoadingAcao] = useState(false);
   const [termoBusca, setTermoBusca] = useState('');
   const [listaVotosCarregados, setListaVotosCarregados] =
      useState<VotosPorHistoriaResponse>({
         media: 0,
         voto_vencedor: 0,
         votos: [],
      });
   const [carregandoVotos, setCarregandoVotos] = useState(false);
   const [pausarPolling, setPausarPolling] = useState(false);

   const eProprietario = sala && sala.criado_por === usuarioAtualId;
   const iniciouSessao =
      sala && sala.sessaoAtiva?.iniciada_por === usuarioAtualId;
   const podeEncerrarSessao = eProprietario || iniciouSessao;

   // Mutations
   const [adicionarVisitante, { isLoading: adicionandoVisitante }] =
      useAdicionarVisitanteMutation();

   // Lazy query para listar participantes
   const [
      buscarParticipantes,
      { data: participantesData, isFetching: carregandoParticipantes },
   ] = useLazyListarParticipantesSalaQuery();
   const [pesquisarPessoas, { data: pessoasEncontradas, isFetching }] =
      useLazyPesquisarPorNomeOuEmailQuery();

   // Verifica se está em modo prática (sem histórias)
   const emModoPratica = !historias || historias.length === 0;

   const buscaPessoasTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
   );
   const votosRevelados = modoVisualizacao ? true : sala.votos_revelados;

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

         if (idHistoria && aoBuscarVotosPorHistoria) {
            try {
               const votos = await aoBuscarVotosPorHistoria(idHistoria);
               // Atualizar estado com votos carregados via polling
               setListaVotosCarregados({
                  media: votos?.media ?? 0,
                  voto_vencedor: votos?.voto_vencedor ?? 0,
                  votos: votos?.votos ?? [],
               });
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
      if (
         modoVisualizacao &&
         historiaVisualizadaId &&
         aoBuscarVotosPorHistoria
      ) {
         // Limpar votos antes de buscar
         setListaVotosCarregados({
            media: 0,
            voto_vencedor: 0,
            votos: [],
         });
         setCarregandoVotos(true);

         aoBuscarVotosPorHistoria(historiaVisualizadaId)
            .then((votos) => {
               setListaVotosCarregados({
                  media: votos?.media ?? 0,
                  voto_vencedor: votos?.voto_vencedor ?? 0,
                  votos: votos?.votos ?? [],
               });
            })
            .catch((erro: unknown) => {
               setListaVotosCarregados({
                  media: 0,
                  voto_vencedor: 0,
                  votos: [],
               });
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
      if (
         !modoVisualizacao &&
         sala.historia_atual_id &&
         aoBuscarVotosPorHistoria
      ) {
         // Limpar votos antes de buscar
         setListaVotosCarregados({
            media: 0,
            voto_vencedor: 0,
            votos: [],
         });
         setCarregandoVotos(true);
         setPausarPolling(true);

         aoBuscarVotosPorHistoria(sala.historia_atual_id)
            .then((votos) => {
               setListaVotosCarregados({
                  media: votos?.media ?? 0,
                  voto_vencedor: votos?.voto_vencedor ?? 0,
                  votos: votos?.votos ?? [],
               });
            })
            .catch((erro: unknown) => {
               setListaVotosCarregados({
                  media: 0,
                  voto_vencedor: 0,
                  votos: [],
               });
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
   const votoConfirmado = !!votoUsuario;
   const votoSelecionado = votoConfirmado
      ? votoDoServidor !== undefined
         ? votoDoServidor.toString()
         : null
      : votoRascunho;

   // Usar resumoParticipantes do backend para contadores
   const totalDevemVotar = sala.resumoParticipantes?.totalDevemVotar ?? 0;
   const totalVotosParticipantes = votosAtivos.length;
   const todosVotaram =
      totalDevemVotar > 0 && totalVotosParticipantes >= totalDevemVotar;
   const totalOnline = sala.resumoParticipantes?.totalOnline ?? 0;
   const totalParticipantes = sala.resumoParticipantes?.totalParticipantes ?? 0;

   // Handlers
   const handleSelecionarVoto = (carta: string) => {
      // Desabilitar seleção se estiver em modo visualização
      if (votoConfirmado || modoVisualizacao) return;

      if (votoSelecionado === carta) {
         setVotoRascunho(null);
      } else {
         setVotoRascunho(carta);
      }
   };

   const handleConfirmarVoto = async (participaVotacao: boolean) => {
      // Desabilitar confirmação se estiver em modo visualização
      if (!votoSelecionado || votoConfirmado || modoVisualizacao) {
         return;
      }

      try {
         setLoadingAcao(true);
         const valorNumerico = VOTO_MAP[votoSelecionado];
         if (valorNumerico === undefined) {
            toast.error('Voto inválido');
            return;
         }

         if (aoEnviarVoto) {
            await aoEnviarVoto(valorNumerico, participaVotacao);
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao confirmar voto:', error);
         }
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleCancelarVoto = () => {
      if (votoConfirmado) return;
      setVotoRascunho(null);
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
         setVotoRascunho(null);
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao resetar votação:', error);
         }
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleMudarHistoria = async (historiaId: string) => {
      try {
         setLoadingAcao(true);
         setHistoriaAtualId(historiaId);
         setVotoRascunho(null);

         if (aoSelecionarHistoria) {
            await aoSelecionarHistoria(historiaId);
         }
      } catch (error) {
         if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao buscar votos da história:', error);
         }
      } finally {
         setLoadingAcao(false);
      }
   };

   const handleReordenarHistorias = async (novasHistorias: Historia[]) => {
      if (aoReordenarHistorias) {
         await aoReordenarHistorias(novasHistorias);
      }
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
      if (buscaPessoasTimerRef.current) {
         clearTimeout(buscaPessoasTimerRef.current);
      }
      if (termo.length < 2) {
         return;
      }
      buscaPessoasTimerRef.current = setTimeout(() => {
         pesquisarPessoas({ termo });
      }, 800);
   };

   useEffect(() => {
      return () => {
         if (buscaPessoasTimerRef.current) {
            clearTimeout(buscaPessoasTimerRef.current);
         }
      };
   }, []);

   const handleAdicionarVisitante = async (pessoaId: string) => {
      setLoadingAcao(true);
      if (!sala?.id) {
         toastError({
            description:
               'ID da sala não encontrado. Não é possível adicionar visitante.',
         });
         setLoadingAcao(false);
         return;
      }

      try {
         const resultado = await adicionarVisitante({
            sala_id: sala.id,
            pessoa_id: pessoaId,
         }).unwrap();
         setLoadingAcao(false);
         toastSuccess({
            description: `${resultado.Mensagem}`,
         });
         setModalVisitantesAberto(false);
         setTermoBusca('');
      } catch (error) {
         setLoadingAcao(false);
         const erro = getApiErrorMessage(error);
         toastError({
            title: erro.Mensagem,
            description: erro.Detalhe,
         });
      }
   };

   const handleBuscarParticipantes = async () => {
      setLoadingAcao(true);
      try {
         await buscarParticipantes({
            sala_id: sala.id,
            ...(sessaoId ? { sessao_id: sessaoId } : {}),
         }).unwrap();
         setModalParticipantesAberto(true);
         setLoadingAcao(false);
      } catch (error) {
         setLoadingAcao(false);
         const erro = getApiErrorMessage(error);
         toastError({
            title: erro.Mensagem,
            description: erro.Detalhe,
         });
      }
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
         {loadingAcao ||
            (carregandoVotos && (
               <Loading
                  active
                  type="transaction"
               />
            ))}
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
                     loadingAcao={loadingAcao}
                  />

                  {/* Lista de Histórias - apenas se não estiver em modo prática */}

                  <div className="mt-4">
                     <ListaHistorias
                        loading={loadingAcao || carregandoVotos}
                        role={meuRole}
                        historias={historias}
                        historiaAtualId={historiaAtualId || undefined}
                        votacaoFinalizada={votosRevelados}
                        onMudarHistoria={handleMudarHistoria}
                        onReordenar={handleReordenarHistorias}
                        onModoVisualizacaoChange={onModoVisualizacaoChange}
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
                     <ListaParticipantes
                        participantes={
                           participantesData?.Resultado?.participantes ?? []
                        }
                        open={modalParticipantesAberto}
                        onOpenChange={setModalParticipantesAberto}
                        onBuscarParticipantes={handleBuscarParticipantes}
                        carregando={carregandoParticipantes}
                        votos={votosAtivos}
                        totalOnline={totalOnline}
                        totalParticipantes={totalParticipantes}
                        meuRole={meuRole}
                        votosRevelados={votosRevelados || modoVisualizacao}
                        handleAnularVoto={handleAnularVoto}
                        salaId={sala.id}
                        sessaoId={sessaoId}
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
                  votoConfirmado={votoConfirmado}
                  loadingAcao={loadingAcao}
                  sessaoId={sessaoId}
                  participaVotacaoInicial={undefined}
                  modoVisualizacao={modoVisualizacao}
                  handleSelecionarVoto={handleSelecionarVoto}
                  handleConfirmarVoto={handleConfirmarVoto}
                  handleCancelarVoto={handleCancelarVoto}
               />

               {/* Action Buttons */}
               <div className="flex w-full justify-center gap-3">
                  {/* Adicionar Visitante */}
                  {sessaoId && meuRole <= 1 && (
                     <ButtonCustom
                        icon={<UserPlus className="h-4 w-4" />}
                        onClick={() => setModalVisitantesAberto(true)}
                     >
                        <span className="text-sm">Adicionar Visitante</span>
                     </ButtonCustom>
                  )}

                  {/* Revelar/Resetar - desabilitado em modo visualização */}

                  {eProprietario && !votosRevelados && !modoVisualizacao && (
                     <ButtonCustom
                        onClick={handleRevelarVotos}
                        disabled={!todosVotaram || loadingAcao}
                        loading={loadingAcao}
                        icon={<Eye className="h-5 w-5" />}
                        text="Revelar Votos"
                     ></ButtonCustom>
                  )}

                  {eProprietario && votosRevelados && !modoVisualizacao && (
                     <ButtonCustom
                        onClick={() => handleResetarVotacao()}
                        disabled={loadingAcao}
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
               pessoas={pessoasEncontradas?.Resultado?.pessoas || []}
               carregando={isFetching}
               onAdicionar={handleAdicionarVisitante}
               adicionando={adicionandoVisitante}
            />
         </div>
      </>
   );
}
