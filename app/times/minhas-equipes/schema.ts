import { z } from 'zod';

// Schema do formulário
export const equipeFormSchema = z.object({
  nome: z
    .string()
    .min(
      3,
      'O nome da equipe precisa ter no mínimo 3 caracteres',
    )
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  inativo: z.boolean().default(false),
});

export type EquipeFormValues = z.infer<
  typeof equipeFormSchema
>;

export interface CurrentEquipeData {
  id: string;
  nome: string;
  inativo: boolean;
  membrosEquipe: Array<{
    id: string;
    nome: string;
    inativo: boolean;
    administrador: boolean;
  }>;
}

// Tipos para criação e edição
export type CreateEquipeData = {
  nome: string;
  membrosAdicionar: string[];
};

export type EditEquipeData = {
  id: string;
  nome: string;
  inativo: boolean;
  membrosAdicionar: string[];
  membrosRemover: string[];
  administrador: {
    id: string;
    nome: string;
    inativo: boolean;
    administrador: boolean;
  };
  novoAdministradorId?: string;
};

// Interface para o onDataChange
export interface EquipeFormDataChange {
  values: EquipeFormValues;
  createData?: CreateEquipeData;
  editData?: EditEquipeData;
}

// Funções de conversão
export const convertFormToCreateData = (
  formData: EquipeFormValues,
  membrosAdicionar: string[] = [],
): CreateEquipeData => ({
  nome: formData.nome,
  membrosAdicionar,
});

export const convertFormToEditData = (
  formData: EquipeFormValues,
  id: string,
  membrosAdicionar: string[] = [],
  membrosRemover: string[] = [],
  administrador: {
    id: string;
    nome: string;
    inativo: boolean;
    administrador: boolean;
  },
  novoAdministradorId?: string,
): EditEquipeData => ({
  id,
  nome: formData.nome,
  inativo: formData.inativo,
  membrosAdicionar,
  membrosRemover,
  administrador,
  novoAdministradorId,
});

export const convertCurrentDataToForm = (
  currentData: CurrentEquipeData,
): EquipeFormValues => ({
  nome: currentData.nome,
  inativo: currentData.inativo,
});
