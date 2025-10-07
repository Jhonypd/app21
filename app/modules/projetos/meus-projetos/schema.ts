import { z } from 'zod';

// Schema do formulário
export const ProjetoFormSchema = z.object({
  nome: z
    .string()
    .min(
      3,
      'O nome da equipe precisa ter no mínimo 3 caracteres',
    )
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  inativo: z.boolean().default(false),
});

export type ProjetoFormValues = z.infer<
  typeof ProjetoFormSchema
>;

export interface CurrentProjetoData {
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
export type CreateProjetoData = {
  nome: string;
  membrosAdicionar: string[];
};

export type EditProjetoData = {
  id: string;
  nome: string;
  inativo: boolean;
  membrosAdicionar: string[];
  membrosRemover: string[];
};

// Interface para o onDataChange
export interface ProjetoFormDataChange {
  values: ProjetoFormValues;
  createData?: CreateProjetoData;
  editData?: EditProjetoData;
}

// Funções de conversão
export const convertFormToCreateData = (
  formData: ProjetoFormValues,
  membrosAdicionar: string[] = [],
): CreateProjetoData => ({
  nome: formData.nome,
  membrosAdicionar,
});

export const convertFormToEditData = (
  formData: ProjetoFormValues,
  id: string,
  membrosAdicionar: string[] = [],
  membrosRemover: string[] = [],
): EditProjetoData => ({
  id,
  nome: formData.nome,
  inativo: formData.inativo,
  membrosAdicionar,
  membrosRemover,
});

export const convertCurrentDataToForm = (
  currentData: CurrentProjetoData,
): ProjetoFormValues => ({
  nome: currentData.nome,
  inativo: currentData.inativo,
});
