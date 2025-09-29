'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/loading';
import { DataTable } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/page-header';
import { HiOutlineUserGroup } from 'react-icons/hi';
import BasicForm from '@/components/basic-form';
import { EquipeForm, EquipeFormRef } from './equipes-form';
import {
  CreateEquipeData,
  EditEquipeData,
  EquipeFormValues,
  CurrentEquipeData,
} from './schema';

interface Equipe {
  id: string;
  nome: string;
  inativo: boolean;
  data_criacao: string;
  data_alteracao: string;
  totalMembros: number;
  totalProjetos: number;
}

const PageEquipes = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentEquipe, setCurrentEquipe] =
    useState<CurrentEquipeData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValidForm, setIsValidForm] =
    useState<boolean>(false);
  const { user } = useAuth();
  const formRef = useRef<EquipeFormRef>(null);

  // Buscar equipes
  useEffect(() => {
    const fetchEquipes = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/equipes');
        if (!res.ok) {
          throw new Error('Falha ao carregar as equipes');
        }
        const data = await res.json();
        setEquipes(data.equipes || []);
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
        setLoading(false);
      }
    };

    fetchEquipes();
  }, []);

  // Resetar estado do formulário
  const resetFormState = () => {
    setCurrentEquipe(null);
    setIsEditMode(false);
    formRef.current?.reset();
  };

  // Abrir formulário para criação
  const handleCreate = () => {
    resetFormState();
    setIsSheetOpen(true);
  };

  // Abrir formulário para edição
  const handleEdit = (equipe: Equipe) => {
    const currentData: CurrentEquipeData = {
      id: equipe.id,
      nome: equipe.nome,
      inativo: equipe.inativo,
      membrosEquipe: [], // Você precisará buscar esses dados se necessário
      projetos: [], // Você precisará buscar esses dados se necessário
    };

    setCurrentEquipe(currentData);
    setIsEditMode(true);
    setIsSheetOpen(true);
  };

  // Validação do formulário
  const handleValidation = (valid: boolean) => {
    console.log('Formulário válido:', valid);

    setIsValidForm(valid);
  };

  // Mudanças nos dados do formulário
  const handleDataChange = (data: {
    values: EquipeFormValues;
    createData?: CreateEquipeData;
    editData?: EditEquipeData;
  }) => {
    console.log('Dados alterados:', data);
    // Aqui você pode atualizar o estado se necessário
  };

  // Submissão do formulário
  const handleSubmit = async (data: EquipeFormValues) => {
    try {
      const url =
        isEditMode && currentEquipe
          ? `/api/equipes/${currentEquipe.id}`
          : '/api/equipes/nova-equipe';

      const method = isEditMode ? 'PUT' : 'POST';
      const body =
        isEditMode && currentEquipe
          ? { nome: data.nome, inativo: data.inativo }
          : { nome: data.nome }; // Não envia inativo na criação

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar equipe');
      }

      const result = await response.json();

      toast.success(
        isEditMode
          ? 'Equipe atualizada com sucesso!'
          : 'Equipe criada com sucesso!',
      );

      // Recarregar a lista de equipes
      const equipesRes = await fetch('/api/equipes');
      const equipesData = await equipesRes.json();
      setEquipes(equipesData.equipes || []);

      // Fechar o formulário
      setIsSheetOpen(false);
      resetFormState();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toast.error('Erro ao salvar equipe', {
        description: 'Tente novamente mais tarde.',
      });
    }
  };

  // Excluir equipe
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/equipes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir equipe');
      }

      toast.success('Equipe excluída com sucesso!');

      // Atualizar lista
      setEquipes((prev) =>
        prev.filter((equipe) => equipe.id !== id),
      );
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      toast.error('Erro ao excluir equipe', {
        description: 'Tente novamente mais tarde.',
      });
    }
  };

  if (loading) {
    return (
      <Loading
        active
        type="transaction"
      />
    );
  }

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
  console.log({ equipes });
  return (
    <div className="container mx-auto w-full">
      <PageHeader
        title="Gerenciar Equipes"
        description="Criar e gerenciar equipes de trabalho"
        icon={<HiOutlineUserGroup />}
      />

      <DataTable
        form={
          <BasicForm
            title={
              isEditMode ? 'Editar Equipe' : 'Nova Equipe'
            }
            submitText={isEditMode ? 'Atualizar' : 'Salvar'}
            isLoading={false}
            isOverlay={true}
            mode={isEditMode ? 'edit' : 'create'}
            open={isSheetOpen}
            onOpenChange={(open) => {
              setIsSheetOpen(open);
              if (!open) {
                resetFormState();
              }
            }}
            onSubmit={() => formRef.current?.submit()}
            isValid={isValidForm}
          >
            <EquipeForm
              ref={formRef}
              isLoading={false}
              isValidated={handleValidation}
              onDataChange={handleDataChange}
              onSubmit={handleSubmit}
              initialData={currentEquipe || undefined}
            />
          </BasicForm>
        }
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        data={equipes}
        columns={[
          { key: 'id', label: 'id' },
          { key: 'nome', label: 'Nome' },
          {
            key: 'inativo',
            label: 'Status',
            format: (value: boolean) =>
              value ? 'Inativo' : 'Ativo',
          },
          { key: 'totalMembros', label: 'Membros' },
          { key: 'totalProjetos', label: 'Projetos' },
        ]}
      />
    </div>
  );
};

export default PageEquipes;
