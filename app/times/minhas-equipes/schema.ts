import { z } from 'zod';

// Schema do formulário
export const equipeFormSchema = z.object({
  nome: z
    .string()
    .min(
      5,
      'O nome da equipe precisa ter no mínimo 5 caracteres',
    )
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  inativo: z.boolean().default(false),
  projetos: z.array(z.string()).default([]), // sempre ids no formulário
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
  projetos: Array<{ id: string }>; // 👈 só precisa do id na criação
  // inativo não é enviado na criação, usa default do banco
};

export type EditEquipeData = {
  id: string;
  nome: string;
  inativo: boolean;
  projetos: Array<{ id: string }>; // idem aqui
};

// Funções de conversão
export const convertFormToCreateData = (
  formData: EquipeFormValues,
): CreateEquipeData => ({
  nome: formData.nome,
  projetos: formData.projetos.map((id) => ({ id })),
});

export const convertFormToEditData = (
  formData: EquipeFormValues,
  id: string,
): EditEquipeData => ({
  id,
  nome: formData.nome,
  inativo: formData.inativo,
  projetos: formData.projetos.map((id) => ({ id })), // ids do form → objetos { id }
});

export const convertCurrentDataToForm = (
  currentData: CurrentEquipeData,
): EquipeFormValues => ({
  nome: currentData.nome,
  inativo: currentData.inativo,
  projetos: currentData.projetos.map((p) => p.id), // objetos do banco → apenas ids
});
