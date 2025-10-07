export enum cargosProjeto {
  gerente = 0,
  analista = 1,
  desenvolvedor = 2,
  designer = 3,
}

export interface ParticipantesProjetos {
  id: string;
  nome: string;
  inativo: boolean;
  cargo: number;
}
export interface Projetos {
  id: string;
  nome: string;
  inativo: boolean;
  participantes: ParticipantesProjetos[];
}

export interface ColumnsProjetosTable {
  id: string;
  editar: React.ReactNode;
  nome: string;
  gerente: string;
  participantes: React.ReactNode;
  inativo: 'ativo' | 'inativo';
}
export interface ColumnsParticipantesProjetosTable {
  id: string;
  nome: string;
  cargo: string;
  inativo: 'ativo' | 'inativo';
}
