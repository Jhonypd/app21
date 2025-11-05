import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(3, 'O email precisa ter no mínimo 3 caracteres')
    .max(100, 'O email deve ter no máximo 100 caracteres'),
  senha: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres'),
});

export const CadastroFormSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'O email deve ter no máximo 100 caracteres')
    .min(5, 'O email deve ter no mínimo 5 caracteres'),
  senha: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres'),
  confirmarSenha: z
    .string()
    .min(
      6,
      'A confirmação de senha deve ter no mínimo 6 caracteres',
    )
    .max(
      100,
      'A confirmação de senha deve ter no máximo 100 caracteres',
    ),
});

export type LoginFormValues = z.infer<
  typeof LoginFormSchema
>;

export type CadastroFormValues = z.infer<
  typeof CadastroFormSchema
>;

export interface AuthFormDataChange {
  login?: LoginFormValues;
  cadastro?: CadastroFormValues;
}
