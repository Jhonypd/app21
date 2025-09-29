import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RiLayoutColumnLine } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa6';
interface TableToolbarProps<T> {
  table: Table<T>;
  onAddSection?: () => void;
}

export function TableToolbar<T>({
  table,
  onAddSection,
}: TableToolbarProps<T>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              <RiLayoutColumnLine />
              <span className="hidden lg:inline">
                Customize Columns
              </span>
              <span className="lg:hidden">Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
          >
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !==
                    'undefined' && column.getCanHide(),
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddSection}
        >
          <FaPlus />
          <span className="hidden lg:inline">
            Add Section
          </span>
        </Button>
      </div>
    </div>
  );
}
