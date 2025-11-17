import z from 'zod';
import { SalaEntrarSchema, SalaSchema } from './schema';

// formulário
export type SalaForm = z.output<typeof SalaSchema>;
export type SalaEntrarForm = z.infer<
  typeof SalaEntrarSchema
>;
// Tipos para criação e edição
export type CriarSalaData = {
  titulo: string;
  salaPrivada: boolean;
  senha?: string | null;
};

export type EditarSalaData = {
  id: string;
  titulo: string;
  inativo: boolean;
  senha?: string | null;
};

export type EntrarSalaData = {
  salaPrivada: boolean;
  codigo: string;
  senha?: string | null;
};
