import { z } from 'zod';

// Schema do formulário - use .default() para valores opcionais
export const equipeFormSchema = z.object({
  nome: z
    .string()
    .min(1, 'O nome da equipe é obrigatório')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  inativo: z.boolean().default(false),
});

export type EquipeFormValues = z.infer<
  typeof equipeFormSchema
>;

// Tipos para dados atuais (do banco)
export interface CurrentEquipeData {
  id: string;
  nome: string;
  inativo: boolean;
  membrosEquipe: Array<{
    id: string;
  }>;
  projetos: Array<{
    id: string;
  }>;
}

// Tipos para criação e edição
export type CreateEquipeData = {
  nome: string;
  // inativo não é enviado na criação, usa default do banco
};

export type EditEquipeData = {
  id: string;
  nome: string;
  inativo: boolean;
};

// Funções de conversão
export const convertFormToCreateData = (
  formData: EquipeFormValues,
): CreateEquipeData => ({
  nome: formData.nome,
});

export const convertFormToEditData = (
  formData: EquipeFormValues,
  id: string,
): EditEquipeData => ({
  id,
  nome: formData.nome,
  inativo: formData.inativo,
});

export const convertCurrentDataToForm = (
  currentData: CurrentEquipeData,
): EquipeFormValues => ({
  nome: currentData.nome,
  inativo: currentData.inativo,
});
