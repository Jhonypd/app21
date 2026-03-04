'use client';

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from '@/components/ui/dialog';
import { useCallback } from 'react';

interface ModalBaseProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   titulo: React.ReactNode | string;
   children: React.ReactNode;
   botoesAcoes?: React.ReactNode;
   maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses = {
   sm: 'sm:max-w-sm',
   md: 'sm:max-w-md',
   lg: 'sm:max-w-lg',
   xl: 'sm:max-w-xl',
   '2xl': 'sm:max-w-2xl',
};

export function ModalBase({
   open,
   onOpenChange,
   titulo,
   children,
   botoesAcoes,
   maxWidth = 'lg',
}: ModalBaseProps) {
   const handlePreventInteraction = useCallback((event: Event) => {
      event.preventDefault();
   }, []);
   return (
      <Dialog
         open={open}
         onOpenChange={onOpenChange}
      >
         <DialogContent
            onPointerDownOutside={handlePreventInteraction}
            onInteractOutside={handlePreventInteraction}
            onEscapeKeyDown={handlePreventInteraction}
            onCloseAutoFocus={handlePreventInteraction}
            className={`max-w-11/12 rounded-sm border-slate-700 bg-slate-900 p-0 text-white ${maxWidthClasses[maxWidth]}`}
            showCloseButton={false}
         >
            <DialogHeader className="border-b border-b-slate-400/10 p-4">
               <DialogTitle className="max-w-11/12 truncate px-4 text-left text-xl font-semibold text-ellipsis">
                  {titulo}
               </DialogTitle>
               <DialogDescription className="sr-only">
                  {typeof titulo === 'string'
                     ? `Detalhes do modal: ${titulo}`
                     : 'Detalhes do modal'}
               </DialogDescription>
            </DialogHeader>

            <div className="h-full w-full space-y-4 overflow-hidden p-2">
               {children}
            </div>

            {botoesAcoes && (
               <DialogFooter className="gap-4 border-t border-t-slate-400/10 p-4">
                  {botoesAcoes}
               </DialogFooter>
            )}
         </DialogContent>
      </Dialog>
   );
}
