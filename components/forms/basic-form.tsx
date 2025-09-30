import React, { useEffect } from "react";

import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import clsx from "clsx";

type FormMode = "create" | "edit" | "view";

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

const BasicForm = ({
  mode = "create",
  open,
  onOpenChange,
  children,
  title,
  onSubmit,
  onCancel,
  isLoading = false,
  isValid = false,
  cancelText = "CANCELAR",
  submitText = "SALVAR",
  className = "",
  contentClassName = "",
  isOverlay = true,
  resetForm,
}: Props) => {
  useEffect(() => {
    if (isOverlay && open) {
      document.body.classList.add("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOverlay, open]);

  const handleSubmit = async () => {
    await onSubmit?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
    resetForm?.();
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex h-full w-full items-center justify-center sm:max-w-full",
        isOverlay && open
          ? "pointer-events-auto bg-black/60"
          : "pointer-events-none",
        !open && "hidden",
      )}
    >
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={`flex h-full w-full flex-col overflow-hidden rounded-tl-lg border-l-0 p-0 outline-0 sm:w-auto ${className}`}
          role="dialog"
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <SheetHeader className="z-10 justify-between bg-primary px-4 py-3">
            <h2 className="text-xl text-white">{title}</h2>
          </SheetHeader>

          <div className={`grow overflow-y-auto px-3 ${contentClassName}`}>
            {children}
          </div>

          <SheetFooter className="w-full flex-row flex-nowrap justify-end gap-3 border-t-2 border-b-gray-600 p-4">
            <SheetClose asChild className="min-w-28 cursor-pointer uppercase">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
            </SheetClose>

            {mode !== "view" && (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !isValid}
                className="min-w-28 cursor-pointer uppercase"
              >
                {submitText}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BasicForm;
