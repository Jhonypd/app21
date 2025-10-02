import { Button } from '@/components/ui/button';
import { PlusIcon, Search } from 'lucide-react';
import { SearchInput } from './inputs/input-search';
import Loading from './loading';

interface ToolbarProps {
  children: React.ReactNode;
  onSearchChange: (value: string) => void;
  onOpenCreateForm: () => void;
  deleteButton: React.ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  isCreateLoading: boolean;
}

export const Toolbar = ({
  children,
  onSearchChange,
  onOpenCreateForm,
  deleteButton,
  searchValue = '',
  searchPlaceholder = 'Pesquisar serviços...',
  isCreateLoading = false,
}: ToolbarProps) => {
  return (
    <div className="flex w-full flex-col-reverse flex-nowrap justify-between gap-4 py-4 sm:flex-row">
      {isCreateLoading && (
        <Loading
          active
          type="transaction"
        />
      )}
      {/* Seção de Busca */}
      <div className="flex w-full items-center gap-3 sm:max-w-sm">
        <SearchInput
          className="max-h-[46px]"
          placeholder={searchPlaceholder}
          label="Pesquisar"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button
          variant="default"
          className="px-5 uppercase"
        >
          <Search className="h-4 w-4 cursor-pointer sm:mr-2" />
          <span className="hidden sm:block">Buscar</span>
        </Button>
      </div>

      {/* Seção de Ações */}
      <div className="flex items-center justify-end gap-4 space-x-2">
        <Button
          className="cursor-pointer px-5 uppercase"
          onClick={onOpenCreateForm}
          disabled={isCreateLoading}
        >
          <PlusIcon className="h-4 w-4 cursor-pointer sm:mr-2" />
          <span className="hidden sm:block">Incluir</span>
        </Button>

        {/* Children (BasicForm) será injetado aqui */}
        {children}

        {/* Componente DeleteButton */}
        {deleteButton}
      </div>
    </div>
  );
};
