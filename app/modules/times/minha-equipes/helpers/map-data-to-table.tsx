import { toastInfo } from '@/components/custom-toast';
import { Badge } from '@/components/ui/badge';
import {
  ColumnsEquipesTable,
  Equipes,
} from '../interfaces';

export const mapEquipeToTableData = (
  equipe: Equipes,
): ColumnsEquipesTable => ({
  id: equipe.id,
  editar: null,
  nome: equipe.nome,
  administrador:
    equipe.membrosEquipe.find((m) => m.proprietario)
      ?.nome || 'N/A',
  integrantes: (
    <Badge
      className="ml-[25%] px-3 py-1 sm:ml-[11%]"
      variant={'neutral'}
      onClick={() => {
        toastInfo({
          description: `${equipe.membrosEquipe.map((m) => m.nome).join(', ')}`,
        });
      }}
    >
      {equipe.membrosEquipe.length}
    </Badge>
  ),
  projetos: (
    <Badge
      className="ml-[15%] px-3 py-1 sm:ml-[10%]"
      variant={'neutral'}
      onClick={() => {
        toastInfo({
          description: `${equipe.projetos.map((p) => p.nome).join(', ')}`,
        });
      }}
    >
      {equipe.projetos.length}
    </Badge>
  ),
  inativo: equipe.inativo ? 'inativo' : 'ativo',
});
