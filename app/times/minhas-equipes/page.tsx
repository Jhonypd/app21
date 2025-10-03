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
import { Switch } from '@/components/ui/switch';
import { equipesColumns } from '@/app/modules/times/minha-equipes/components/columns-equipes';
import { mapEquipeToTableData } from '@/app/modules/times/minha-equipes/helpers/map-data-to-table';
import { MultiComboBoxInput } from '@/components/inputs/input-multi-combobox';
import { FaLaptopCode } from 'react-icons/fa';
import { Option } from '@/components/inputs/input-multi-command';

const PageEquipes = () => {
  // Estados de paginação
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20 as Limit,
  });

  const [equipes, setEquipes] = useState<Equipes[]>([]);
  const [editingEquipe, setEditingEquipe] =
    useState<CurrentEquipeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginatedFetching, setIsPaginatedFetching] =
    useState(false);
  const [isDeleteLoading, setIsDeleteLoading] =
    useState(false);
  const [isCreateLoading, setIsCreateLoading] =
    useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValidForm, setIsValidForm] =
    useState<boolean>(false);
  const [selectedEquipesFilter, setSelectedEquipesFilter] =
    useState<string[]>([]);
  const [comboFiltroProjetos, setComboFiltroProjetos] =
    useState<
      { id: string; nome: string; inativo: boolean }[]
    >([]);
  const [comboProjetosForm, setComboProjetosForm] =
    useState<
      { id: string; nome: string; inativo: boolean }[]
    >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    [],
  );
  const [formData, setFormData] = useState<{
    values: EquipeFormValues;
    createData?: CreateEquipeData; // Ou o tipo específico para criação
    editData?: EditEquipeData; // Ou o tipo específico para edição
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
      setComboProjetosForm(
        data.ResultadoOperacao.comboProjeto,
      );
    } catch (error) {
      console.error(error);
      toastError({
        description: 'Erro ao carregar dados da equipe',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar dados para inserir
  const fetchDadosParaInserir = async () => {
    try {
      setIsCreateLoading(true);
      const res = await fetch(
        '/api/equipes/obter-dados-inserir',
      );

      if (!res.ok) {
        throw new Error(
          'Falha ao carregar dados para criação',
        );
      }

      const data = await res.json();
      setComboProjetosForm(
        data.ResultadoOperacao?.comboProjeto || [],
      );
      return true; // Sucesso
    } catch (error) {
      console.error(
        'Erro ao buscar dados para inserir:',
        error,
      );
      toastError({
        description: 'Erro ao carregar dados para criação',
      });
      return false; // Falha
    } finally {
      setIsCreateLoading(false);
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

      // ADICIONAR ESTA LINHA: Buscar projetos do combo da resposta
      const projetosData =
        data.ResultadoOperacao?.comboProjeto || [];

      setEquipes(equipesData);
      setComboFiltroProjetos(projetosData); // ← IMPORTANTE: definir os projetos
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
      // Buscar dados para inserir primeiro
      const success = await fetchDadosParaInserir();

      if (success) {
        setIsEditMode(false);
        setEditingEquipe(null);
        setIsSheetOpen(true);
      }
    } catch (error) {
      console.error('Erro ao preparar criação:', error);
      toastError({
        description: 'Erro ao preparar criação da equipe',
      });
    }
  }, []);

  const handleSubmitForm = useCallback(async () => {
    console.log(formData);
    if (!formData) {
      toastError({
        description: 'Dados do formulário não encontrados',
      });
      return;
    }

    console.log('Dados para envio:', formData);

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
              projetosAdicionar:
                formData.editData.projetosAdicionar || [],
              projetosRemover:
                formData.editData.projetosRemover || [],
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
              projetos: formData.createData.projetos || [],
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
      setComboProjetosForm([]);
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
              onClick={fetchEquipes}
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
            <p className="flex h-full items-center gap-2 px-2 text-base font-normal text-slate-500">
              <Switch /> Inativos
            </p>
          </FilterItem>
          <FilterItem className="col-span-full sm:col-span-3">
            <MultiComboBoxInput
              value={selectedEquipesFilter}
              onChange={setSelectedEquipesFilter}
              options={comboFiltroProjetos}
              label="Projetos"
              placeholder="Selecione o(s) projetos"
              icone={FaLaptopCode}
              disabled={isLoading}
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
        isCreateLoading={isCreateLoading}
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
            isLoading={isLoading || isCreateLoading}
            isValidated={setIsValidForm}
            onDataChange={handleDataChange}
            onSubmit={handleSubmitForm}
            comboProjetos={comboProjetosForm}
            campoPesquisaUsuario={buscarUsuarios} // ← Nova prop
          />
        </BasicForm>
      </Toolbar>

      <div className="min-h-96">
        <DataTable<ColumnsEquipesTable, unknown>
          columns={columns}
          data={mappedTable}
          isLoading={isPaginatedFetching || isDeleteLoading}
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
