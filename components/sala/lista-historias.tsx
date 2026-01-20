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

  const indiceAtual = historiaAtualId
    ? historiasIniciais.findIndex(
        (h) => h.id === historiaAtualId,
      )
    : -1;

  const indiceExibido = historiaExibidaId
    ? historiasIniciais.findIndex(
        (h) => h.id === historiaExibidaId,
      )
    : -1;

  const temProxima =
    indiceAtual >= 0 &&
    indiceAtual < historiasIniciais.length - 1;
  const temAnterior = indiceAtual > 0;
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
    // Se está em modo visualização, desativa e volta para atual
    if (modoVisualizacao) {
      setModoVisualizacao(false);
      setHistoriaVisualizadaId(null);
      onModoVisualizacaoChange?.(false);
      return;
    }

    // Senão, avança normalmente
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

      // NÃO chama onMudarHistoria (não atualiza banco)
      // Apenas ativa modo visualização
      setModoVisualizacao(true);
      setHistoriaVisualizadaId(historiaAnterior.id);
      onModoVisualizacaoChange?.(true, historiaAnterior.id);
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

  const podeMudarHistoria = role < 2;

  return (
    <>
      <div className="space-y-3">
        {/* História atual/visualizada em destaque */}
        {historiaExibida && (
          <div
            className={`flex h-full w-full gap-2 rounded-lg border p-4 text-base font-medium ${
              modoVisualizacao
                ? 'border-blue-500/30 bg-blue-500/10'
                : 'border-primary/30 bg-primary/10'
            }`}
          >
            <p className="text-muted-foreground text-nowrap">
              {modoVisualizacao
                ? 'Visualizando:'
                : 'Votando agora:'}
            </p>
            <p className="text-foreground truncate font-semibold text-ellipsis">
              {historiaExibida.titulo}
            </p>
          </div>
        )}

        {/* Botões de navegação e reordenação */}
        <div className="flex gap-2">
          {/* Botão Anterior */}
          <Button
            onClick={handleAnterior}
            disabled={
              !temAnterior ||
              modoVisualizacao ||
              !podeMudarHistoria
            }
            variant="outline"
            className="flex-1"
            title={
              modoVisualizacao
                ? 'Já está visualizando'
                : !temAnterior
                  ? 'Não há história anterior'
                  : ''
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

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
          <Button
            onClick={handleProxima}
            disabled={
              !modoVisualizacao &&
              (!votacaoFinalizada ||
                !temProxima ||
                !podeMudarHistoria)
            }
            variant="default"
            className="flex-1"
            title={
              modoVisualizacao
                ? 'Voltar para história atual'
                : !votacaoFinalizada
                  ? 'Finalize a votação primeiro'
                  : ''
            }
          >
            {modoVisualizacao
              ? 'Voltar para Atual'
              : 'Próxima'}
            {!modoVisualizacao && (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
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
