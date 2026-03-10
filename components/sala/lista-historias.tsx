'use client';

import { useState, useEffect } from 'react';
import DialogConfirmacao from '@/components/dialog-confirmacao';
import {
   ArrowRight,
   ArrowLeft,
   ScrollText,
   ScrollTextIcon,
   ListChevronsDownUpIcon,
   InfoIcon,
   Plus,
   Trash2,
} from 'lucide-react';
import { ModalAdicionarHistorias } from './modal-adicionar-historias';
import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragEndEvent,
} from '@dnd-kit/core';
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ModalBase } from '../modal-base';
import CardHistoria from './card-historia';
import { ButtonCustom } from '../button-custom';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';

interface Historia {
   id: string;
   titulo: string;
   descricao?: string;
   jaFoiVotada: boolean;
   historiaAtual: boolean;
   ordem: number;
   voto: number[] | [];
}

interface ListaHistoriasProps {
   loading: boolean;
   uiDisabled?: boolean;
   role: number;
   historias: Historia[];
   historiaAtualId?: string;
   modoVisualizacao?: boolean;
   historiaVisualizadaId?: string | null;
   votacaoFinalizada: boolean;
   onMudarHistoria: (historiaId: string) => Promise<void>;
   onReordenar?: (
      historias: Historia[],
   ) => Promise<void | boolean | { Sucesso?: boolean }>;
   onModoVisualizacaoChange?: (ativo: boolean, historiaId?: string) => void;
   onAdicionarHistorias?: (
      historias: Array<{ titulo: string; descricao?: string; ordem: number }>,
   ) => Promise<void>;
}

export function ListaHistorias({
   historias: historiasIniciais,
   historiaAtualId,
   modoVisualizacao = false,
   historiaVisualizadaId = null,
   votacaoFinalizada,
   onMudarHistoria,
   onReordenar,
   onModoVisualizacaoChange,
   onAdicionarHistorias,
   role,
   loading,
   uiDisabled = false,
}: ListaHistoriasProps) {
   const [modalReordenarAberto, setModalReordenarAberto] = useState(false);
   const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
   const [salvandoReordenacao, setSalvandoReordenacao] = useState(false);
   const [historiasOrdenadas, setHistoriasOrdenadas] =
      useState(historiasIniciais);
   const [dialogConfirmacao, setDialogConfirmacao] = useState(false);
   const [proximaHistoriaId, setProximaHistoriaId] = useState<string | null>(
      null,
   );

   // Sincronizar historiasOrdenadas com historiasIniciais quando houver mudanças
   useEffect(() => {
      setHistoriasOrdenadas(historiasIniciais);
   }, [historiasIniciais]);

   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      }),
   );

   // História exibida (atual ou visualizada)
   const historiaExibidaId = modoVisualizacao
      ? (historiaVisualizadaId ?? historiaAtualId)
      : historiaAtualId;

   const indiceExibido = historiaExibidaId
      ? historiasIniciais.findIndex((h) => h.id === historiaExibidaId)
      : -1;

   // Pode avançar se não é o último da lista
   const temProxima =
      indiceExibido >= 0 && indiceExibido < historiasIniciais.length - 1;

   // Pode voltar se não é o primeiro da lista
   const temAnterior = indiceExibido > 0;

   // Verifica se está exibindo a história atual (não em modo visualização)
   const estaNoAtual =
      !modoVisualizacao || historiaExibidaId === historiaAtualId;

   const historiaExibida =
      historiasIniciais.length > 1
         ? historiasIniciais[indiceExibido]
         : historiasIniciais[0];

   const proximaOrdemInicial =
      Math.max(0, ...historiasIniciais.map((h) => h.ordem ?? 0)) + 1;

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
         // Não permite soltar sobre uma história votada ou a história atual
         const overItem = historiasOrdenadas.find(
            (item) => item.id === over.id,
         );
         const isOverLocked =
            overItem &&
            (overItem.voto.length > 0 ||
               overItem.jaFoiVotada ||
               over.id === historiaAtualId);

         if (isOverLocked) return;

         setHistoriasOrdenadas((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
         });
      }
   };

   const handleSalvarOrdem = async () => {
      if (!onReordenar) {
         return;
      }

      setSalvandoReordenacao(true);
      try {
         const resultado = await onReordenar(historiasOrdenadas);

         const sucessoExplicito =
            typeof resultado === 'boolean'
               ? resultado
               : typeof resultado === 'object' && resultado !== null
                 ? resultado.Sucesso !== false
                 : true;

         if (!sucessoExplicito) {
            return;
         }

         setModalReordenarAberto(false);
      } catch {
         // erro tratado no componente pai; modal permanece aberto
      } finally {
         setSalvandoReordenacao(false);
      }
   };

   const handleCancelarReordenacao = () => {
      setHistoriasOrdenadas(historiasIniciais);
      setModalReordenarAberto(false);
   };

   const handleRemoverDaLista = (historiaId: string) => {
      setHistoriasOrdenadas((items) =>
         items.filter((h) => h.id !== historiaId),
      );
   };

   const handleSolicitarMudanca = (historiaId: string) => {
      setProximaHistoriaId(historiaId);
      setDialogConfirmacao(true);
   };

   const handleConfirmarMudanca = async () => {
      if (!proximaHistoriaId) return;

      try {
         await onMudarHistoria(proximaHistoriaId);
         setDialogConfirmacao(false);
         setProximaHistoriaId(null);
      } catch (error) {
         // Lidar com erro (exibir toast, etc)
         console.error('Erro ao mudar história:', error);
      }
   };

   const handleProxima = () => {
      if (!temProxima) return;

      const proximaHistoria = historiasIniciais[indiceExibido + 1];

      // Se está em modo visualização, avança para a próxima
      if (modoVisualizacao) {
         // Se a próxima é a história atual, sai do modo visualização
         if (proximaHistoria.id === historiaAtualId) {
            onModoVisualizacaoChange?.(false);
         } else {
            // Continua em modo visualização na próxima
            onModoVisualizacaoChange?.(true, proximaHistoria.id);
         }
         return;
      }

      // Está na história atual + votação finalizada → solicita troca real
      if (votacaoFinalizada) {
         handleSolicitarMudanca(proximaHistoria.id);
      }
   };

   const handleAnterior = () => {
      if (!temAnterior) return;

      const historiaAnterior = historiasIniciais[indiceExibido - 1];

      // Ativa/atualiza modo visualização
      onModoVisualizacaoChange?.(true, historiaAnterior.id);
   };

   const handleVoltarParaAtual = () => {
      onModoVisualizacaoChange?.(false);
   };

   if (!historiasIniciais || historiasIniciais.length === 0) {
      return null;
   }

   const podeMudarHistoria = role < 2;

   return (
      <>
         <div className="space-y-3">
            {/* História atual/visualizada em destaque */}
            {historiaExibida && !loading ? (
               <div
                  className={`flex h-full w-full justify-between gap-2 rounded-lg border p-4 text-base font-medium ${
                     modoVisualizacao
                        ? 'border-blue-500/30 bg-blue-500/10'
                        : 'border-primary/30 bg-primary/10'
                  }`}
               >
                  <p className="text-foreground flex items-center gap-2 truncate font-semibold text-ellipsis">
                     <ScrollTextIcon className="text-muted-foreground" />
                     <Tooltip delayDuration={800}>
                        <TooltipTrigger>
                           {historiaExibida.titulo}
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary flex max-h-16 min-h-0 max-w-60 flex-col items-center justify-center truncate overflow-y-hidden text-ellipsis text-white/80">
                           <p className="h-full w-full truncate text-ellipsis">
                              {historiaExibida.descricao}
                           </p>
                        </TooltipContent>
                     </Tooltip>
                  </p>
                  <div className="flex gap-2">
                     {podeMudarHistoria && onAdicionarHistorias && (
                        <ButtonCustom
                           variant="outline"
                           onClick={() => setModalAdicionarAberto(true)}
                           icon={
                              <Plus className="text-muted-foreground h-4 w-4" />
                           }
                           disabled={loading || uiDisabled}
                           title="Adicionar histórias"
                        />
                     )}
                     <ButtonCustom
                        variant="outline"
                        onClick={() => setModalReordenarAberto(true)}
                        icon={
                           <ListChevronsDownUpIcon className="text-muted-foreground" />
                        }
                        disabled={loading || uiDisabled}
                     />
                  </div>
               </div>
            ) : (
               <div className="flex h-20 w-full flex-col justify-between gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
                  <div className="flex h-14 w-full items-center justify-between gap-2">
                     <div className="flex flex-1 items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-full rounded-md" />
                     </div>
                     <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
               </div>
            )}

            {/* Botões de navegação e reordenação */}
            <div className="flex w-full flex-col items-center gap-2">
               <div className="flex w-full items-center justify-around gap-2">
                  {/* Botão Anterior */}
                  <ButtonCustom
                     onClick={handleAnterior}
                     disabled={
                        !temAnterior ||
                        !podeMudarHistoria ||
                        loading ||
                        uiDisabled
                     }
                     variant="default"
                     size="md"
                     title={!temAnterior ? 'Não há história anterior' : ''}
                     icon={<ArrowLeft className="mr-2 h-5 w-5" />}
                  ></ButtonCustom>

                  {/* Indicador de progresso */}
                  {indiceExibido >= 0 && (
                     <div className="text-muted-foreground flex items-center justify-between text-sm">
                        <span>
                           {indiceExibido + 1} de {historiasIniciais.length}
                        </span>
                     </div>
                  )}
                  {/* Botão Próxima */}
                  <ButtonCustom
                     onClick={handleProxima}
                     disabled={
                        !temProxima ||
                        !podeMudarHistoria ||
                        loading ||
                        uiDisabled ||
                        (estaNoAtual && !votacaoFinalizada)
                     }
                     variant="default"
                     size="md"
                     title={
                        !temProxima
                           ? 'Não há próxima história'
                           : estaNoAtual && !votacaoFinalizada
                             ? 'Finalize a votação primeiro'
                             : ''
                     }
                     icon={<ArrowRight className="mr-2 h-5 w-5" />}
                  ></ButtonCustom>
               </div>
               <div className="flex w-full flex-1 items-center justify-center">
                  {modoVisualizacao && (
                     <ButtonCustom
                        variant="outline"
                        size="sm"
                        text="Voltar para historia atual"
                        className="uppercase"
                        onClick={handleVoltarParaAtual}
                     />
                  )}
               </div>
            </div>
         </div>

         {/* Modal de reordenação */}
         <ModalBase
            open={modalReordenarAberto}
            onOpenChange={(open) => {
               if (salvandoReordenacao) {
                  return;
               }
               if (!open) {
                  setHistoriasOrdenadas(historiasIniciais);
               }
               setModalReordenarAberto(open);
            }}
            titulo={
               <div className="flex items-center justify-between">
                  <p className="flex items-center gap-3">
                     <ScrollText className="text-muted-foreground h-5 w-5" />
                     Histórias
                  </p>
               </div>
            }
            maxWidth="lg"
            botoesAcoes={
               <>
                  <ButtonCustom
                     className="uppercase"
                     variant="outline"
                     onClick={handleCancelarReordenacao}
                     disabled={salvandoReordenacao || uiDisabled}
                  >
                     {podeMudarHistoria ? 'Cancelar' : 'Fechar'}
                  </ButtonCustom>
                  {podeMudarHistoria && (
                     <ButtonCustom
                        onClick={handleSalvarOrdem}
                        className="uppercase"
                        disabled={salvandoReordenacao || uiDisabled}
                     >
                        salvar
                     </ButtonCustom>
                  )}
               </>
            }
         >
            <div className="w-full space-y-3 overflow-hidden px-3">
               <div className="flex w-full items-center justify-between border-b border-b-slate-400/10">
                  <div className="text-muted-foreground flex w-full items-center gap-2 pb-2 text-lg font-semibold">
                     Histórias
                     <h2 className="text-base">
                        ({historiasOrdenadas.length})
                     </h2>
                  </div>
                  <Tooltip delayDuration={800}>
                     <TooltipTrigger>
                        <InfoIcon className="text-muted-foreground" />
                     </TooltipTrigger>
                     <TooltipContent className="flex max-h-16 min-h-0 max-w-60 flex-col overflow-y-hidden text-slate-800">
                        <p className="flex items-center gap-2 text-start md:text-sm">
                           Arraste as histórias para reorganizar a ordem de
                           votação. A história atual será mantida ativa.
                        </p>
                     </TooltipContent>
                  </Tooltip>
               </div>
               <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
               >
                  <SortableContext
                     items={historiasOrdenadas.map((h) => h.id)}
                     strategy={verticalListSortingStrategy}
                     disabled={!podeMudarHistoria || uiDisabled}
                  >
                     <div className="no-scrollbar max-h-60 w-full space-y-2 overflow-y-auto p-2">
                        {historiasOrdenadas.map((historia) => (
                           <div
                              key={historia.id}
                              className="flex items-center gap-2"
                           >
                              <div className="min-w-0 flex-1">
                                 <CardHistoria
                                    historia={historia}
                                    isAtual={historia.id === historiaAtualId}
                                    draggable={
                                       historia.voto.length > 0 ? false : true
                                    }
                                    onClick={() =>
                                       historiaAtualId !== historia.id
                                          ? handleSolicitarMudanca(historia.id)
                                          : undefined
                                    }
                                 />
                              </div>

                              {podeMudarHistoria && (
                                 <ButtonCustom
                                    disabled={
                                       historia.id === historiaAtualId ||
                                       historia.jaFoiVotada ||
                                       uiDisabled
                                    }
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-destructive/20 h-9 w-9 p-0 text-red-400"
                                    icon={<Trash2 className="h-4 w-4" />}
                                    title="Remover história"
                                    onClick={() =>
                                       handleRemoverDaLista(historia.id)
                                    }
                                 />
                              )}
                           </div>
                        ))}
                     </div>
                  </SortableContext>
               </DndContext>
            </div>
         </ModalBase>

         {/* Modal de Adicionar Histórias */}
         {onAdicionarHistorias && (
            <ModalAdicionarHistorias
               aberto={modalAdicionarAberto}
               proximaOrdemInicial={proximaOrdemInicial}
               aoFechar={() => setModalAdicionarAberto(false)}
               aoSalvar={onAdicionarHistorias}
               loading={loading || uiDisabled}
            />
         )}

         {/* Dialog de Confirmação */}
         <DialogConfirmacao
            titulo="Mudar para próxima história?"
            textoPadrao={`Tem certeza que deseja mudar para proxima historia? Os votos atuais serão finalizados e não poderão ser alterados.`}
            btnCancelar="Cancelar"
            btnConfirmar="Confirmar"
            dialogAberto={dialogConfirmacao}
            setDialogAberto={setDialogConfirmacao}
            dialogLoading={loading || uiDisabled}
            handleSubmit={handleConfirmarMudanca}
            tipo="padrao"
         />
      </>
   );
}
