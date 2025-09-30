import { ArrowUpDownIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Column } from '@tanstack/react-table';

type HeaderTableProps<T> = {
  label: string;
  column: Column<T>;
  sortable?: boolean;
};

export function HeaderTable<T>({
  label,
  column,
  sortable = true,
}: HeaderTableProps<T>) {
  const handleSort = () => {
    if (sortable) {
      column.toggleSorting(column.getIsSorted() === 'asc');
    }
  };

  return (
    <Button
      className="text-[#3f4053] uppercase hover:bg-transparent"
      variant="ghost"
      onClick={handleSort}
    >
      {label}
      {sortable && (
        <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
