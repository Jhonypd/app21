'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ButtonCustom } from '../button-custom';
import { cn } from '@/lib/utils';

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
   draggable?: boolean;
   onClick?: () => void;
}

function CardHistoriaDraggable({
   historia,
   isAtual,
   draggable = true,
   onClick,
}: CardHistoriaProps) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({
      id: historia.id,
      disabled: !draggable,
   });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
   };

   const handleDisabled = !draggable || isAtual || historia.jaFoiVotada;

   return (
      <div
         ref={setNodeRef}
         style={style}
         className={cn(
            'group flex w-full items-center overflow-hidden rounded-lg border transition-all',
            isAtual
               ? 'border-primary bg-primary/20'
               : 'border-border bg-card group-hover:bg-accent',
         )}
      >
         <ButtonCustom
            {...attributes}
            {...listeners}
            disabled={handleDisabled}
            variant="ghost"
            className="cursor-grab"
         >
            <GripVerticalIcon className="h-5 w-5" />
         </ButtonCustom>

         <ButtonCustom
            onClick={onClick}
            className="min-w-0 flex-1 bg-transparent hover:bg-transparent"
         >
            <div className="flex w-full items-center justify-between">
               <p
                  className={cn(
                     'truncate text-sm font-medium',
                     isAtual && 'text-primary-foreground',
                  )}
               >
                  {historia.titulo}
               </p>

               {historia.jaFoiVotada && (
                  <Badge
                     variant="success"
                     className="shrink-0 bg-green-500 text-white"
                  >
                     {historia.voto?.[0] ?? '-'}
                  </Badge>
               )}
            </div>
         </ButtonCustom>
      </div>
   );
}

function CardHistoriaFixo({ historia, isAtual, onClick }: CardHistoriaProps) {
   return (
      <div
         className={cn(
            'group flex w-full items-center overflow-hidden rounded-lg border transition-all',
            isAtual
               ? 'border-primary bg-primary/20'
               : 'border-border bg-card group-hover:bg-accent',
         )}
      >
         {/* handle “visual” mas sem listeners */}
         <ButtonCustom
            disabled
            variant="ghost"
            className="cursor-not-allowed"
         >
            <GripVerticalIcon className="h-5 w-5" />
         </ButtonCustom>

         <ButtonCustom
            onClick={onClick}
            className="min-w-0 flex-1 bg-transparent hover:bg-transparent"
         >
            <div className="flex w-full items-center justify-between">
               <p
                  className={cn(
                     'flex flex-col items-start truncate text-sm font-medium',
                     isAtual && 'text-primary-foreground',
                  )}
               >
                  <span>{historia.titulo}</span>
                  <span className="text-muted-foreground max-w-3/4 truncate text-[10px] text-ellipsis">
                     {historia.descricao}
                  </span>
               </p>

               {historia.jaFoiVotada && (
                  <Badge
                     variant="success"
                     className="shrink-0 bg-green-500 text-white"
                  >
                     {historia.voto?.[0] ?? '-'}
                  </Badge>
               )}
            </div>
         </ButtonCustom>
      </div>
   );
}

const CardHistoria: React.FC<CardHistoriaProps> = (props) => {
   // Se estiver fora do SortableContext, não pode chamar useSortable.
   if (!props.draggable) {
      return <CardHistoriaFixo {...props} />;
   }
   return <CardHistoriaDraggable {...props} />;
};

export default CardHistoria;
