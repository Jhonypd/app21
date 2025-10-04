'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
// import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/loading';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { EquipeForm } from './equipes-form';
import {
  CreateEquipeData,
  CurrentEquipeData,
  EditEquipeData,
  EquipeFormValues,
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
import { equipesColumns } from '@/app/modules/times/minha-equipes/components/columns-equipes';
import { mapEquipeToTableData } from '@/app/modules/times/minha-equipes/helpers/map-data-to-table';
import { Option } from '@/components/inputs/input-multi-command';
import { ComboBoxInput } from '@/components/inputs/input-combobox';

const PageEquipes = () => {
  // Estados de paginação
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20 as Limit,
  });
  const [statusFiltro, setStatusFiltro] = useState(null);
  const [equipes, setEquipes] = useState<Equipes[]>([]);
  const [editingEquipe, setEditingEquipe] =
    useState<CurrentEquipeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginatedFetching, setIsPaginatedFetching] =
    useState(false);

  const [isDeleteLoading, setIsDeleteLoading] =
    useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValidForm, setIsValidForm] =
    useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    [],
  );
  // const [novoAdministradorId, setNovoAdministradorId] =
  //   useState<string | null>(null);
  const [formData, setFormData] = useState<{
    values: EquipeFormValues;
    createData?: CreateEquipeData;
    editData?: EditEquipeData;
  } | null>(null);

  const buscarUsuarios = async (
    texto: string,
    excludeIds: string[] = [],
  ): Promise<Option[]> => {
    if (!texto.trim()) return [];

    try {
      // Constrói a URL com parâmetro de exclusão
      const params = new URLSearchParams({
        pesquisa: texto,
        ...(excludeIds.length > 0 && {
          excluirIds: excludeIds.join(','),
        }),
      });

      const response = await fetch(
        `/api/pessoas/pesquisar?${params}`,
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const data = await response.json();
      const pessoas = data.ResultadoOperacao?.pessoas || [];

      return pessoas.map((pessoa: any) => ({
        id: pessoa.id,
        nome: pessoa.nome,
        inativo: pessoa.inativo,
      }));
    } catch (error) {
      console.error('Erro na busca de usuários:', error);
      return [];
    }
  };

  // Buscar dados para edição
  const fetchEquipeParaEdicao = async (
    equipeId: string,
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/equipes/obter-dados-alterar/${equipeId}`,
      );

      if (!res.ok) {
        throw new Error(
          'Falha ao carregar os dados da equipe',
        );
      }

      const data = await res.json();
      setEditingEquipe(data.ResultadoOperacao.equipe);
    } catch (error) {
      console.error(error);
      toastError({
        description: 'Erro ao carregar dados da equipe',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar equipes com paginação
  const fetchEquipes = async () => {
    try {
      const isPaginated =
        pagination.pageIndex > 0 ||
        pagination.pageSize !== 20;

      if (isPaginated) {
        setIsPaginatedFetching(true);
      } else {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        pagina: pagination.pageIndex.toString(),
        limite: pagination.pageSize.toString(),
      });

      const url = isPaginated
        ? `/api/equipes?${params}`
        : '/api/equipes';
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Falha ao carregar as equipes');
      }

      const data = await res.json();
      const equipesData =
        data.ResultadoOperacao?.ListaGrid?.[0]?.equipes ||
        [];

      setEquipes(equipesData);
      setTotalCount(
        data.ResultadoOperacao?.paginacao?.totalItens || 0,
      );
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido';
      setError(message);
      toastError({
        description: 'Erro ao carregar equipes',
      });
    } finally {
      setIsLoading(false);
      setIsPaginatedFetching(false);
    }
  };

  // Função para editar
  const handleEdit = useCallback(async (id: string) => {
    try {
      setIsEditMode(true);
      await fetchEquipeParaEdicao(id);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      toastError({
        description: 'Erro ao carregar equipe para edição',
      });
    }
  }, []);

  // Função para criar nova equipe - MODIFICADA
  const handleCreate = useCallback(async () => {
    try {
      setIsEditMode(false);
      setEditingEquipe(null);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Erro ao preparar criação:', error);
      toastError({
        description: 'Erro ao preparar criação da equipe',
      });
    }
  }, []);

  const handleSubmitForm = useCallback(async () => {
    if (!formData) {
      toastError({
        description: 'Dados do formulário não encontrados',
      });
      return;
    }

    try {
      setIsLoading(true);

      if (
        isEditMode &&
        editingEquipe &&
        formData.editData
      ) {
        // Modo edição - usar nova rota com listas de adição/remoção
        const response = await fetch(
          '/api/equipes/alterar-equipe',
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingEquipe.id,
              nome: formData.values.nome,
              inativo: formData.values.inativo,
              membrosAdicionar:
                formData.editData.membrosAdicionar || [],
              membrosRemover:
                formData.editData.membrosRemover || [],
              novoAdministradorId:
                formData.editData.novoAdministradorId,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.erro || 'Erro ao atualizar equipe',
          );
        }

        toastSuccess({
          description: 'Equipe atualizada com sucesso!',
        });
      } else if (formData.createData) {
        // Modo criação
        const response = await fetch(
          '/api/equipes/nova-equipe',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: formData.values.nome,
              membros:
                formData.createData.membrosAdicionar || [],
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.erro || 'Erro ao criar equipe',
          );
        }

        toastSuccess({
          description: 'Equipe criada com sucesso!',
        });
      } else {
        throw new Error('Dados inválidos para envio');
      }

      setIsSheetOpen(false);
      fetchEquipes(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toastError({
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao salvar equipe',
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isEditMode, editingEquipe]);

  // Fechar formulário
  const handleCloseForm = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingEquipe(null);
      setIsEditMode(false);
      setFormData(null); // ← Limpa os dados do formulário
    }
  }, []);

  // Colunas da tabela
  const columns = useMemo(
    () =>
      equipesColumns({
        selectedIds,
        setSelectedIds,
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

  // Buscar equipes quando a paginação mudar
  useEffect(() => {
    fetchEquipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleDataChange = useCallback(
    (data: {
      values: EquipeFormValues;
      createData?: CreateEquipeData;
      editData?: EditEquipeData;
    }) => {
      setFormData(data);
    },
    [],
  );

  return (
    <div className="container mx-auto w-full">
      {(isDeleteLoading || isLoading) && (
        <Loading
          active
          type="transaction"
        />
      )}

      <TitlePage
        title="Gerenciar Equipes"
        description="Criar e gerenciar equipes de trabalho"
        icon={<HiOutlineUserGroup />}
      />

      <FilterPage className="mt-6">
        <FilterGrid className="grid-cols-12">
          <FilterItem className="col-span-full items-center sm:col-span-3">
            <ComboBoxInput
              onChange={(e) => setStatusFiltro(e)}
              options={[
                { id: '1', name: 'Ativo' },
                { id: '2', name: 'Inativo' },
              ]}
              value={statusFiltro ? statusFiltro : ''}
              label="Status"
              name="inativo"
              placeholder=""
              onReset={() => undefined}
            />
          </FilterItem>
        </FilterGrid>
      </FilterPage>

      <Toolbar
        onSearchChange={() =>
          toastInfo({
            description:
              'Função de pesquisa em desenvolvimento.',
          })
        }
        searchValue={''}
        onOpenCreateForm={handleCreate}
        deleteButton={
          <DeleteButton
            onSubmit={() => {}}
            description="Esta ação não pode ser desfeita."
            title="Você tem certeza que deseja excluir a(s) equipe(s) selecionada(s)?"
            disabled={selectedIds.length === 0}
          />
        }
      >
        <BasicForm
          isValid={isValidForm}
          open={isSheetOpen}
          onSubmit={handleSubmitForm}
          onOpenChange={handleCloseForm}
          mode={isEditMode ? 'edit' : 'create'}
          title={
            isEditMode ? 'Editar Equipe' : 'Nova Equipe'
          }
          className="max-w-96 sm:max-w-2/4"
        >
          <EquipeForm
            initialData={editingEquipe || undefined}
            isLoading={isLoading}
            isValidated={setIsValidForm}
            onDataChange={handleDataChange}
            onSubmit={handleSubmitForm}
            campoPesquisaUsuario={buscarUsuarios}
          />
        </BasicForm>
      </Toolbar>

      <DataTable<ColumnsEquipesTable, unknown>
        columns={columns}
        data={mappedTable}
        isLoading={isPaginatedFetching || isDeleteLoading}
        selectedIds={selectedIds}
        refreshFetch={fetchEquipes}
        error={error ? true : undefined}
        errorDescription={error ? error : undefined}
        pagination={{
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          totalCount,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </div>
  );
};

export default PageEquipes;
