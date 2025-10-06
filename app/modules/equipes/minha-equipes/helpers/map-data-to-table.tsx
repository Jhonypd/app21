import {
  ColumnsEquipesTable,
  Equipes,
} from '../interfaces';
import { IntegrantesDialog } from '../components/IntegrantesDialog';

export const mapEquipeToTableData = (
  equipe: Equipes,
): ColumnsEquipesTable => ({
  id: equipe.id,
  editar: null,
  nome: equipe.nome,
  administrador:
    equipe.membrosEquipe.find((m) => m.proprietario)
      ?.nome || 'N/A',
  integrantes: <IntegrantesDialog equipe={equipe} />,
  inativo: equipe.inativo ? 'inativo' : 'ativo',
});
