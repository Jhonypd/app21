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
  idEquipe: z.uuid(),
  idGerente: z.string().uuid().optional(),
  inativo: z.boolean().default(false),
});

export type ProjetoFormValues = z.infer<
  typeof ProjetoFormSchema
>;

export interface CurrentProjetoData {
  id: string;
  nome: string;
  inativo: boolean;
  idEquipe: string;
  idGerente?: string;
}

// Tipos para criação e edição
export type CreateProjetoData = {
  nome: string;
  idEquipe: string;
  idGerente?: string;
};

export type EditProjetoData = {
  id: string;
  nome: string;
  inativo: boolean;
  idEquipe: string;
  idGerente?: string;
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
  idEquipe: formData.idEquipe,
  idGerente: formData.idGerente,
});

export const convertFormToEditData = (
  formData: ProjetoFormValues,
  id: string,
): EditProjetoData => ({
  id,
  nome: formData.nome,
  inativo: formData.inativo,
  idEquipe: formData.idEquipe,
  idGerente: formData.idGerente,
});

export const convertCurrentDataToForm = (
  currentData: CurrentProjetoData,
): ProjetoFormValues => ({
  nome: currentData.nome,
  inativo: currentData.inativo,
  idEquipe: currentData.idEquipe,
  idGerente: currentData.idGerente,
});
