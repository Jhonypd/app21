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
import {
  Projetos,
  ColumnsIntegrantesProjetosTable,
  Pessoas,
} from '../interfaces';
import { obterCargoLabelProjetos } from '../helpers/map-cargos-projetos';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { IntegrantesProjetosColumns } from './columns-projetos';

interface ParticipantesDialogProps {
  projeto: Projetos;
}

export const mapParticipantesProjetosToTable = (
  pessoas: Pessoas,
): ColumnsIntegrantesProjetosTable => ({
  id: pessoas.id,
  nome: pessoas.nome,
  cargo: obterCargoLabelProjetos(
    pessoas.proprietario ? 0 : 2,
  ),
  inativo: pessoas.inativo ? 'inativo' : 'ativo',
});

export const ParticipantesDialog: React.FC<
  ParticipantesDialogProps
> = ({ projeto }) => {
  const [open, setOpen] = useState(false);
  const isOverlay = true;

  useEffect(() => {
    if (isOverlay && open) {
      document.body.classList.add('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOverlay, open]);

  const mappedTable = projeto.equipe.pessoas.map(
    mapParticipantesProjetosToTable,
  );

  const columns = IntegrantesProjetosColumns({
    data: projeto.equipe.pessoas.map(
      mapParticipantesProjetosToTable,
    ),
  });

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
      >
        {projeto.equipe.pessoas.length}
      </Button>
      <div
        className={clsx(
          'fixed inset-0 z-50 flex h-full w-full items-center justify-center sm:max-w-full',
          isOverlay && open
            ? 'pointer-events-auto bg-black/60'
            : 'pointer-events-none',
          !open && 'hidden',
        )}
      >
        <Dialog
          open={open}
          onOpenChange={setOpen}
          modal={false}
        >
          <DialogTrigger asChild>
            <Badge
              className="ml-[25%] cursor-pointer px-3 py-1 sm:ml-[11%]"
              variant={'neutral'}
              onClick={() => setOpen(true)}
            >
              {projeto.equipe.pessoas.length}
            </Badge>
          </DialogTrigger>
          <DialogContent
            aria-describedby={'dialog'}
            role="dialog"
            className={`flex h-96 w-72 flex-col overflow-hidden rounded-tl-lg border-l-0 p-0 outline-0 sm:w-auto`}
            onPointerDownOutside={(event) => {
              event.preventDefault();
            }}
            onInteractOutside={(event) => {
              event.preventDefault();
            }}
            onEscapeKeyDown={(event) => {
              event.preventDefault();
            }}
            onCloseAutoFocus={(event) =>
              event.preventDefault()
            }
          >
            <DialogTitle className="sr-only">
              Participantes do projeto
            </DialogTitle>
            <DialogHeader className="bg-primary z-10 justify-between px-4 py-3">
              <h2 className="text-xl font-semibold text-white uppercase">
                Participantes do projeto
              </h2>
            </DialogHeader>
            <div className={`grow overflow-y-auto px-3`}>
              <DataTable<
                ColumnsIntegrantesProjetosTable,
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
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
