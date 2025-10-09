export enum cargosProjeto {
  gerente = 0,
  analista = 1,
  desenvolvedor = 2,
  designer = 3,
}

export interface Pessoas {
  id: string;
  nome: string;
  inativo: boolean;
  proprietario: boolean;
}

export interface Equipe {
  id: string;
  nome: string;
  inativo: boolean;
  pessoas: Pessoas[];
}
export interface Projetos {
  id: string;
  nome: string;
  inativo: boolean;
  equipeId: string;
  gerenteId?: string;
  equipe: Equipe;
}

export interface ColumnsProjetosTable {
  id: string;
  editar: React.ReactNode;
  nome: string;
  gerente: string;
  integrantes: React.ReactNode;
  inativo: 'ativo' | 'inativo';
}
export interface ColumnsIntegrantesProjetosTable {
  id: string;
  nome: string;
  cargo: string;
  inativo: 'ativo' | 'inativo';
}
