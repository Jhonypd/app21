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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";

interface Props {
  onSubmit?: () => Promise<void> | void;
  disabled: boolean;
  title?: string;
  description?: string;
}

const DeleteButton = ({
  onSubmit,
  disabled = false,
  title,
  description = "Essa ação não poderá ser desfeita",
}: Props) => {
  const handleSubmit = async () => {
    await onSubmit?.();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className={`cursor-pointer px-5 uppercase ${disabled ? "" : "border-red-500 text-primary hover:border-red-500 hover:bg-red-500/10 hover:text-primary"}`}
          disabled={disabled}
          variant={"outline"}
        >
          <TrashIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:block">Excluir</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={disabled}
            className="bg-destructive text-white hover:bg-destructive/50"
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
