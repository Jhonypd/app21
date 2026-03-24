import { MdContentCopy } from 'react-icons/md';

import { ModalBase } from '../modal-base';
import { ButtonCustom } from '../button-custom';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { copiarParaAreaTransferencia } from '@/utils/copiarTexto';

interface CompartilharSalaProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   tituloSala: string;
   codigoSala: string;
   linkCompartilhamento: string;
}

const ModalCompartilhar = ({
   open,
   onOpenChange,
   tituloSala,
   codigoSala,
   linkCompartilhamento,
}: CompartilharSalaProps) => {
   const mensagemConvite = `Convite para a sala "${tituloSala}"

Acesse: ${linkCompartilhamento}
Código de acesso: ${codigoSala}`;

   const handleCopiar = (texto: string, mensagem?: string) => () => {
      copiarParaAreaTransferencia(texto, mensagem);
   };

   return (
      <ModalBase
         open={open}
         onOpenChange={onOpenChange}
         titulo="Compartilhar sala"
         maxWidth="md"
         botoesAcoes={
            <ButtonCustom
               variant="secondary"
               onClick={() => onOpenChange(false)}
            >
               Fechar
            </ButtonCustom>
         }
      >
         <div className="space-y-4 px-2 py-4 sm:px-4">
            <p className="text-muted-foreground text-sm">
               Envie o link ou o código abaixo para convidar outras pessoas para
               a sala <span className="font-semibold">{tituloSala}</span>.
            </p>

            <div className="space-y-2">
               <span className="text-muted-foreground text-xs font-semibold uppercase">
                  Código da sala
               </span>
               <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                     readOnly
                     value={codigoSala}
                     className="border-border/60 bg-input/60 text-card-foreground h-11 flex-1 rounded-2xl border text-center text-lg font-semibold tracking-[0.3em]"
                  />
                  <ButtonCustom
                     type="button"
                     variant="secondary"
                     className="flex items-center gap-2 rounded-2xl px-6 text-sm"
                     onClick={handleCopiar(
                        codigoSala,
                        'Código copiado para a área de transferência!',
                     )}
                  >
                     <MdContentCopy className="h-4 w-4" />
                     Copiar código
                  </ButtonCustom>
               </div>
            </div>

            <div className="space-y-2">
               <span className="text-muted-foreground text-xs font-semibold uppercase">
                  Mensagem
               </span>
               <div className="flex flex-col gap-2 sm:flex-row">
                  <Textarea
                     readOnly
                     value={mensagemConvite}
                     rows={3}
                     className="border-border/60 bg-input/60 text-card-foreground flex-1 rounded-2xl border text-sm"
                  />
                  <ButtonCustom
                     type="button"
                     variant="secondary"
                     className="flex items-center gap-2 rounded-2xl px-6 text-sm"
                     onClick={handleCopiar(
                        mensagemConvite,
                        'Mensagem de convite copiada!',
                     )}
                  >
                     <MdContentCopy className="h-4 w-4" />
                     Copiar mensagem
                  </ButtonCustom>
               </div>
            </div>
         </div>
      </ModalBase>
   );
};

export default ModalCompartilhar;
