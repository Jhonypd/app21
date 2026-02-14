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
  jaFoiVotada: boolean;
  voto: number[] | [];
}
interface CardHistoriaProps {
  historia: Historia;
  isAtual?: boolean;
  // onClick?: () => void;
}
const CardHistoria: React.FC<CardHistoriaProps> = ({
  historia,
  isAtual,
  // onClick,
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
        className={`group flex w-full items-center rounded-lg border transition-all ${
          isAtual
            ? 'border-primary bg-primary/20'
            : 'border-border bg-card hover:bg-accent'
        }`}
      >
        {/* Drag Handle */}
        <Button
          {...attributes}
          {...listeners}
          disabled={isAtual || historia.jaFoiVotada}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVerticalIcon className="h-5 w-5" />
        </Button>

        {/* Conteúdo clicável */}
        <Button
          variant="ghost"
          // onClick={onClick}
          className="relative flex w-full justify-between text-left hover:bg-transparent"
        >
          <p
            className={`text-sm font-medium ${isAtual ? 'text-primary-foreground' : ''}`}
          >
            {historia.titulo}
          </p>
          {/* o backend precisa entregar o voto campeão */}
          {historia.jaFoiVotada && (
            <Badge
              variant={'success'}
              className="absolute top-1/2 right-14 -translate-y-1/2 bg-green-500 text-white"
            >
              {historia.voto[0]}
            </Badge>
          )}
        </Button>
      </div>
    </>
  );
};
export default CardHistoria;
