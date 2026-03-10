import { useEffect, useState } from 'react';
import Loading from '../loading';
import { TextInput } from '../inputs/input-text';
import { PasswordInput } from '../inputs/input-password';
import { ButtonCustom } from '../button-custom';
import { ModalBase } from '../modal-base';

interface ModalEntrarSalaProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onEntrar: (codigo: string, senha?: string) => Promise<boolean>;
   codigoInicial?: string;
   bloquearCodigo?: boolean;
   loading?: boolean;
}

export const ModalEntrarSala = ({
   open,
   onOpenChange,
   onEntrar,
   codigoInicial,
   bloquearCodigo = false,
   loading,
}: ModalEntrarSalaProps) => {
   const [codigo, setCodigo] = useState(codigoInicial || '');
   const [senha, setSenha] = useState('');

   useEffect(() => {
      if (!open) {
         setCodigo(codigoInicial || '');
         setSenha('');
         return;
      }

      if (codigoInicial) {
         setCodigo(codigoInicial);
      }
   }, [open, codigoInicial]);

   const handleClose = () => {
      onOpenChange(false);
   };

   const handleEntrar = async () => {
      const entrou = await onEntrar(codigo.trim(), senha.trim() || undefined);
      if (entrou) {
         handleClose();
      }
   };

   const podeEntrar =
      codigo.trim().length > 0 && (!bloquearCodigo || senha.trim().length > 0);

   return (
      <>
         {loading && (
            <Loading
               active
               type="transaction"
            />
         )}
         <ModalBase
            titulo="Entrar na Sala"
            onOpenChange={handleClose}
            open={open}
            maxWidth="md"
            botoesAcoes={
               <>
                  <ButtonCustom
                     type="button"
                     variant="outline"
                     onClick={handleClose}
                     className="w-full uppercase"
                  >
                     Cancelar
                  </ButtonCustom>
                  <ButtonCustom
                     type="button"
                     onClick={handleEntrar}
                     disabled={!podeEntrar || loading}
                     className="w-full uppercase"
                  >
                     Entrar na Sala
                  </ButtonCustom>
               </>
            }
         >
            <TextInput
               value={codigo}
               onChange={(event) => setCodigo(event.target.value.toUpperCase())}
               label="Código"
               disabled={bloquearCodigo}
            />

            <PasswordInput
               value={senha}
               onChange={(event) => setSenha(event.target.value)}
               label="Senha"
            />
         </ModalBase>
      </>
   );
};
