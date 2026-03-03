import { useEffect, useState } from 'react';
import { ModalBase } from './modal-base';
import Loading from '../loading';
import { TextInput } from '../inputs/input-text';
import { PasswordInput } from '../inputs/input-password';
import { ButtonCustom } from '../button-custom';

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

      // <Dialog
      //    open={isOpen}
      //    onOpenChange={setIsOpen}
      // >
      //    <DialogTrigger asChild>
      //       <ButtonCustom
      //          icon={<LogIn className="h-5 w-5" />}
      //          text="Entrar na sala"
      //          variant="default"
      //       />
      //    </DialogTrigger>

      //    <DialogContent className="bg-accent border-border sm:max-w-[425px]">
      //       <DialogHeader>
      //          <DialogTitle className="text-foreground flex items-center gap-2">
      //             <Users className="h-5 w-5" />
      //             Entrar em Sala Existente
      //          </DialogTitle>
      //          <DialogDescription className="text-muted-foreground">
      //             Digite o ID da sala e seu nome para participar das
      //             estimativas.
      //          </DialogDescription>
      //       </DialogHeader>

      //       <form
      //          onSubmit={handleSubmit}
      //          className="space-y-6 pt-4"
      //       >
      //          <div className="space-y-2">
      //             <Label
      //                htmlFor="roomId"
      //                className="text-foreground"
      //             >
      //                ID da Sala
      //             </Label>
      //             <Input
      //                id="salaId"
      //                placeholder="Ex: ABC123"
      //                value={salaId}
      //                onChange={(e) => setSalaId(e.target.value.toUpperCase())}
      //                className="bg-background border-border font-mono"
      //                required
      //             />
      //          </div>

      //          <div className="space-y-2">
      //             <Label
      //                htmlFor="userName"
      //                className="text-foreground"
      //             >
      //                Seu Nome
      //             </Label>
      //             <Input
      //                id="userName"
      //                placeholder="Ex: João Silva"
      //                value={userName}
      //                onChange={(e) => setUserName(e.target.value)}
      //                className="bg-background border-border"
      //                required
      //             />
      //          </div>

      //          {needsPassword && (
      //             <div className="space-y-2">
      //                <Label
      //                   htmlFor="password"
      //                   className="text-foreground"
      //                >
      //                   Senha da Sala
      //                </Label>
      //                <Input
      //                   id="password"
      //                   type="password"
      //                   placeholder="Digite a senha"
      //                   value={password}
      //                   onChange={(e) => setPassword(e.target.value)}
      //                   className="bg-background border-border"
      //                   required={needsPassword}
      //                />
      //             </div>
      //          )}

      //          <div className="flex w-full justify-end gap-3 pt-4">
      //             <ButtonCustom
      //                type="button"
      //                variant="outline"
      //                text="Cancelar"
      //                onClick={() => setIsOpen(false)}
      //             />

      //             <ButtonCustom
      //                text="Entrar na Sala"
      //                variant="default"
      //                type="submit"
      //                disabled={!salaId.trim() || !userName.trim()}
      //             />
      //          </div>
      //       </form>
      //    </DialogContent>
      // </Dialog>
   );
};
