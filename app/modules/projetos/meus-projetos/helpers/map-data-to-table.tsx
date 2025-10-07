import {
  ColumnsProjetosTable,
  Projetos,
} from '@/app/modules/projetos/meus-projetos/interfaces';
import { ParticipantesDialog } from '../components/participantesDialog';

export const mapProjetoToTableData = (
  projeto: Projetos,
): ColumnsProjetosTable => {
  const gerente = projeto.participantes.find(
    (m) => m.cargo === 0,
  );

  return {
    id: projeto.id,
    editar: null,
    nome: projeto.nome,
    gerente: gerente?.nome || 'N/A',
    participantes: (
      <ParticipantesDialog projeto={projeto} />
    ),
    inativo: projeto.inativo ? 'inativo' : 'ativo',
  };
};
