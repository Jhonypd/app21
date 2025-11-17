import React, { useEffect, useCallback, memo } from 'react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import clsx from 'clsx';

type FormMode = 'create' | 'edit' | 'view';

interface Props {
  mode?: FormMode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  onSubmit?: () => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  isValid?: boolean;
  cancelText?: string;
  submitText?: string;
  className?: string;
  contentClassName?: string;
  resetForm?: () => void;
  isOverlay?: boolean;
}

const FormularioBase = memo(function FormularioBase({
  mode = 'create',
  open,
  onOpenChange,
  children,
  title,
  onSubmit,
  onCancel,
  isLoading = false,
  isValid = false,
  cancelText = 'CANCELAR',
  submitText = 'SALVAR',
  className = '',
  contentClassName = '',
  isOverlay = true,
  resetForm,
}: Props) {
  // Efeito para controlar overflow do body - otimizado
  useEffect(() => {
    if (!isOverlay || !open) return;

    document.body.classList.add('overflow-hidden');

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOverlay, open]);

  // Handlers memoizados para evitar recriações
  const handleSubmit = useCallback(async () => {
    await onSubmit?.();
  }, [onSubmit]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange?.(false);
    resetForm?.();
  }, [onCancel, onOpenChange, resetForm]);

  // Prevenir eventos externos - memoizado
  const handlePreventInteraction = useCallback(
    (event: Event) => {
      event.preventDefault();
    },
    [],
  );

  // Classes memoizadas para evitar recálculos
  const containerClasses = useCallback(
    (isOpen: boolean) =>
      clsx(
        'fixed inset-0 z-50 flex h-full w-full items-center justify-center sm:max-w-full',
        isOverlay && isOpen
          ? 'pointer-events-auto bg-black/60'
          : 'pointer-events-none',
        !isOpen && 'hidden',
      ),
    [isOverlay],
  );

  const sheetContentClasses = useCallback(
    () =>
      `flex h-full w-full flex-col overflow-hidden rounded-tl-lg border-l-0 p-0 outline-0 sm:w-auto ${className}`,
    [className],
  );

  const contentClasses = useCallback(
    () =>
      `grow overflow-y-auto px-3 py-3 ${contentClassName}`,
    [contentClassName],
  );

  return (
    <div className={containerClasses(!!open)}>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        modal={false}
      >
        <SheetContent
          aria-describedby={'form-basic'}
          onPointerDownOutside={handlePreventInteraction}
          onInteractOutside={handlePreventInteraction}
          onEscapeKeyDown={handlePreventInteraction}
          onCloseAutoFocus={handlePreventInteraction}
          className={sheetContentClasses()}
          role="dialog"
        >
          <SheetTitle className="sr-only">
            {title}
          </SheetTitle>
          <SheetHeader className="bg-primary z-10 justify-between px-4 py-3">
            <h2 className="text-xl text-white">{title}</h2>
          </SheetHeader>

          <div className={contentClasses()}>{children}</div>

          <SheetFooter className="w-full flex-row flex-nowrap justify-end gap-3 border-t-2 border-b-gray-600 p-4">
            <SheetClose
              asChild
              className="min-w-28 cursor-pointer border-slate-700 bg-slate-800 text-white uppercase hover:bg-slate-700"
            >
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
            </SheetClose>

            {mode !== 'view' && (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !isValid}
                className="min-w-28 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white uppercase hover:from-purple-700 hover:to-pink-700"
              >
                {submitText}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
});

FormularioBase.displayName = 'FormularioBase';

export default FormularioBase;
