import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/table/data-table';
import { IntegrantesEquipesColumns } from '../components/columns-equipes';
import {
  ColumnsIntegrantesEquipesTable,
  Equipes,
  IntegrantesEquipes,
} from '../interfaces';

interface IntegrantesDialogProps {
  equipe: Equipes;
}

// Mover as funções auxiliares para dentro do componente ou mantê-las como utilitárias
export const mapIntegrantesEquipesToTable = (
  integrantes: IntegrantesEquipes,
): ColumnsIntegrantesEquipesTable => ({
  id: integrantes.id,
  nome: integrantes.nome,
  administrador: integrantes.proprietario
    ? 'Administrador'
    : '',
  inativo: integrantes.inativo ? 'inativo' : 'ativo',
});

export const IntegrantesDialog: React.FC<
  IntegrantesDialogProps
> = ({ equipe }) => {
  const mappedTable = equipe.membrosEquipe.map(
    mapIntegrantesEquipesToTable,
  );

  const columns = IntegrantesEquipesColumns({
    data: equipe.membrosEquipe.map(
      mapIntegrantesEquipesToTable,
    ),
  });

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Badge
          className="ml-[25%] cursor-default px-3 py-1 sm:ml-[11%]"
          variant={'neutral'}
        >
          {equipe.membrosEquipe.length}
        </Badge>
      </DialogTrigger>
      <DialogContent
        role="dialog"
        className={`flex h-96 w-72 flex-col overflow-hidden rounded-tl-lg border-l-0 p-0 outline-0 sm:w-auto`}
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">
          Integrantes da equipe
        </DialogTitle>
        <DialogHeader className="bg-primary z-10 justify-between px-4 py-3">
          <h2 className="text-xl font-semibold text-white uppercase">
            Integrantes da equipe
          </h2>
        </DialogHeader>
        <div className={`grow overflow-y-auto px-3`}>
          <DataTable<
            ColumnsIntegrantesEquipesTable,
            unknown
          >
            columns={columns}
            data={mappedTable}
            selectedIds={[]}
          />
        </div>
        <DialogFooter className="w-full flex-row flex-nowrap justify-end gap-3 border-t-2 border-b-gray-600 p-2">
          <DialogClose
            asChild
            className="min-w-28 cursor-pointer uppercase"
          >
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
