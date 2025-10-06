import { IntegrantesDialog } from '@/app/modules/equipes/minha-equipes/components/IntegrantesDialog';
import {
  ColumnsProjetosTable,
  Projetos,
} from '@/app/modules/projetos/meus-projetos/interfaces';

export const mapEquipeToTableData = (
  equipe: Projetos,
): ColumnsProjetosTable => ({
  id: equipe.id,
  editar: null,
  nome: equipe.nome,
  administrador:
    equipe.integrantes.find((m) => m.proprietario)?.nome ||
    'N/A',
  integrantes: <IntegrantesDialog equipe={equipe} />,
  inativo: equipe.inativo ? 'inativo' : 'ativo',
});
