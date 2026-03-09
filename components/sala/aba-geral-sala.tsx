import { LockIcon } from 'lucide-react';
import { TextInput } from '../inputs/input-text';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { type UseFormReturn } from 'react-hook-form';
import { Switch } from '../ui/switch';
import { PasswordInput } from '../inputs/input-password';
import { BsFillHouseLockFill, BsGlobeAmericas } from 'react-icons/bs';
import z from 'zod';
// Schema de validação
export const EditarSalaSchema = z
   .object({
      titulo: z
         .string()
         .min(3, 'Título deve ter no mínimo 3 caracteres')
         .max(100, 'Título deve ter no máximo 100 caracteres'),
      salaPrivada: z.boolean(),
      alterarSenha: z.boolean(),
      senha: z.string(),
   })
   .refine(
      (data) =>
         !data.alterarSenha ||
         !data.salaPrivada ||
         data.senha.trim().length >= 6,
      {
         path: ['senha'],
         message: 'Senha deve ter no mínimo 6 caracteres',
      },
   );

export type EditarSalaFormData = z.infer<typeof EditarSalaSchema>;
interface AbaGeralSalaProps {
   form: UseFormReturn<EditarSalaFormData>;
   salaPrivada: boolean;
   alterarSenha: boolean;
   podeEditarTitulo: boolean;
   podeEditarSenha: boolean;
}

export const AbaGeralSala = ({
   form,
   salaPrivada,
   alterarSenha,
   podeEditarTitulo,
   podeEditarSenha,
}: AbaGeralSalaProps) => {
   return (
      <div className="space-y-4 overflow-y-auto p-6">
         <FormField
            control={form.control}
            name="titulo"
            render={({ field, fieldState }) => (
               <FormItem>
                  <FormControl>
                     <TextInput
                        label="Título da Sala"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Ex: Sprint Planning - Time Alpha"
                        error={!!fieldState.error}
                        disabled={!podeEditarTitulo}
                     />
                  </FormControl>
                  <FormMessage />
                  {!podeEditarTitulo && (
                     <p className="text-xs text-gray-500">
                        Apenas dono e administradores podem alterar o título
                     </p>
                  )}
               </FormItem>
            )}
         />

         <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2 space-y-0.5">
               <label className="text-sm font-medium">Privacidade</label>
               <p className="text-center text-sm text-gray-400">
                  {salaPrivada ? <BsFillHouseLockFill /> : <BsGlobeAmericas />}
               </p>
            </div>
            <div className="flex items-center gap-2">
               <LockIcon className="h-4 w-4 text-gray-400" />
               <span className="text-sm text-gray-400">
                  {salaPrivada ? 'Com senha' : 'Sem senha'}
               </span>
            </div>
         </div>

         {podeEditarSenha && (
            <div className="space-y-4">
               <FormField
                  control={form.control}
                  name="alterarSenha"
                  render={({ field }) => (
                     <FormItem>
                        <FormControl>
                           <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                              <div className="space-y-0.5">
                                 <label className="text-sm font-medium">
                                    Alterar Senha
                                 </label>
                                 <p className="text-xs text-gray-400">
                                    Defina uma nova senha para a sala
                                 </p>
                              </div>
                              <Switch
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                              />
                           </div>
                        </FormControl>
                     </FormItem>
                  )}
               />

               {alterarSenha && (
                  <FormField
                     control={form.control}
                     name="senha"
                     render={({ field, fieldState }) => (
                        <FormItem>
                           <FormControl>
                              <PasswordInput
                                 value={field.value}
                                 onChange={field.onChange}
                                 name={field.name}
                                 placeholder="Digite a nova senha (mínimo 6 caracteres)"
                                 error={!!fieldState.error}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               )}
            </div>
         )}

         {!podeEditarSenha && salaPrivada && (
            <p className="text-xs text-gray-500">
               Apenas o dono pode alterar a senha da sala
            </p>
         )}
      </div>
   );
};
