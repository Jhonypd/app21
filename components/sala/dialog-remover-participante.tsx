import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface DialogRemoverParticipanteProps {
  participante: { id: string; nome: string } | null;
  onFechar: () => void;
  onConfirmar: () => void;
}

export function DialogRemoverParticipante({
  participante,
  onFechar,
  onConfirmar,
}: DialogRemoverParticipanteProps) {
  return (
    <AlertDialog
      open={!!participante}
      onOpenChange={(open) => !open && onFechar()}
    >
      <AlertDialogContent className="border-white/20 bg-slate-900 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">
            Remover Participante
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-gray-400">
            Tem certeza que deseja remover{' '}
            <strong className="text-white">
              {participante?.nome}
            </strong>{' '}
            da sala? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmar}
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
