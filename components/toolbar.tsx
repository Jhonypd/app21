import { Button } from '@/components/ui/button';
import { PlusIcon, Search } from 'lucide-react';
import { SearchInput } from './inputs/input-search';
import Loading from './loading';
import { memo, useCallback } from 'react';

interface ToolbarProps {
  children: React.ReactNode;
  onSearchChange: (value: string) => void;
  onOpenCreateForm: () => void;
  deleteButton: React.ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  isCreateLoading?: boolean;
}

// Componente memoizado para o botão de busca
const SearchButton = memo(() => (
  <Button
    variant="default"
    className="px-5 uppercase"
  >
    <Search className="h-4 w-4 cursor-pointer sm:mr-2" />
    <span className="hidden sm:block">Buscar</span>
  </Button>
));

SearchButton.displayName = 'SearchButton';

// Componente memoizado para o botão de incluir
const CreateButton = memo(
  ({
    onOpenCreateForm,
    isCreateLoading,
  }: {
    onOpenCreateForm: () => void;
    isCreateLoading: boolean;
  }) => (
    <Button
      className="cursor-pointer px-5 uppercase"
      onClick={onOpenCreateForm}
      disabled={isCreateLoading}
    >
      <PlusIcon className="h-4 w-4 cursor-pointer sm:mr-2" />
      <span className="hidden sm:block">Incluir</span>
    </Button>
  ),
);

CreateButton.displayName = 'CreateButton';

// Componente memoizado para a seção de busca
const SearchSection = memo(
  ({
    onSearchChange,
    searchValue,
    searchPlaceholder,
  }: {
    onSearchChange: (value: string) => void;
    searchValue: string;
    searchPlaceholder: string;
  }) => {
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange],
    );

    return (
      <div className="flex w-full items-center gap-3 sm:max-w-sm">
        <SearchInput
          className="max-h-[46px]"
          placeholder={searchPlaceholder}
          label="Pesquisar"
          value={searchValue}
          onChange={handleSearchChange}
        />
        <SearchButton />
      </div>
    );
  },
);

SearchSection.displayName = 'SearchSection';

// Componente memoizado para a seção de ações
const ActionsSection = memo(
  ({
    children,
    deleteButton,
    onOpenCreateForm,
    isCreateLoading,
  }: {
    children: React.ReactNode;
    deleteButton: React.ReactNode;
    onOpenCreateForm: () => void;
    isCreateLoading: boolean;
  }) => (
    <div className="flex items-center justify-end gap-4 space-x-2">
      <CreateButton
        onOpenCreateForm={onOpenCreateForm}
        isCreateLoading={isCreateLoading}
      />

      {/* Children (BasicForm) será injetado aqui */}
      {children}

      {/* Componente DeleteButton */}
      {deleteButton}
    </div>
  ),
);

ActionsSection.displayName = 'ActionsSection';

export const Toolbar = memo(function Toolbar({
  children,
  onSearchChange,
  onOpenCreateForm,
  deleteButton,
  searchValue = '',
  searchPlaceholder = 'Pesquisar serviços...',
  isCreateLoading = false,
}: ToolbarProps) {
  return (
    <div className="flex w-full flex-col-reverse flex-nowrap justify-between gap-4 py-4 sm:flex-row">
      {isCreateLoading && (
        <Loading
          active
          type="transaction"
        />
      )}

      <SearchSection
        onSearchChange={onSearchChange}
        searchValue={searchValue}
        searchPlaceholder={searchPlaceholder}
      />

      <ActionsSection
        onOpenCreateForm={onOpenCreateForm}
        isCreateLoading={isCreateLoading}
        deleteButton={deleteButton}
      >
        {children}
      </ActionsSection>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';
