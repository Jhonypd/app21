export interface Equipes {
  id: string;
  nome: string;
  inativo: boolean;
  membrosEquipe: {
    id: string;
    nome: string;
    inativo: boolean;
    proprietario: boolean;
  }[];
  projetos: {
    id: string;
    nome: string;
    inativo: boolean;
  }[];
}

export interface ColumnsEquipesTable {
  id: string;
  editar: React.ReactNode;
  nome: string;
  administrador: string;
  integrantes: React.ReactNode;
  projetos: React.ReactNode;
  inativo: 'ativo' | 'inativo';
}
