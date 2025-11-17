import {
  CriarSalaData,
  EditarSalaData,
  SalaForm,
} from './types';

export interface SalaAtualData {
  id: string;
  titulo: string;
  senha?: string | null;
  inativo: boolean;
}

// Interface para o onDataChange
export interface SalaFormularioDataChange {
  values: SalaForm;
  criarData?: CriarSalaData;
  editarData?: EditarSalaData;
}

// entrar na sala
export interface FormularioEntrarSalaData {
  salaPrivada: boolean;
  codigo: string;
  senha?: string | null;
}
