import { CellContext } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { ReactNode, isValidElement } from 'react';
import { Badge } from '../ui/badge';
import { SquarePen } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DataTableCellProps<TData, TValue> {
  cell: CellContext<TData, TValue>;
  className?: string;
  formatter?: (value: TValue) => ReactNode;
}

const DataTableCell = <TData, TValue>({
  cell,
  className,
  formatter,
}: DataTableCellProps<TData, TValue>) => {
  const value = cell.getValue();

  const safeFormat = (val: TValue): ReactNode => {
    // Se já for um elemento React, retorna como está
    if (isValidElement(val)) {
      return val;
    }

    if (formatter) return formatter(val);

    // Caso seja string ISO ou Date, tenta formatar como data
    if (typeof val === 'string') {
      const parsed = parseISO(val);
      if (isValid(parsed)) {
        return format(parsed, 'dd/MM/yyyy HH:mm', {
          locale: ptBR,
        });
      }
      return val;
    }

    if (val instanceof Date && isValid(val)) {
      return format(val, 'dd/MM/yyyy HH:mm', {
        locale: ptBR,
      });
    }

    if (
      typeof val === 'number' ||
      typeof val === 'boolean'
    ) {
      return val.toString();
    }

    return JSON.stringify(val);
  };

  // Se o valor for um elemento React, renderiza diretamente
  if (isValidElement(value)) {
    return value;
  }

  if (value === 'ativo' || value === 'inativo') {
    return (
      <Badge
        variant={
          value === 'ativo' ? 'success' : 'destructive'
        }
        className="ml-1 cursor-default text-xs font-bold text-white uppercase"
      >
        {safeFormat(value)}
      </Badge>
    );
  }

  if (value === 'editar') {
    return (
      <SquarePen
        aria-label="Editar"
        className="text-primary h-5 w-5 cursor-pointer"
      />
    );
  }

  return safeFormat(value);
};

export default DataTableCell;
