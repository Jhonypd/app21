import { SquarePen } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '../ui/button';

interface ActionCellProps {
  id: string;
  onEdit: (id: string) => void;
  className?: string;
}

const DataTableEditCell = ({
  id,
  onEdit,
  className,
}: ActionCellProps) => {
  return (
    <Button
      variant={'ghost'}
      size={'icon'}
      onClick={() => onEdit(id)}
      className={cn(
        "text-primary hover:text-primary hover:bg-primary/10 inline-flex h-full cursor-pointer items-center justify-center gap-2 [&_svg:not([class*='size-'])]:size-6",
        className,
      )}
      aria-label="Editar procedimento"
    >
      <SquarePen size={22} />
    </Button>
  );
};

export default DataTableEditCell;
