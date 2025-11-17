import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { useEffect, useState } from 'react';
import { FormularioEntrarSala } from './formulario-entrar-sala';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

interface SalaEntrarDialogProps {
  salaPrivada: boolean;
  codigoSala: string;
  proprietario: boolean;
  onSubmit: (data: {
    codigo: string;
    senha?: string;
  }) => void;
  fecharDialog?: boolean;
}

export const DialogEntrarSala: React.FC<
  SalaEntrarDialogProps
> = ({
  codigoSala,
  salaPrivada,
  proprietario,
  onSubmit,
  fecharDialog,
}) => {
  const [open, setOpen] = useState(false);
  const [dadosForm, setDadosForm] = useState<{
    salaPrivada: boolean;
    codigo: string;
    senha?: string | null;
  } | null>(null);
  const [formValido, setFormValido] = useState(false);

  const isOverlay = true;

  useEffect(() => {
    if (isOverlay && open) {
      document.body.classList.add('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOverlay, open]);

  useEffect(() => {
    if (fecharDialog) setOpen(false);
  }, [fecharDialog]);

  useEffect(() => {
    if (open) {
      // Resetar formValido quando dialog abre (será atualizado pelo formulário)
      setFormValido(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!formValido || !dadosForm) return;
    onSubmit({
      codigo: dadosForm.codigo,
      senha: dadosForm.senha ?? undefined,
    });
  };

  return (
    <>
      <Button
        type="button"
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm transition-all hover:bg-purple-700 active:bg-purple-800"
        variant={'default'}
        onClick={() => setOpen(true)}
      >
        Entrar na sala <ChevronRight className="h-4 w-4" />
      </Button>

      <div
        className={clsx(
          'fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center sm:max-w-full',
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
          <DialogContent
            className="max-w-11/12 rounded-sm border-slate-700 bg-slate-900 text-white sm:max-w-4xl"
            aria-describedby={'dialog'}
            role="dialog"
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
            <DialogHeader>
              <DialogTitle className="sr-only">
                Entrar em uma Sala
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Digite o código da sala para participar
              </DialogDescription>
            </DialogHeader>

            <div className="grow overflow-y-auto px-3 py-3">
              <FormularioEntrarSala
                codigo={codigoSala}
                salaPrivada={salaPrivada}
                proprietario={proprietario}
                isLoading={false}
                onDataChange={setDadosForm}
                isValidated={setFormValido}
              />
            </div>

            <DialogFooter className="w-full flex-row flex-nowrap justify-end gap-3 border-t-2 border-b-gray-600 p-2">
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                disabled={!formValido}
                onClick={handleSubmit}
              >
                Entrar
              </Button>

              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
