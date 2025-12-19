'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Historia {
  id: string;
  titulo: string;
  descricao?: string;
}
interface CardHistoriaProps {
  historia: Historia;
  isAtual?: boolean;
  onClick?: () => void;
}
const CardHistoria: React.FC<CardHistoriaProps> = ({
  historia,
  isAtual,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: historia.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-center gap-2 rounded-lg border pr-1 transition-all ${
          isAtual
            ? 'border-primary bg-primary/20'
            : 'border-border bg-card hover:bg-accent'
        }`}
      >
        {/* Drag Handle */}
        <Button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab px-2 py-3 active:cursor-grabbing"
        >
          <GripVerticalIcon className="h-5 w-5" />
        </Button>

        {/* Conteúdo clicável */}
        <Button
          variant="ghost"
          onClick={onClick}
          className="flex-1 py-3 pr-3 text-left hover:bg-transparent"
        >
          <p
            className={`text-sm font-medium ${isAtual ? 'text-primary-foreground' : ''}`}
          >
            {historia.titulo}
          </p>
          {historia.descricao && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              - {historia.descricao}
            </p>
          )}
        </Button>

        {isAtual && <Badge>Atual</Badge>}
      </div>
    </>
  );
};
export default CardHistoria;
