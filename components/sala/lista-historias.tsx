'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import DialogConfirmacao from '@/components/dialog-confirmacao';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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

interface Historia {
  id: string;
  titulo: string;
  descricao?: string;
}

interface ListaHistoriasProps {
  historias: Historia[];
  historiaAtualId?: string;
  votacaoFinalizada: boolean;
  onMudarHistoria: (historiaId: string) => Promise<void>;
  onReordenar?: (historias: Historia[]) => void;
}

export function ListaHistorias({
  historias: historiasIniciais,
  historiaAtualId,
  votacaoFinalizada,
  onMudarHistoria,
  onReordenar,
}: ListaHistoriasProps) {
  const [modalReordenarAberto, setModalReordenarAberto] =
    useState(false);
  const [historiasOrdenadas, setHistoriasOrdenadas] =
    useState(historiasIniciais);
  const [dialogConfirmacao, setDialogConfirmacao] =
    useState(false);
  const [proximaHistoriaId, setProximaHistoriaId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const indiceAtual = historiaAtualId
    ? historiasIniciais.findIndex(
        (h) => h.id === historiaAtualId,
      )
    : -1;

  const temProxima =
    indiceAtual >= 0 &&
    indiceAtual < historiasIniciais.length - 1;
  const temAnterior = indiceAtual > 0;
  const historiaAtual = historiasIniciais[indiceAtual];

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

    setLoading(true);
    try {
      await onMudarHistoria(proximaHistoriaId);
      setDialogConfirmacao(false);
      setProximaHistoriaId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProxima = () => {
    if (temProxima) {
      const proximaHistoria =
        historiasIniciais[indiceAtual + 1];
      handleSolicitarMudanca(proximaHistoria.id);
    }
  };

  const handleAnterior = () => {
    if (temAnterior) {
      const historiaAnterior =
        historiasIniciais[indiceAtual - 1];
      handleSolicitarMudanca(historiaAnterior.id);
    }
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

  return (
    <>
      <div className="space-y-3">
        {/* História atual em destaque */}
        {historiaAtual && (
          <div className="border-primary/30 bg-primary/10 flex h-full w-full gap-2 rounded-lg border p-4 text-base font-medium">
            <p className="text-muted-foreground text-nowrap">
              Votando agora:
            </p>
            <p className="text-foreground truncate font-semibold text-ellipsis">
              {historiaAtual.titulo}
            </p>
          </div>
        )}

        {/* Botões de navegação e reordenação */}
        <div className="flex gap-2">
          {/* Botão Anterior */}
          <Button
            onClick={handleAnterior}
            disabled={!votacaoFinalizada || !temAnterior}
            variant="outline"
            className="flex-1"
            title={
              !votacaoFinalizada
                ? 'Finalize a votação primeiro'
                : ''
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {/* Indicador de progresso */}
          {indiceAtual >= 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>
                {indiceAtual + 1} de{' '}
                {historiasIniciais.length}
              </span>
            </div>
          )}
          {/* Botão Próxima */}
          <Button
            onClick={handleProxima}
            disabled={!votacaoFinalizada || !temProxima}
            variant="default"
            className="flex-1"
            title={
              !votacaoFinalizada
                ? 'Finalize a votação primeiro'
                : ''
            }
          >
            Próxima
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal de reordenação */}
      <ModalBase
        open={modalReordenarAberto}
        onOpenChange={setModalReordenarAberto}
        titulo="Reordenar Histórias"
        maxWidth="lg"
        botoes={
          <>
            <Button
              variant="outline"
              onClick={() => setModalReordenarAberto(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvarOrdem}>
              Salvar Ordem
            </Button>
          </>
        }
      >
        <div className="space-y-3">
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
            >
              <div className="space-y-2">
                {historiasOrdenadas.map((historia) => (
                  <CardHistoria
                    key={historia.id}
                    historia={historia}
                    isAtual={
                      historia.id === historiaAtualId
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
