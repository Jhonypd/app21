'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import Loading from '@/components/loading';
import BasicForm from '@/components/forms/basic-form';
import TitlePage from '@/components/pages/title-page';
import FilterPage from '@/components/pages/filter-page';
import { FilterGrid } from '@/components/pages/filter-grid';
import { FilterItem } from '@/components/pages/filter-item';
import { Toolbar } from '@/components/toolbar';
import DeleteButton from '@/components/pages/button-delete-page';
import { ProjetoForm } from '@/modules/projetos/meus-projetos/components/projetos-form';
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
import { FaLaptopCode } from 'react-icons/fa';
import {
  ColumnsProjetosTable,
  Projetos,
} from '@/modules/projetos/meus-projetos/interfaces';
import { projetosColumns } from '@/modules/projetos/meus-projetos/components/columns-projetos';
import { mapProjetoToTableData } from '@/modules/projetos/meus-projetos/helpers/map-data-to-table';
import {
  CreateProjetoData,
  CurrentProjetoData,
  EditProjetoData,
  ProjetoFormValues,
} from '@/modules/projetos/meus-projetos/schema';

const PageProjetos = () => {
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
  const [projetos, setProjetos] = useState<Projetos[]>([]);
  const [editingProjeto, setEditingProjeto] =
    useState<CurrentProjetoData | null>(null);
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
  const [equipes, setEquipes] = useState<Option[]>([]);
  const [membrosDaEquipe, setMembrosDaEquipe] = useState<
    Option[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    [],
  );

  const [formData, setFormData] = useState<{
    values: ProjetoFormValues;
    createData?: CreateProjetoData;
    editData?: EditProjetoData;
  }>({
    values: {
      nome: '',
      inativo: false,
      equipeId: '',
      gerenteId: '',
    },
  });

  const formDataRef = useRef(formData);
  const isEditModeRef = useRef(isEditMode);
  const editingProjetoRef = useRef(editingProjeto);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    isEditModeRef.current = isEditMode;
  }, [isEditMode]);

  useEffect(() => {
    editingProjetoRef.current = editingProjeto;
  }, [editingProjeto]);

  const fetchProjetoParaEdicao = useCallback(
    async (projetoId: string) => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/projetos/obter-dados-alterar/${projetoId}`,
        );

        if (!res.ok) {
          throw new Error(
            'Falha ao carregar os dados do projeto',
          );
        }

        const data = await res.json();
        const projetoData = data.ResultadoOperacao.Projeto;

        setEditingProjeto(projetoData);

        if (projetoData) {
          setFormData({
            values: {
              nome: projetoData.nome || '',
              inativo: projetoData.inativo || false,
              equipeId: projetoData.equipeId,
              gerenteId: projetoData.gerenteId,
            },
            editData: {
              id: projetoData.id,
              nome: projetoData.nome,
              inativo: projetoData.inativo,
              equipeId: projetoData.equipeId,
              gerenteId: projetoData.gerenteId,
            },
          });
          setEquipes(data.ResultadoOperacao.ComboEquipes);
          setMembrosDaEquipe(
            data.ResultadoOperacao.ComboGerentes,
          );
        }
      } catch (error) {
        console.error(error);
        toastError({
          description: 'Erro ao carregar dados do projeto',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchProjetos = useCallback(async () => {
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

      const url = `/api/projetos?${params}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Falha ao carregar os projetos');
      }

      const data = await res.json();
      const projetosData =
        data.ResultadoOperacao?.ListaGrid?.projetos || [];

      setProjetos(projetosData);
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
        description: 'Erro ao carregar projetos',
      });
    } finally {
      setIsLoading(false);
      setIsPaginatedFetching(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    statusFiltroAplicado,
  ]);

  const aplicarFiltros = useCallback(() => {
    setStatusFiltroAplicado(statusFiltro);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setIsFilterOpen(false);
  }, [statusFiltro]);

  const handleDelete = useCallback(
    async (ids: string[]) => {
      try {
        setIsDeleteLoading(true);

        const response = await fetch(
          '/api/projetos/delete-projetos',
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
            errorData.erro || 'Erro ao deletar projetos',
          );
        }

        const result = await response.json();

        toastSuccess({
          description: result.ResultadoOperacao.mensagem,
        });

        fetchProjetos();
        setSelectedIds([]);
      } catch (error) {
        console.error('Erro ao deletar projetos:', error);
        toastError({
          description:
            error instanceof Error
              ? error.message
              : 'Erro ao deletar projetos',
        });
      } finally {
        setIsDeleteLoading(false);
      }
    },
    [fetchProjetos],
  );

  const handleEdit = useCallback(
    async (id: string) => {
      try {
        await fetchProjetoParaEdicao(id);
        setIsEditMode(true);
        setIsSheetOpen(true);
      } catch (error) {
        console.error('Erro ao buscar projeto:', error);
        toastError({
          description:
            'Erro ao carregar projeto para edição',
        });
      }
    },
    [fetchProjetoParaEdicao],
  );

  const buscarMembrosDaEquipe = useCallback(
    async (equipeId: string) => {
      try {
        const response = await fetch(
          `/api/equipes/combo/membros/${equipeId}`,
        );
        const data = await response.json();

        if (data.ResultadoOperacao?.sucesso) {
          setMembrosDaEquipe(
            data.ResultadoOperacao.pessoas.map(
              (p: Option) => ({
                id: p.id,
                nome: p.nome,
                inativo: p.inativo,
              }),
            ),
          );
        }
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
      }
    },
    [],
  );

  const handleCreate = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/equipes/combo');

      if (!response.ok) {
        throw new Error(
          'Erro ao carregar lista de equipes',
        );
      }

      const data = await response.json();
      const equipesData =
        data.ResultadoOperacao?.equipe || [];

      setEquipes(
        equipesData.map(
          (equipe: {
            id: string;
            nome: string;
            inativo: boolean;
          }) => ({
            id: equipe.id,
            nome: equipe.nome,
            inativo: equipe.inativo,
          }),
        ),
      );

      setIsEditMode(false);
      setEditingProjeto(null);

      setFormData({
        values: {
          nome: '',
          inativo: false,
          equipeId: '',
          gerenteId: '',
        },
        createData: {
          nome: '',
          equipeId: '',
          gerenteId: '',
        },
      });

      setIsSheetOpen(true);
    } catch (error) {
      console.error('Erro ao preparar criação:', error);
      toastError({
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao preparar criação do projeto',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmitForm = useCallback(async () => {
    const currentFormData = formDataRef.current;
    const currentIsEditMode = isEditModeRef.current;
    const currentEditingProjeto = editingProjetoRef.current;

    console.log('Dados para envio:', currentFormData);

    try {
      setIsLoading(true);

      if (
        currentIsEditMode &&
        currentEditingProjeto &&
        currentFormData.editData
      ) {
        // Modo edição
        const response = await fetch(
          `/api/projeto/alterar-projeto`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: currentEditingProjeto.id,
              nome: currentFormData.values.nome,
              inativo: currentFormData.values.inativo,
              equipeId: currentFormData.values.equipeId,
              gerenteId: currentFormData.values.gerenteId,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.erro || 'Erro ao atualizar projeto',
          );
        }

        toastSuccess({
          description: 'Projeto atualizado com sucesso!',
        });
      } else if (currentFormData.createData) {
        // Modo criação
        const response = await fetch(
          '/api/projetos/novo-projeto',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: currentFormData.values.nome,
              equipeId: currentFormData.values.equipeId,
              gerenteId: currentFormData.values.gerenteId,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.erro || 'Erro ao criar projeto',
          );
        }

        toastSuccess({
          description: 'Projeto criado com sucesso!',
        });
      } else {
        throw new Error('Dados inválidos para envio');
      }

      setIsSheetOpen(false);
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toastError({
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao salvar projeto',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjetos]);

  const handleCloseForm = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingProjeto(null);
      setIsEditMode(false);
      // Reset mais suave do formData
      setFormData(() => ({
        values: {
          nome: '',
          inativo: false,
          equipeId: '',
          gerenteId: '',
        },
      }));
    }
  }, []);

  const handleDataChange = useCallback(
    (data: {
      values: ProjetoFormValues;
      createData?: CreateProjetoData;
      editData?: EditProjetoData;
    }) => {
      setFormData(data);
    },
    [],
  );

  const columns = useMemo(
    () =>
      projetosColumns({
        selectedIds,
        setSelectedIds,
        data: projetos.map(mapProjetoToTableData),
        onEdit: handleEdit,
      }),
    [selectedIds, projetos, handleEdit],
  );

  const mappedTable = useMemo(
    () => projetos.map(mapProjetoToTableData),
    [projetos],
  );

  const handlePageChange = useCallback(
    (pageIndex: number) => {
      setPagination((prev) => ({ ...prev, pageIndex }));
    },
    [],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: Limit) => {
      setPagination({ pageIndex: 0, pageSize });
    },
    [],
  );

  useEffect(() => {
    fetchProjetos();
  }, [fetchProjetos]);

  const memoizedEquipes = useMemo(() => equipes, [equipes]);
  const memoizedMembrosDaEquipe = useMemo(
    () => membrosDaEquipe,
    [membrosDaEquipe],
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
        title="Projetos"
        description="Criar e gerenciar projetos"
        icon={<FaLaptopCode />}
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
            title="Você tem certeza que deseja excluir a(s) projeto(s) selecionada(s)?"
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
            isEditMode ? 'Editar Projeto' : 'Novo Projeto'
          }
          className="max-w-96 sm:max-w-2/4"
        >
          <ProjetoForm
            isLoading={isLoading}
            isValidated={setIsValidForm}
            onDataChange={handleDataChange}
            initialData={editingProjeto || undefined}
            onSubmit={handleSubmitForm}
            equipes={memoizedEquipes}
            pessoas={memoizedMembrosDaEquipe}
            onEquipeChange={buscarMembrosDaEquipe}
          />
        </BasicForm>
      </Toolbar>

      <DataTable<ColumnsProjetosTable, unknown>
        columns={columns}
        data={mappedTable}
        isLoading={isPaginatedFetching || isDeleteLoading}
        selectedIds={selectedIds}
        refreshFetch={fetchProjetos}
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

export default PageProjetos;
