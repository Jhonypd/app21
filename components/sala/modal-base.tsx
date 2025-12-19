'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCallback } from 'react';

interface ModalBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  children: React.ReactNode;
  botoes?: React.ReactNode;
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
  botoes,
  maxWidth = 'lg',
}: ModalBaseProps) {
  const handlePreventInteraction = useCallback(
    (event: Event) => {
      event.preventDefault();
    },
    [],
  );
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
        className={`max-w-11/12 rounded-sm border-slate-700 bg-slate-900 text-white ${maxWidthClasses[maxWidth]}`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">{children}</div>

        {botoes && (
          <DialogFooter className="gap-4">
            {botoes}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
