'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Loading from '@/components/loading';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { EquipeForm } from './equipes-form';
import {
  CreateEquipeData,
  CurrentEquipeData,
  EditEquipeData,
  EquipeFormValues,
} from '../../modules/equipes/minha-equipes/schema';
import BasicForm from '@/components/forms/basic-form';
import TitlePage from '@/components/pages/title-page';
import FilterPage from '@/components/pages/filter-page';
import { FilterGrid } from '@/components/pages/filter-grid';
import { FilterItem } from '@/components/pages/filter-item';
import { Toolbar } from '@/components/toolbar';
import DeleteButton from '@/components/pages/button-delete-page';

import {
  DataTable,
  Limit,
} from '@/components/table/data-table';
import {
  toastError,
  toastInfo,
  toastSuccess,
} from '@/components/custom-toast';
import { Option } from '@/components/inputs/input-multi-command';
import { ComboBoxInput } from '@/components/inputs/input-combobox';
import {
  ColumnsEquipesTable,
  Equipes,
} from '@/app/modules/equipes/minha-equipes/interfaces';
import { mapEquipeToTableData } from '@/app/modules/equipes/minha-equipes/helpers/map-data-to-table';
import { equipesColumns } from '@/app/modules/equipes/minha-equipes/components/columns-equipes';

const PageEquipes = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20 as Limit,
  });

  const [statusFiltro, setStatusFiltro] = useState<
    string | null
  >(null);
  const [statusFiltroAplicado, setStatusFiltroAplicado] =
    useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  // Estado do formData com valor padrão
  const [formData, setFormData] = useState<{
    values: EquipeFormValues;
    createData?: CreateEquipeData;
    editData?: EditEquipeData;
  }>({
    values: {
      nome: '',
      inativo: false,
    },
  });

  const buscarUsuarios = async (
    texto: string,
    excludeIds: string[] = [],
  ): Promise<Option[]> => {
    if (!texto.trim()) return [];

    try {
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

      return pessoas.map(
        (pessoa: {
          id: string;
          nome: string;
          inativo: boolean;
        }) => ({
          id: pessoa.id,
          nome: pessoa.nome,
          inativo: pessoa.inativo,
        }),
      );
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

      // Inicializar formData com os dados da equipe
      if (data.ResultadoOperacao.equipe) {
        setFormData({
          values: {
            nome: data.ResultadoOperacao.equipe.nome || '',
            inativo:
              data.ResultadoOperacao.equipe.inativo ||
              false,
          },
          editData: {
            id: data.ResultadoOperacao.equipe.id,
            nome: data.ResultadoOperacao.equipe.nome,
            inativo: data.ResultadoOperacao.equipe.inativo,
            membrosAdicionar: [],
            membrosRemover: [],
          },
        });
      }
    } catch (error) {
      console.error(error);
      toastError({
        description: 'Erro ao carregar dados da equipe',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar equipes com paginação e filtro
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
        ...(statusFiltroAplicado && {
          inativo:
            statusFiltroAplicado === '2' ? 'true' : 'false',
        }),
      });

      const url = `/api/equipes?${params}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Falha ao carregar as equipes');
      }

      const data = await res.json();
      const equipesData =
        data.ResultadoOperacao?.ListaGrid?.equipes || [];

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

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    setStatusFiltroAplicado(statusFiltro);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setIsFilterOpen(false);
  };

  // Função para deletar equipes
  const handleDelete = async (ids: string[]) => {
    try {
      setIsDeleteLoading(true);

      const response = await fetch(
        '/api/equipes/delete-equipes',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ids: ids.join(','),
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.erro || 'Erro ao deletar equipes',
        );
      }

      const result = await response.json();

      toastSuccess({
        description: result.ResultadoOperacao.mensagem,
      });

      fetchEquipes();
      setSelectedIds([]);
    } catch (error) {
      console.error('Erro ao deletar equipes:', error);
      toastError({
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao deletar equipes',
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Função para editar
  const handleEdit = useCallback(async (id: string) => {
    try {
      await fetchEquipeParaEdicao(id);
      setIsEditMode(true);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      toastError({
        description: 'Erro ao carregar equipe para edição',
      });
    }
  }, []);

  // Função para criar nova equipe
  const handleCreate = useCallback(async () => {
    try {
      setIsEditMode(false);
      setEditingEquipe(null);
      setFormData({
        values: {
          nome: '',
          inativo: false,
        },
        createData: {
          nome: '',
          membrosAdicionar: [],
        },
      });
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Erro ao preparar criação:', error);
      toastError({
        description: 'Erro ao preparar criação da equipe',
      });
    }
  }, []);

  const handleSubmitForm = useCallback(async () => {
    try {
      setIsLoading(true);

      if (
        isEditMode &&
        editingEquipe &&
        formData.editData
      ) {
        // Modo edição
        const response = await fetch(
          `/api/equipes/alterar-equipe`,
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
  }, [formData, isEditMode, editingEquipe]);

  // Fechar formulário
  const handleCloseForm = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingEquipe(null);
      setIsEditMode(false);
      setFormData((prev) => ({
        values: prev.values,
      }));
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

  // Buscar equipes quando a paginação ou filtro aplicado mudar
  useEffect(() => {
    fetchEquipes();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    statusFiltroAplicado,
  ]);

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

      <FilterPage
        onOpenChange={setIsFilterOpen}
        isOpen={isFilterOpen}
        onSubmit={aplicarFiltros}
        className="mt-6"
      >
        <FilterGrid className="grid-cols-12">
          <FilterItem className="col-span-full items-center sm:col-span-3">
            <ComboBoxInput
              onChange={(value) => setStatusFiltro(value)}
              options={[
                { id: '1', nome: 'Ativo' },
                { id: '2', nome: 'Inativo' },
              ]}
              value={statusFiltro || ''}
              label="Status"
              name="status"
              placeholder="Selecione o status"
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
            onSubmit={() => handleDelete(selectedIds)}
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
