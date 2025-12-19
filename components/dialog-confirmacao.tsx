'use client';
import { Button } from './ui/button';
import React, { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface DialogConfirmacaoProps {
  titulo: string;
  textoPadrao: string;
  dialogAberto: boolean;
  setDialogAberto: (aberto: boolean) => void;
  dialogLoading: boolean;
  handleSubmit: () => Promise<void>;
  btnCancelar?: string;
  btnConfirmar?: string;
}

const DialogConfirmacao: React.FC<
  DialogConfirmacaoProps
> = ({
  titulo = 'Deseja continuar com o cancelamento?',
  textoPadrao = 'Ao continuar você perderá todas as informações preenchidas, deseja continuar?',
  btnCancelar = 'Cancelar',
  btnConfirmar = 'Confirmar',
  dialogAberto,
  setDialogAberto,
  dialogLoading,
  handleSubmit,
}) => {
  const handlePreventInteraction = useCallback(
    (event: Event) => {
      event.preventDefault();
    },
    [],
  );
  return (
    <Dialog
      open={dialogAberto}
      onOpenChange={setDialogAberto}
    >
      <DialogContent
        onPointerDownOutside={handlePreventInteraction}
        onInteractOutside={handlePreventInteraction}
        onEscapeKeyDown={handlePreventInteraction}
        onCloseAutoFocus={handlePreventInteraction}
        className="border-border bg-popover text-popover-foreground max-w-11/12 rounded-lg border p-6 shadow-lg sm:max-w-xl [&_svg]:hidden"
        role="dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {titulo}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {textoPadrao}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setDialogAberto(false)}
            disabled={dialogLoading}
            className=""
          >
            {btnCancelar}
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={dialogLoading}
          >
            {btnConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogConfirmacao;
