'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Loading from '@/components/loading';
import BasicForm from '@/components/forms/basic-form';
import TitlePage from '@/components/pages/title-page';
import FilterPage from '@/components/pages/filter-page';
import { FilterGrid } from '@/components/pages/filter-grid';
import { FilterItem } from '@/components/pages/filter-item';
import { Toolbar } from '@/components/toolbar';
import DeleteButton from '@/components/pages/button-delete-page';
import { ProjetoForm } from '@/app/modules/projetos/meus-projetos/components/projetos-form';
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
} from '@/app/modules/projetos/meus-projetos/interfaces';
import { projetosColumns } from '@/app/modules/projetos/meus-projetos/components/columns-projetos';
import { mapProjetoToTableData } from '@/app/modules/projetos/meus-projetos/helpers/map-data-to-table';
import {
  CreateProjetoData,
  CurrentProjetoData,
  EditProjetoData,
  ProjetoFormValues,
} from '@/app/modules/projetos/meus-projetos/schema';

const PageProjetos = () => {
  // Estados de paginação
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

  // Estado do formData com valor padrão
  const [formData, setFormData] = useState<{
    values: ProjetoFormValues;
    createData?: CreateProjetoData;
    editData?: EditProjetoData;
  }>({
    values: {
      nome: '',
      inativo: false,
      idEquipe: '',
      idGerente: '',
    },
  });

  // Buscar dados para edição
  const fetchProjetoParaEdicao = async (
    projetoId: string,
  ) => {
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
      setEditingProjeto(data.ResultadoOperacao.projeto);

      // Inicializar formData com os dados da projeto
      if (data.ResultadoOperacao.projeto) {
        setFormData({
          values: {
            nome: data.ResultadoOperacao.projeto.nome || '',
            inativo:
              data.ResultadoOperacao.projeto.inativo ||
              false,
            idEquipe:
              data.ResultadoOperacao.projeto.equipe_id,
            idGerente:
              data.ResultadoOperacao.projeto.idGerente,
          },
          editData: {
            id: data.ResultadoOperacao.projeto.id,
            nome: data.ResultadoOperacao.projeto.nome,
            inativo: data.ResultadoOperacao.projeto.inativo,
            idEquipe:
              data.ResultadoOperacao.projeto.equipe_id,
            idGerente:
              data.ResultadoOperacao.projeto.gerente_id,
          },
        });
      }
    } catch (error) {
      console.error(error);
      toastError({
        description: 'Erro ao carregar dados do projeto',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar equipes com paginação e filtro
  const fetchProjetos = async () => {
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
        throw new Error('Falha ao carregar as projetos');
      }

      const data = await res.json();
      const projetosData =
        data.ResultadoOperacao?.ListaGrid?.[0]?.projetos ||
        [];

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
  };

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    setStatusFiltroAplicado(statusFiltro);
    setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset para primeira página
    setIsFilterOpen(false); // Fecha o filtro após aplicar
  };

  // Função para deletar projetos
  const handleDelete = async (ids: string[]) => {
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

      // Recarregar a lista
      fetchProjetos();
      // Limpar seleção
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
  };

  // Função para editar
  const handleEdit = useCallback(async (id: string) => {
    try {
      await fetchProjetoParaEdicao(id);
      setIsEditMode(true);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      toastError({
        description: 'Erro ao carregar projeto para edição',
      });
    }
  }, []);

  // Buscar lista de equipes para o combo
  const buscarEquipes = async () => {
    try {
      const response = await fetch('/api/equipes/combo');

      if (!response.ok) {
        throw new Error('Erro ao buscar equipes');
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
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      toastError({
        description: 'Erro ao carregar lista de equipes',
      });
    }
  };

  // Buscar membros da equipe selecionada
  const buscarMembrosDaEquipe = async (
    equipeId: string,
  ) => {
    try {
      const response = await fetch(
        `/api/equipes/combo/membros/${equipeId}?id=${equipeId}`,
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar membros da equipe');
      }

      const data = await response.json();
      const membros = data.ResultadoOperacao?.pessoas || [];

      setMembrosDaEquipe(
        membros.map(
          (membro: {
            pessoa: {
              id: string;
              nome: string;
              inativo: boolean;
            };
          }) => ({
            id: membro.pessoa.id,
            nome: membro.pessoa.nome,
            inativo: membro.pessoa.inativo,
          }),
        ),
      );
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      toastError({
        description: 'Erro ao carregar membros da equipe',
      });
    }
  };

  // Função para criar novo projeto
  const handleCreate = useCallback(async () => {
    try {
      setIsLoading(true);

      // Carregar lista de equipes primeiro
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

      // Só continua se carregar as equipes com sucesso
      setIsEditMode(false);
      setEditingProjeto(null);

      // Resetar formData para modo criação
      setFormData({
        values: {
          nome: '',
          inativo: false,
          idEquipe: '',
          idGerente: '',
        },
        createData: {
          nome: '',
          idEquipe: '',
          idGerente: '',
        },
      });

      // Abre o formulário apenas após carregar as equipes com sucesso
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
    // Agora formData nunca será null porque tem valor padrão
    console.log('Dados para envio:', formData);

    try {
      setIsLoading(true);

      if (
        isEditMode &&
        editingProjeto &&
        formData.editData
      ) {
        // Modo edição
        const response = await fetch(
          `/api/projeto/alterar-projeto`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingProjeto.id,
              nome: formData.values.nome,
              inativo: formData.values.inativo,
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
          '/api/projetos/novo-projeto',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: formData.values.nome,
              idEquipe: formData.values.idEquipe,
              idGerente: formData.values.idGerente,
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
      fetchProjetos(); // Recarregar a lista
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
  }, [formData, isEditMode, fetchProjetos]);

  // Fechar formulário
  const handleCloseForm = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingProjeto(null);
      setIsEditMode(false);
      // Não resetar formData completamente, apenas remove referências específicas
      setFormData((prev) => ({
        values: prev.values,
        // Mantém a estrutura mas limpa dados específicos
      }));
    }
  }, []);

  // Colunas da tabela
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

  // Dados mapeados para a tabela
  const mappedTable = useMemo(
    () => projetos.map(mapProjetoToTableData),
    [projetos],
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
    fetchProjetos();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    statusFiltroAplicado,
  ]);

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
            equipes={equipes}
            usuarios={membrosDaEquipe}
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
