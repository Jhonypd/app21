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
   textoPadrao: string | React.ReactNode;
   dialogAberto: boolean;
   setDialogAberto: (aberto: boolean) => void;
   dialogLoading: boolean;
   handleSubmit: () => Promise<void>;
   btnCancelar?: string;
   btnConfirmar?: string;
   tipo: 'destrutivo' | 'padrao' | 'cancelamento';
}

const DialogConfirmacao: React.FC<DialogConfirmacaoProps> = ({
   titulo = 'Deseja continuar com o cancelamento?',
   textoPadrao = 'Ao continuar você perderá todas as informações preenchidas, deseja continuar?',
   btnCancelar = 'Cancelar',
   btnConfirmar = 'Confirmar',
   dialogAberto,
   setDialogAberto,
   dialogLoading,
   handleSubmit,
   tipo,
}) => {
   const handlePreventInteraction = useCallback((event: Event) => {
      event.preventDefault();
   }, []);

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
            className="border-border bg-popover text-popover-foreground max-w-11/12 rounded-lg border p-6 shadow-lg sm:max-w-xl"
            role="dialog"
            showCloseButton={false}
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
                  className="uppercase"
               >
                  {btnCancelar}
               </Button>
               <Button
                  variant={tipo === 'destrutivo' ? 'destructive' : 'default'}
                  onClick={handleSubmit}
                  disabled={dialogLoading}
                  className="uppercase"
               >
                  {btnConfirmar}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default DialogConfirmacao;
