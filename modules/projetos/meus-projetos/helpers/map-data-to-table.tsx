import {
  ColumnsProjetosTable,
  Projetos,
} from '@/modules/projetos/meus-projetos/interfaces';
import { ParticipantesDialog } from '../components/participantesDialog';

export const mapProjetoToTableData = (
  projeto: Projetos,
): ColumnsProjetosTable => {
  const gerente = projeto.equipe.pessoas.find(
    (m) => m.proprietario === true,
  );
  console.log({ gerente });
  return {
    id: projeto.id,
    editar: null,
    nome: projeto.nome,
    gerente: gerente?.nome || 'N/A',
    integrantes: <ParticipantesDialog projeto={projeto} />,
    inativo: projeto.inativo ? 'inativo' : 'ativo',
  };
};
