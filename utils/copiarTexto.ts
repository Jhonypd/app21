import { toastError, toastSuccess } from '@/components/custom-toast';

export function copiarParaAreaTransferencia(
   textoCopiado: string,
   textoToast?: string,
): boolean {
   const sucessoMsg =
      textoToast || 'Texto copiado para a área de transferência.';

   const mostrarSucesso = () => {
      toastSuccess({ description: sucessoMsg });
      return true;
   };

   const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = textoCopiado;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);

      textarea.select();
      textarea.setSelectionRange(0, 99999);

      const sucesso = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (sucesso) {
         return mostrarSucesso();
      }

      toastError({ description: 'Não foi possível copiar' });
      return false;
   };

   try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
         navigator.clipboard
            .writeText(textoCopiado)
            .then(mostrarSucesso)
            .catch(() => fallbackCopy());

         return true;
      }

      return fallbackCopy();
   } catch (erro) {
      console.error('Erro ao copiar:', erro);
      toastError({ description: 'Não foi possível copiar' });
      return false;
   }
}
