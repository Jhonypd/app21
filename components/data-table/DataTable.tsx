import { SortableTable } from './SortableTable';
import { Toolbar } from '../toolbar';
import DeleteButton from '../delete-button';

interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  format?: (value: any) => string | React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  form: React.ReactNode;
  columns: ColumnConfig<T>[];
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (ids: string[]) => void;
  onSearchChange?: (searchValue: string) => void;
  searchValue?: string;
  selectedItems?: T[];
  onSelectionChange?: (selectedItems: T[]) => void;
  deleteButtonTitle?: string;
  deleteButtonDescription?: string;
}

export function DataTable<
  T extends { id: string | number },
>({
  data,
  form,
  columns,
  onCreate,
  onEdit,
  onDelete,
  onSearchChange,
  searchValue = '',
  selectedItems = [],
  onSelectionChange,
  deleteButtonTitle = 'Você tem certeza que deseja excluir o(s) item(s) selecionado(s)?',
  deleteButtonDescription = 'Esta ação não pode ser desfeita.',
}: DataTableProps<T>) {
  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      alert('Função de pesquisa ainda não implementada.');
    }
  };

  const handleOpenCreateForm = () => {
    if (onCreate) {
      onCreate();
    }
  };

  const handleDelete = async () => {
    if (onDelete && selectedItems.length > 0) {
      const ids = selectedItems.map((item) =>
        item.id.toString(),
      );
      await onDelete(ids);
    }
  };

  const tableColumns = columns.map((col) => ({
    key: col.key as string,
    label: col.label,
    format: col.format,
  }));

  console.log({ data });

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <Toolbar
          onSearchChange={handleSearchChange}
          searchValue={searchValue}
          onOpenCreateForm={handleOpenCreateForm}
          deleteButton={
            <DeleteButton
              onSubmit={handleDelete}
              description={deleteButtonDescription}
              disabled={selectedItems.length === 0}
              title={deleteButtonTitle}
            />
          }
        >
          {form}
        </Toolbar>
        <SortableTable
          data={data}
          columns={tableColumns}
          onEdit={onEdit}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}
