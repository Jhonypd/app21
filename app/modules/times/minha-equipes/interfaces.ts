export interface IntegrantesEquipes {
  id: string;
  nome: string;
  inativo: boolean;
  proprietario: boolean;
}
export interface Equipes {
  id: string;
  nome: string;
  inativo: boolean;
  membrosEquipe: IntegrantesEquipes[];
}

export interface ColumnsEquipesTable {
  id: string;
  editar: React.ReactNode;
  nome: string;
  administrador: string;
  integrantes: React.ReactNode;
  inativo: 'ativo' | 'inativo';
}
export interface ColumnsIntegrantesEquipesTable {
  id: string;
  nome: string;
  administrador: 'Administrador' | '';
  inativo: 'ativo' | 'inativo';
}
