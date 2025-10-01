'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/loading';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { EquipeForm, EquipeFormRef } from './equipes-form';
import {
  CreateEquipeData,
  EditEquipeData,
  EquipeFormValues,
  CurrentEquipeData,
} from './schema';
import BasicForm from '@/components/forms/basic-form';
import TitlePage from '@/components/pages/title-page';
import FilterPage from '@/components/pages/filter-page';
import { FilterGrid } from '@/components/pages/filter-grid';
import { FilterItem } from '@/components/pages/filter-item';
import { Toolbar } from '@/components/toolbar';
import DeleteButton from '@/components/pages/button-delete-page';
import {
  ColumnsEquipesTable,
  Equipes,
} from '@/app/modules/times/minha-equipes/interfaces';
import {
  DataTable,
  Limit,
} from '@/components/table/data-table';
import {
  toastError,
  toastInfo,
  toastSuccess,
} from '@/components/custom-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { equipesColumns } from '@/app/modules/times/minha-equipes/components/columns-equipes';
import { mapEquipeToTableData } from '@/app/modules/times/minha-equipes/helpers/map-data-to-table';

// Função para mapear equipe para ColumnsEquipeTable

const PageEquipes = () => {
  // Estados de paginação
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20 as Limit,
  });
  const [equipes, setEquipes] = useState<Equipes[]>([]);
  const [equipe, setEquipe] = useState<Equipes | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginatedFetching, setIsPaginatedFetching] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentEquipe, setCurrentEquipe] =
    useState<CurrentEquipeData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValidForm, setIsValidForm] =
    useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    [],
  );
  const [formMode, setFormMode] = useState<
    'create' | 'edit'
  >('create');
  const { user } = useAuth();
  const formRef = useRef<EquipeFormRef>(null);

  const fetchEquipe = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/equipes/obter-dados-alterar/${id}`,
      );
      if (!res.ok) {
        throw new Error('Falha ao carregar as equipes');
      }

      const data = await res.json();
      setEquipe(data);
    } catch (error) {
      console.error(error);
      toastError({ description: `${error}` });
    } finally {
      setIsLoading(false);
    }
  };
  // Função para editar
  const handleEdit = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setFormMode('edit');
      // setEditingProcedureId(id);

      await fetchEquipe(id);

      setIsSheetOpen(true);
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      toastError({
        description:
          'Erro ao carregar agendamento para edição',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Colunas da tabela
  const columns = useMemo(
    () =>
      equipesColumns({
        selectedIds: selectedIds,
        setSelectedIds: setSelectedIds,
        data: equipes.map(mapEquipeToTableData),
        onEdit: handleEdit,
      }),
    [selectedIds, equipes, handleEdit],
  );

  // Dados mapeados para a tabela
  const mappedTable = useMemo(
    () => equipes.map(mapEquipeToTableData),
    [equipes],
  );

  // Handlers de paginação
  const handlePageChange = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };
  const handlePageSizeChange = (pageSize: Limit) => {
    setPagination({ pageIndex: 0, pageSize });
  };

  // Buscar equipes
  useEffect(() => {
    const fetchEquipes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/equipes');
        if (!res.ok) {
          throw new Error('Falha ao carregar as equipes');
        }
        const data = await res.json();

        // Ajuste aqui: pegar as equipes do novo formato
        const equipesData =
          data.ResultadoOperacao?.ListaGrid?.[0]?.equipes ||
          [];

        setEquipes(equipesData);
        setTotalCount(
          data.ResultadoOperacao?.paginacao?.totalItens ||
            0,
        );
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Erro desconhecido';
        setError(message);
        toast.error('Erro ao carregar equipes', {
          description: 'Tente novamente mais tarde.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipes();
  }, []);

  // Buscar equipes com paginação
  useEffect(() => {
    const fetchEquipesPaginated = async () => {
      try {
        setIsPaginatedFetching(true);
        const params = new URLSearchParams({
          pagina: pagination.pageIndex.toString(),
          limite: pagination.pageSize.toString(),
        });

        const res = await fetch(`/api/equipes?${params}`);
        if (!res.ok) {
          throw new Error('Falha ao carregar as equipes');
        }
        const data = await res.json();

        // Ajuste aqui: pegar as equipes do novo formato
        const equipesData =
          data.ResultadoOperacao?.ListaGrid?.[0]?.equipes ||
          [];

        setEquipes(equipesData);
        setTotalCount(
          data.ResultadoOperacao?.paginacao?.totalItens ||
            0,
        );
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Erro desconhecido';
        setError(message);
        toast.error('Erro ao carregar equipes', {
          description: 'Tente novamente mais tarde.',
        });
      } finally {
        setIsPaginatedFetching(false);
      }
    };

    fetchEquipesPaginated();
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleOpenCreateForm = useCallback(() => {
    setFormMode('create');
    setIsSheetOpen(true);
  }, []);

  if (error) {
    return (
      <div className="container mx-auto w-full">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="max-w-md">
            <h2 className="text-destructive mb-4 text-xl font-semibold">
              Erro ao carregar equipes
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full">
      {isLoading ||
        (isDeleting && (
          <Loading
            active
            type="transaction"
          />
        ))}
      <TitlePage
        title="Gerenciar Equipes"
        description="Criar e gerenciar equipes de trabalho"
        icon={<HiOutlineUserGroup />}
      />

      <FilterPage className="mt-6">
        <FilterGrid>
          <FilterItem>
            <p className="flex items-center gap-2 px-2 text-base font-normal text-slate-500">
              <Switch /> Inativos
            </p>
          </FilterItem>
        </FilterGrid>
      </FilterPage>

      <Toolbar
        onSearchChange={() =>
          alert(
            'Função de pesquisa ainda não implementada.',
          )
        }
        searchValue={''}
        onOpenCreateForm={handleOpenCreateForm}
        deleteButton={
          <DeleteButton
            onSubmit={() => {}}
            description="Esta ação não pode ser desfeita."
            title={
              'Você tem certeza que deseja excluir o(s) agendamento(s) selecionado(s)?'
            }
            disabled={selectedIds.length === 0}
          />
        }
      >
        <BasicForm
          isValid={false}
          open={isSheetOpen}
          onSubmit={() => {}}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
          }}
          mode={formMode}
          title={
            formMode === 'edit'
              ? 'Editar Sala'
              : 'Nova Sala'
          }
          className="sm:max-w-2/4"
        >
          <EquipeForm
            initialData={equipe!}
            isLoading={isLoading}
            isValidated={() => false}
            onDataChange={() => false}
          />
        </BasicForm>
      </Toolbar>
      <div className="min-h-96">
        <DataTable<ColumnsEquipesTable, unknown>
          columns={columns}
          data={mappedTable}
          isLoading={isPaginatedFetching || isDeleting}
          selectedIds={selectedIds}
          pagination={{
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            totalCount,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>
    </div>
  );
};

export default PageEquipes;
