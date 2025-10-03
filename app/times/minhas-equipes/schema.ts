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
  projetos: z.array(z.string()).default([]),
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
  }>;
  projetos: Array<{
    id: string;
    nome: string;
    inativo: boolean;
  }>;
}

// Tipos para criação e edição
export type CreateEquipeData = {
  nome: string;
  projetos: string[]; // Mudou para array de strings
  membrosAdicionar: string[];
};

export type EditEquipeData = {
  id: string;
  nome: string;
  inativo: boolean;
  projetosAdicionar: string[];
  projetosRemover: string[];
  membrosAdicionar: string[];
  membrosRemover: string[];
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
  projetos: formData.projetos,
  membrosAdicionar,
});

export const convertFormToEditData = (
  formData: EquipeFormValues,
  id: string,
  projetosAdicionar: string[] = [],
  projetosRemover: string[] = [],
  membrosAdicionar: string[] = [],
  membrosRemover: string[] = [],
): EditEquipeData => ({
  id,
  nome: formData.nome,
  inativo: formData.inativo,
  projetosAdicionar,
  projetosRemover,
  membrosAdicionar,
  membrosRemover,
});

export const convertCurrentDataToForm = (
  currentData: CurrentEquipeData,
): EquipeFormValues => ({
  nome: currentData.nome,
  inativo: currentData.inativo,
  projetos: currentData.projetos.map((p) => p.id),
});
