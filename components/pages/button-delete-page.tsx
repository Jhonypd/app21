import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { memo, useCallback } from 'react';

interface Props {
  onSubmit?: () => Promise<void> | void;
  disabled: boolean;
  title?: string;
  description?: string;
}

// Componente memoizado para o botão trigger
const DeleteTriggerButton = memo(
  ({ disabled }: { disabled: boolean }) => (
    <Button
      className={`cursor-pointer px-5 uppercase ${
        disabled
          ? ''
          : 'border-red-500 text-red-500 hover:border-red-500 hover:bg-red-500/10'
      }`}
      disabled={disabled}
      variant={'outline'}
    >
      <TrashIcon className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:block">Excluir</span>
    </Button>
  ),
);

DeleteTriggerButton.displayName = 'DeleteTriggerButton';

// Componente memoizado para o conteúdo do dialog
const DeleteDialogContent = memo(
  ({
    title,
    description,
    disabled,
    onSubmit,
  }: {
    title?: string;
    description?: string;
    disabled: boolean;
    onSubmit?: () => Promise<void> | void;
  }) => {
    const handleSubmit = useCallback(async () => {
      await onSubmit?.();
    }, [onSubmit]);

    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-600">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer uppercase">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={disabled}
            className="bg-destructive hover:bg-destructive/50 cursor-pointer text-white uppercase"
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    );
  },
);

DeleteDialogContent.displayName = 'DeleteDialogContent';

const DeleteButton = memo(function DeleteButton({
  onSubmit,
  disabled = false,
  title,
  description = 'Essa ação não poderá ser desfeita',
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DeleteTriggerButton disabled={disabled} />
      </AlertDialogTrigger>
      <DeleteDialogContent
        title={title}
        description={description}
        disabled={disabled}
        onSubmit={onSubmit}
      />
    </AlertDialog>
  );
});

DeleteButton.displayName = 'DeleteButton';

export default DeleteButton;
