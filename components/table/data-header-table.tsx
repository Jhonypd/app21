import { ArrowUpDownIcon } from 'lucide-react';
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
    // <Button
    //   className="text-primary hover:text-primary/60 flex w-full justify-start text-start uppercase hover:bg-transparent"
    //   variant="ghost"

    // >
    //   {label}
    //   {sortable && (
    //     <ArrowUpDownIcon className="ml-2 h-4 w-4" />
    //   )}
    // </Button>
    <div
      className="text-primary hover:text-primary/60 flex w-full justify-start text-start uppercase hover:bg-transparent"
      onClick={handleSort}
    >
      {label}
      {sortable && (
        <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      )}
    </div>
  );
}
