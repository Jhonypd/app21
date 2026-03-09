'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WizardBase, WizardStep } from './wizard-base';
import { useCriarSalaMutation } from '@/services/api/salas-api';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useRouter } from 'next/navigation';
import { Switch } from './ui/switch';
import { StepConvidados } from './wizard-steps/step-convidados';
import { FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { TextInput } from './inputs/input-text';
import { PasswordInput } from './inputs/input-password';
import { DoorClosedLocked } from 'lucide-react';

// Schema de validação
const CriarSalaSchema = z
   .object({
      titulo: z
         .string()
         .min(3, 'Título deve ter no mínimo 3 caracteres')
         .max(100, 'Título deve ter no máximo 100 caracteres'),
      salaPrivada: z.boolean(),
      senha: z.string(),
   })
   .refine((data) => !data.salaPrivada || data.senha.trim().length > 0, {
      path: ['senha'],
      message: 'Senha é obrigatória para salas privadas',
   })
   .refine((data) => !data.salaPrivada || data.senha.trim().length >= 6, {
      path: ['senha'],
      message: 'Senha deve ter no mínimo 6 caracteres',
   });

type CriarSalaFormData = z.infer<typeof CriarSalaSchema>;
import Loading from './loading';

interface WizardCriarSalaProps {
   aberto: boolean;
   aoFechar: () => void;
   aoCriar?: (salaId: string) => void;
}

export function WizardCriarSala({
   aberto,
   aoFechar,
   aoCriar,
}: WizardCriarSalaProps) {
   const router = useRouter();

   // Form
   const form = useForm<CriarSalaFormData>({
      resolver: zodResolver(CriarSalaSchema),
      mode: 'onChange',
      defaultValues: {
         titulo: '',
         salaPrivada: false,
         senha: '',
      },
   });

   const salaPrivada = form.watch('salaPrivada');

   // Limpar senha quando desmarcar sala privada
   useEffect(() => {
      if (!salaPrivada) {
         form.setValue('senha', '');
      }
   }, [salaPrivada, form]);

   // Estados dos participantes
   const [participantesSelecionados, setParticipantesSelecionados] = useState<
      Array<{ id: string; nome: string; email: string }>
   >([]);
   const [termoBusca, setTermoBusca] = useState('');
   const [listaPessoas, setListaPessoas] = useState<
      Array<{ id: string; nome: string; email: string }>
   >([]);

   const [criarSala, { isLoading: criandoSala }] = useCriarSalaMutation();
   const [buscarPessoas, { data: dadosPessoas, isLoading: buscandoPessoas }] =
      useLazyPesquisarPorNomeOuEmailQuery();

   // Atualizar lista de pessoas quando a busca retornar
   useEffect(() => {
      if (dadosPessoas?.Sucesso && dadosPessoas.Resultado?.pessoas) {
         setListaPessoas(
            dadosPessoas.Resultado.pessoas.filter((p) => !p.inativo),
         );
      }
   }, [dadosPessoas]);

   // Buscar pessoas conforme digita (com debounce)
   useEffect(() => {
      if (termoBusca.trim().length >= 2) {
         const timer = setTimeout(() => {
            buscarPessoas({ termo: termoBusca });
         }, 500);

         return () => clearTimeout(timer);
      } else {
         setListaPessoas([]);
      }
   }, [termoBusca, buscarPessoas]);

   const handleBuscarPessoas = (termo: string) => {
      setTermoBusca(termo);
   };

   const handleConfirmar = async () => {
      // Validar form antes de submeter
      const isValid = await form.trigger();
      if (!isValid) {
         toastError({
            title: 'Erro de validação',
            description: 'Verifique os campos do formulário',
         });
         return;
      }

      try {
         const formData = form.getValues();
         const participantesIds = participantesSelecionados.map((p) => p.id);

         const resultado = await criarSala({
            titulo: formData.titulo,
            senha:
               formData.salaPrivada && formData.senha
                  ? formData.senha
                  : undefined,
            salaPrivada: formData.salaPrivada,
            participantesIds:
               participantesIds.length > 0 ? participantesIds : undefined,
         }).unwrap();

         if (resultado.Sucesso) {
            toastSuccess({
               title: 'Sala criada!',
               description: `${resultado.Mensagem}`,
            });

            handleFechar();

            if (aoCriar && resultado.Resultado?.id) {
               aoCriar(resultado.Resultado.id);
            } else {
               // Redirecionar para a lista de salas
               router.refresh();
            }
         }
      } catch (error) {
         const apiError = getApiErrorMessage(error);
         toastError({
            description: apiError.Mensagem,
         });
      }
   };

   const handleFechar = () => {
      form.reset();
      setParticipantesSelecionados([]);
      setListaPessoas([]);
      setTermoBusca('');
      aoFechar();
   };

   const steps: WizardStep[] = [
      {
         id: 'informacoes',
         titulo: 'Informações',
         descricao: 'Configure os detalhes da sala',
         conteudo: (
            <FormProvider {...form}>
               <form className="space-y-4">
                  {/* Título */}
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
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Sala Privada */}
                  <FormField
                     control={form.control}
                     name="salaPrivada"
                     render={({ field }) => (
                        <FormItem>
                           <FormControl>
                              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                                 <div className="space-y-0.5">
                                    <label className="text-sm font-medium">
                                       Sala Privada
                                    </label>
                                    <p className="text-xs text-gray-400">
                                       Requer senha para entrar
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

                  {/* Senha (condicional) */}
                  {salaPrivada && (
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
                                    placeholder="Digite uma senha (mínimo 6 caracteres)"
                                    error={!!fieldState.error}
                                    icon={
                                       <DoorClosedLocked className="h-5 w-5 text-gray-400" />
                                    }
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  )}
               </form>
            </FormProvider>
         ),
         validar: () => {
            const values = form.getValues();
            const result = CriarSalaSchema.safeParse(values);
            return result.success;
         },
         obrigatorio: true,
      },
      {
         id: 'participantes',
         titulo: 'Participantes',
         descricao: 'Adicione membros permanentes à sala',
         conteudo: (
            <div className="space-y-4">
               <StepConvidados
                  salaId="" // Não precisa de salaId para criar
                  convidados={participantesSelecionados}
                  aoMudarConvidados={setParticipantesSelecionados}
                  listaPessoas={listaPessoas}
                  argumentoBusca={handleBuscarPessoas}
                  isLoading={buscandoPessoas}
                  tooltipInfo="Adicione pessoas que terão acesso permanente a
            esta sala. Elas poderão participar de todas as
            sessões."
               />
            </div>
         ),
         validar: () => true, // Opcional - pode criar sala sem participantes
         obrigatorio: false,
      },
      {
         id: 'revisao',
         titulo: 'Revisão',
         descricao: 'Confirme os detalhes da sala',
         conteudo: (
            <div className="space-y-4">
               <div className="space-y-3 rounded-xl bg-white/5 p-4">
                  <div>
                     <p className="text-xs text-gray-400">Título</p>
                     <p className="text-sm font-medium">
                        {form.watch('titulo') || 'Não informado'}
                     </p>
                  </div>

                  <div>
                     <p className="text-xs text-gray-400">Tipo</p>
                     <p className="text-sm font-medium">
                        {form.watch('salaPrivada')
                           ? '🔒 Privada (com senha)'
                           : '🌐 Pública'}
                     </p>
                  </div>

                  <div>
                     <p className="text-xs text-gray-400">
                        Participantes Permanentes
                     </p>
                     <p className="text-sm font-medium">
                        {participantesSelecionados.length === 0
                           ? 'Nenhum participante adicionado'
                           : `${participantesSelecionados.length} ${participantesSelecionados.length === 1 ? 'pessoa' : 'pessoas'}`}
                     </p>
                     {participantesSelecionados.length > 0 && (
                        <ul className="mt-2 space-y-1">
                           {participantesSelecionados.map((p) => (
                              <li
                                 key={p.id}
                                 className="text-xs text-gray-400"
                              >
                                 • {p.nome}
                              </li>
                           ))}
                        </ul>
                     )}
                  </div>
               </div>

               <p className="text-xs text-gray-400">
                  💡 Você será adicionado automaticamente como dono da sala.
               </p>
            </div>
         ),
         obrigatorio: false,
      },
   ];
   return (
      <>
         {criandoSala && (
            <Loading
               active
               type="transaction"
            />
         )}
         <WizardBase
            aberto={aberto}
            aoFechar={handleFechar}
            aoConfirmar={handleConfirmar}
            titulo="Criar Nova Sala"
            steps={steps}
            textoBotaoFinal="Criar Sala"
            permitirPularSteps={false}
         />
      </>
   );
}
