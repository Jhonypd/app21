export interface participantes {
  id: string;
  nome: string;
  inativo: boolean;
  proprietario: boolean;
}
export interface Projetos {
  id: string;
  nome: string;
  inativo: boolean;
  integrantes: participantes[];
}

export interface ColumnsProjetosTable {
  id: string;
  editar: React.ReactNode;
  nome: string;
  administrador: string;
  integrantes: React.ReactNode;
  inativo: 'ativo' | 'inativo';
}
export interface ColumnsParticipantesTable {
  id: string;
  nome: string;
  administrador: 'Administrador' | '';
  inativo: 'ativo' | 'inativo';
}
