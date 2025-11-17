import { z } from 'zod';
import {
  CriarSalaData,
  EditarSalaData,
  SalaForm,
} from './types';
import { SalaAtualData } from './interfaces';

// Schema do formulário
export const SalaSchema = z
  .object({
    titulo: z
      .string('Título é obrigatório')
      .min(
        3,
        'Título é obrigatório e deve ter no mínimo 3 caracteres',
      )
      .max(100, 'Título deve ter no máximo 100 caracteres'),
    salaPrivada: z.boolean(),
    senha: z
      .string()
      .max(100, 'Senha deve ter no máximo 100 caracteres'),
    inativo: z.boolean(),
  })
  .refine(
    (data) =>
      !data.salaPrivada || data.senha.trim().length > 0,
    {
      path: ['senha'],
      message: 'Senha é obrigatória para salas privadas',
    },
  )
  .refine(
    (data) =>
      !data.salaPrivada || data.senha.trim().length >= 6,
    {
      path: ['senha'],
      message: 'Senha deve ter no mínimo 6 caracteres',
    },
  );

export const SalaEntrarSchema = z
  .object({
    codigo: z.string().min(1, 'Código é obrigatório'),
    salaPrivada: z.boolean(),
    senha: z.string().optional(),
    proprietario: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.salaPrivada && !data.proprietario) {
      if (!data.senha || data.senha.trim().length === 0) {
        ctx.addIssue({
          path: ['senha'],
          code: z.ZodIssueCode.custom,
          message:
            'Senha é obrigatória para salas privadas',
        });
      }
    }
  });

// Funções de conversão
export const converteFormParaCriacaoData = (
  formData: SalaForm,
): CriarSalaData => ({
  titulo: formData.titulo,
  salaPrivada: formData.salaPrivada,
  senha: formData.salaPrivada ? formData.senha : null,
});

export const converteFormParaEditarData = (
  formData: SalaForm,
  id: string,
): EditarSalaData => ({
  id,
  titulo: formData.titulo,
  inativo: formData.inativo,
  senha: formData.salaPrivada ? formData.senha : null,
});

export const converteDadosAtuaisParaForm = (
  currentData: SalaAtualData,
  inativo: boolean,
): SalaForm => ({
  titulo: currentData.titulo,
  salaPrivada: !!currentData.senha,
  senha: currentData.senha ?? '',
  inativo,
});
