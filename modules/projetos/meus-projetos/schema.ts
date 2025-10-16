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
  equipeId: z.uuid({
    message: 'Selecione uma equipe válida',
  }),
  gerenteId: z
    .string()
    .uuid({ message: 'Selecione um gerente válido' })
    .optional(),
  inativo: z.boolean().default(false),
});

export type ProjetoFormValues = z.infer<
  typeof ProjetoFormSchema
>;

export interface CurrentProjetoData {
  id: string;
  nome: string;
  inativo: boolean;
  equipeId: string;
  gerenteId?: string;
}

// Tipos para criação e edição
export type CreateProjetoData = {
  nome: string;
  equipeId: string;
  gerenteId?: string;
};

export type EditProjetoData = {
  id: string;
  nome: string;
  inativo: boolean;
  equipeId: string;
  gerenteId?: string;
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
): CreateProjetoData => ({
  nome: formData.nome,
  equipeId: formData.equipeId,
  gerenteId: formData.gerenteId,
});

export const convertFormToEditData = (
  formData: ProjetoFormValues,
  id: string,
): EditProjetoData => ({
  id,
  nome: formData.nome,
  inativo: formData.inativo,
  equipeId: formData.equipeId,
  gerenteId: formData.gerenteId,
});

export const convertCurrentDataToForm = (
  currentData: CurrentProjetoData,
): ProjetoFormValues => ({
  nome: currentData.nome,
  inativo: currentData.inativo,
  equipeId: currentData.equipeId,
  gerenteId: currentData.gerenteId,
});
