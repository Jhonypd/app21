import {
  toastError,
  toastSuccess,
} from '@/components/custom-toast';

export function copiarParaAreaTransferencia(
  texto: string,
): boolean {
  try {
    // Método alternativo usando textarea temporário
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, 99999); // Para dispositivos móveis

    const sucesso = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (sucesso) {
      toastSuccess({
        description:
          'Texto copiado para a área de transferência.',
      });
      return true;
    }

    return false;
  } catch (erro) {
    console.error('Erro ao copiar:', erro);
    toastError({ description: 'Não foi possível copiar' });
    return false;
  }
}
