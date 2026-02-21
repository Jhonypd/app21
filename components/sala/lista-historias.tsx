'use client';

import { useState } from 'react';
import DialogConfirmacao from '@/components/dialog-confirmacao';
import {
  ArrowRight,
  ArrowLeft,
  ScrollText,
  ScrollTextIcon,
  ListChevronsDownUpIcon,
} from 'lucide-react';
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
import { ModalBase } from './modal-base';
import CardHistoria from './card-historia';
import { ButtonCustom } from '../button-custom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface Historia {
  id: string;
  titulo: string;
  descricao?: string;
  jaFoiVotada: boolean;
  historiaAtual: boolean;
  voto: number[] | [];
}

interface ListaHistoriasProps {
  loading: boolean;
  role: number;
  historias: Historia[];
  historiaAtualId?: string;
  votacaoFinalizada: boolean;
  onMudarHistoria: (historiaId: string) => Promise<void>;
  onReordenar?: (historias: Historia[]) => void;
  onModoVisualizacaoChange?: (
    ativo: boolean,
    historiaId?: string,
  ) => void;
}

export function ListaHistorias({
  historias: historiasIniciais,
  historiaAtualId,
  votacaoFinalizada,
  onMudarHistoria,
  onReordenar,
  onModoVisualizacaoChange,
  role,
  loading,
}: ListaHistoriasProps) {
  const [modalReordenarAberto, setModalReordenarAberto] =
    useState(false);
  const [historiasOrdenadas, setHistoriasOrdenadas] =
    useState(historiasIniciais);
  const [dialogConfirmacao, setDialogConfirmacao] =
    useState(false);
  const [proximaHistoriaId, setProximaHistoriaId] =
    useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] =
    useState(false);
  const [historiaVisualizadaId, setHistoriaVisualizadaId] =
    useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // História exibida (atual ou visualizada)
  const historiaExibidaId = modoVisualizacao
    ? historiaVisualizadaId
    : historiaAtualId;

  const indiceExibido = historiaExibidaId
    ? historiasIniciais.findIndex(
        (h) => h.id === historiaExibidaId,
      )
    : -1;

  // Pode avançar se não é o último da lista
  const temProxima =
    indiceExibido >= 0 &&
    indiceExibido < historiasIniciais.length - 1;

  // Pode voltar se não é o primeiro da lista
  const temAnterior = indiceExibido > 0;

  // Verifica se está exibindo a história atual (não em modo visualização)
  const estaNoAtual =
    !modoVisualizacao ||
    historiaExibidaId === historiaAtualId;

  const historiaExibida = historiasIniciais[indiceExibido];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setHistoriasOrdenadas((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id === active.id,
        );
        const newIndex = items.findIndex(
          (item) => item.id === over.id,
        );
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSalvarOrdem = () => {
    if (onReordenar) {
      onReordenar(historiasOrdenadas);
    }
    setModalReordenarAberto(false);
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

    const proximaHistoria =
      historiasIniciais[indiceExibido + 1];

    // Se está em modo visualização, avança para a próxima
    if (modoVisualizacao) {
      // Se a próxima é a história atual, sai do modo visualização
      if (proximaHistoria.id === historiaAtualId) {
        setModoVisualizacao(false);
        setHistoriaVisualizadaId(null);
        onModoVisualizacaoChange?.(false);
      } else {
        // Continua em modo visualização na próxima
        setHistoriaVisualizadaId(proximaHistoria.id);
        onModoVisualizacaoChange?.(
          true,
          proximaHistoria.id,
        );
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

    const historiaAnterior =
      historiasIniciais[indiceExibido - 1];

    // Ativa/atualiza modo visualização
    setModoVisualizacao(true);
    setHistoriaVisualizadaId(historiaAnterior.id);
    onModoVisualizacaoChange?.(true, historiaAnterior.id);
  };

  const handleVoltarParaAtual = () => {
    setModoVisualizacao(false);
    setHistoriaVisualizadaId(null);
    onModoVisualizacaoChange?.(false);
  };

  const proximaHistoriaTitulo = proximaHistoriaId
    ? historiasIniciais.find(
        (h) => h.id === proximaHistoriaId,
      )?.titulo
    : '';

  if (
    !historiasIniciais ||
    historiasIniciais.length === 0
  ) {
    return null;
  }

  const podeMudarHistoria = role < 2;
  return (
    <>
      <div className="space-y-3">
        {/* História atual/visualizada em destaque */}
        {historiaExibida && (
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
                {historiaExibida.descricao && (
                  <TooltipContent className="bg-primary flex max-h-16 min-h-0 max-w-60 flex-col items-center justify-center truncate overflow-y-hidden text-ellipsis text-white/80">
                    <p className="h-full w-full truncate text-ellipsis">
                      {historiaExibida.descricao}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </p>
            <ButtonCustom
              variant="outline"
              onClick={() => setModalReordenarAberto(true)}
              icon={
                <ListChevronsDownUpIcon className="text-muted-foreground" />
              }
              disabled={
                loading || !podeMudarHistoria || !temProxima
              }
            ></ButtonCustom>
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
                loading
              }
              variant="default"
              size="md"
              title={
                !temAnterior
                  ? 'Não há história anterior'
                  : ''
              }
              icon={<ArrowLeft className="mr-2 h-5 w-5" />}
            ></ButtonCustom>

            {/* Indicador de progresso */}
            {indiceExibido >= 0 && (
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>
                  {indiceExibido + 1} de{' '}
                  {historiasIniciais.length}
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
        onOpenChange={setModalReordenarAberto}
        titulo={
          <div className="flex items-center gap-2">
            <ScrollText className="text-muted-foreground h-5 w-5" />
            Histórias
          </div>
        }
        maxWidth="lg"
        botoesAcoes={
          <>
            <ButtonCustom
              className="uppercase"
              variant="outline"
              onClick={() => setModalReordenarAberto(false)}
            >
              {podeMudarHistoria ? 'Cancelar' : 'Fechar'}
            </ButtonCustom>
            {podeMudarHistoria && (
              <ButtonCustom
                onClick={handleSalvarOrdem}
                className="uppercase"
              >
                Salvar Ordem
              </ButtonCustom>
            )}
          </>
        }
      >
        <div className="w-full space-y-3 overflow-x-hidden px-3">
          <p className="text-muted-foreground text-sm">
            Arraste as histórias para reorganizar a ordem de
            votação. A história atual será mantida ativa.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={historiasOrdenadas.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
              disabled={!podeMudarHistoria}
            >
              <div className="w-full space-y-2">
                {historiasOrdenadas.map((historia) => (
                  <CardHistoria
                    key={historia.id}
                    historia={historia}
                    isAtual={
                      historia.id === historiaAtualId
                    }
                    draggable={
                      historia.voto.length > 0
                        ? false
                        : true
                    }
                    onClick={() =>
                      handleSolicitarMudanca(historia.id)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </ModalBase>

      {/* Dialog de Confirmação */}
      <DialogConfirmacao
        titulo="Mudar para próxima história?"
        textoPadrao={`Tem certeza que deseja mudar para "${proximaHistoriaTitulo}"? Os votos atuais serão finalizados.`}
        btnCancelar="Cancelar"
        btnConfirmar="Confirmar"
        dialogAberto={dialogConfirmacao}
        setDialogAberto={setDialogConfirmacao}
        dialogLoading={loading}
        handleSubmit={handleConfirmarMudanca}
      />
    </>
  );
}
