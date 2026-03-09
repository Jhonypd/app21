'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Settings, Users, UserPlus, InfoIcon } from 'lucide-react';
import { FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { TabsCustom } from './tabs';
import { TextInput } from './inputs/input-text';
import { PasswordInput } from './inputs/input-password';
import { Switch } from './ui/switch';
import type { DadosPessoaResumo, SalaParaEdicao } from '@/services/types';
import { useAlterarRoleParticipanteMutation } from '@/services/api/salas-api';
import { CardParticipante } from './sala/card-participante';
import { ModalAdicionarParticipanteOuVisitante } from './sala/modal-adicionar-visitante';
import { toastError, toastSuccess } from './custom-toast';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/api-error';
import Loading from './loading';
import { ModalBase } from './modal-base';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import DialogConfirmacao from './dialog-confirmacao';

// Schema de validação
const EditarSalaSchema = z
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

type EditarSalaFormData = z.infer<typeof EditarSalaSchema>;

// Tipo para mudanças pendentes
type ParticipanteLocal = SalaParaEdicao['participantes'][0];

// Componente interno para Aba de Participantes
interface AbaParticipantesProps {
   participantes: ParticipanteLocal[];
   participantesOriginais: ParticipanteLocal[]; // Para verificar se já existia no banco
   onAlterarParticipantes: (participantes: ParticipanteLocal[]) => void;
   meuRole?: number | null;
}

function AbaParticipantes({
   participantes,
   participantesOriginais,
   onAlterarParticipantes,
   meuRole,
}: AbaParticipantesProps) {
   const [participanteRemover, setParticipanteRemover] = useState<{
      id: string;
      nome: string;
   } | null>(null);
   const [dialogAdicionarAberto, setDialogAdicionarAberto] = useState(false);
   const [termoBusca, setTermoBusca] = useState('');
   const [pessoasEncontradas, setPessoasEncontradas] = useState<
      DadosPessoaResumo[]
   >([]);
   const [buscarPessoas, { isLoading: buscandoPessoas }] =
      useLazyPesquisarPorNomeOuEmailQuery();

   // Permissões
   const podeAdicionar = meuRole === 0 || meuRole === 1; // Dono ou Admin

   const handleRemoverParticipante = () => {
      if (!participanteRemover) return;

      const novosParticipantes = participantes.filter(
         (p) => p.id !== participanteRemover.id,
      );
      onAlterarParticipantes(novosParticipantes);
      setParticipanteRemover(null);
   };

   const handleAlterarRole = (pessoa_id: string, novoRole: 1 | 2) => {
      const novosParticipantes = participantes.map((p) =>
         p.id === pessoa_id ? { ...p, role: novoRole } : p,
      );
      onAlterarParticipantes(novosParticipantes);
   };

   const handleAbrirDialogAdicionar = () => {
      setTermoBusca('');
      setPessoasEncontradas([]);
      setDialogAdicionarAberto(true);
   };

   const handleFecharDialogAdicionar = () => {
      setTermoBusca('');
      setPessoasEncontradas([]);
      setDialogAdicionarAberto(false);
   };

   const handleBuscarPessoas = async (termo: string) => {
      setTermoBusca(termo);

      if (termo.trim().length < 2) {
         setPessoasEncontradas([]);
         return;
      }

      try {
         const resultado = await buscarPessoas({ termo }).unwrap();
         const pessoas = resultado.Resultado?.pessoas || [];
         const idsExistentes = new Set(participantes.map((p) => p.id));

         setPessoasEncontradas(
            pessoas.filter((pessoa) => !idsExistentes.has(pessoa.id)),
         );
      } catch {
         setPessoasEncontradas([]);
      }
   };

   const handleAdicionarParticipante = async (pessoaId: string) => {
      const pessoa = pessoasEncontradas.find((item) => item.id === pessoaId);
      if (!pessoa) return;

      const novoParticipante: ParticipanteLocal = {
         id: pessoa.id,
         nome: pessoa.nome,
         role: 2,
         inativo: false,
      };

      onAlterarParticipantes([...participantes, novoParticipante]);
      handleFecharDialogAdicionar();
   };

   return (
      <>
         <div className="h-full space-y-4">
            {/* Header com contador */}
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-sm font-medium">
                     Participantes Permanentes
                  </h3>
                  <p className="text-xs text-gray-400">
                     {participantes.length} participante
                     {participantes.length !== 1 ? 's' : ''}
                  </p>
               </div>

               {podeAdicionar && (
                  <button
                     onClick={handleAbrirDialogAdicionar}
                     className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm text-white transition-all hover:from-purple-700 hover:to-pink-700 active:scale-95"
                  >
                     <UserPlus className="h-4 w-4" />
                     Adicionar
                  </button>
               )}
            </div>

            {/* Lista de Participantes */}
            <div className="h-48 max-h-96 space-y-2 overflow-y-auto py-3 sm:min-h-52">
               {participantes.map((participante) => {
                  const jaExistia = participantesOriginais.some(
                     (p) => p.id === participante.id,
                  );

                  return (
                     <CardParticipante
                        key={participante.id}
                        participante={participante}
                        jaExistia={jaExistia}
                        meuRole={meuRole}
                        onAlterarRole={handleAlterarRole}
                        onRemover={(participante) =>
                           setParticipanteRemover(participante)
                        }
                     />
                  );
               })}
            </div>
         </div>

         {/* Modal para Adicionar Participante */}
         <ModalAdicionarParticipanteOuVisitante
            titulo="Adicionar participante"
            open={dialogAdicionarAberto}
            onOpenChange={(open) => {
               if (!open) {
                  handleFecharDialogAdicionar();
               }
            }}
            termoBusca={termoBusca}
            onBuscar={handleBuscarPessoas}
            pessoas={pessoasEncontradas}
            loading={buscandoPessoas}
            onAdicionar={handleAdicionarParticipante}
         />

         <DialogConfirmacao
            titulo="Remover Participante"
            btnConfirmar="Remover"
            btnCancelar="Cancelar"
            textoPadrao={`Tem certeza que deseja remover ${participanteRemover?.nome} da sala? Esta ação não pode ser desfeita.`}
            dialogAberto={!!participanteRemover}
            setDialogAberto={(open) => {
               if (!open) {
                  setParticipanteRemover(null);
               }
            }}
            tipo="destrutivo"
            handleSubmit={handleRemoverParticipante}
            dialogLoading={false}
         />
      </>
   );
}

interface DialogEditarSalaProps {
   aberto: boolean;
   aoFechar: () => void;
   dadosSala: SalaParaEdicao | null;
   meuRole?: number | null; // 0=Dono, 1=Admin, 2=Membro
   aoSalvar: (dados: {
      titulo: string;
      senha?: string;
      participantesAdicionarIds?: string[];
      participantesRemoverIds?: string[];
   }) => Promise<void>;
}

export function DialogEditarSala({
   aberto,
   aoFechar,
   dadosSala,
   meuRole,
   aoSalvar,
}: DialogEditarSalaProps) {
   const [salvando, setSalvando] = useState(false);
   const [abaAtiva, setAbaAtiva] = useState('geral');
   const [participantesLocais, setParticipantesLocais] = useState<
      ParticipanteLocal[]
   >([]);
   const [salvandoParticipantes, setSalvandoParticipantes] = useState(false);
   const [dialogConfirmarFechamento, setDialogConfirmarFechamento] =
      useState(false);

   // Hooks
   const { usuario } = useAuth();
   // const [adicionarParticipante] = useAdicionarParticipanteMutation(); // depreciado - use alterarSala
   // const [removerParticipante] = useRemoverParticipanteMutation(); // depreciado - use alterarSala
   const [alterarRoleParticipante] = useAlterarRoleParticipanteMutation();

   // Permissões baseadas na matriz
   const podeEditarTitulo = meuRole === 0 || meuRole === 1; // Dono ou Admin
   const podeEditarSenha = meuRole === 0; // Apenas Dono

   // Form
   const form = useForm<EditarSalaFormData>({
      resolver: zodResolver(EditarSalaSchema),
      mode: 'onChange',
      defaultValues: {
         titulo: '',
         salaPrivada: false,
         alterarSenha: false,
         senha: '',
      },
   });

   const salaPrivada = form.watch('salaPrivada');
   const alterarSenha = form.watch('alterarSenha');

   // Limpar senha quando desmarcar alterar senha
   useEffect(() => {
      if (!alterarSenha) {
         form.setValue('senha', '');
      }
   }, [alterarSenha, form]);

   // Popular form e participantes quando dados chegarem
   useEffect(() => {
      if (aberto && dadosSala) {
         form.reset({
            titulo: dadosSala.titulo,
            salaPrivada: dadosSala.salaPrivada,
            alterarSenha: false,
            senha: '',
         });
         setParticipantesLocais(dadosSala.participantes);
         setAbaAtiva('geral');
      }
   }, [aberto, dadosSala, form]);

   // Verificar se há mudanças não salvas
   const temMudancasParticipantes = () => {
      if (!dadosSala) return false;

      // Verificar se quantidade mudou
      if (participantesLocais.length !== dadosSala.participantes.length) {
         return true;
      }

      // Verificar se algum participante mudou de role
      const origMap = new Map(dadosSala.participantes.map((p) => [p.id, p]));
      for (const local of participantesLocais) {
         const orig = origMap.get(local.id);
         if (!orig || orig.role !== local.role) {
            return true;
         }
      }

      return false;
   };

   const temMudancasGerais = () => {
      if (!dadosSala) return false;
      const formData = form.getValues();
      return (
         formData.titulo !== dadosSala.titulo ||
         (formData.alterarSenha && formData.senha.trim().length > 0)
      );
   };

   const temMudancasNaoSalvas =
      temMudancasParticipantes() || temMudancasGerais();

   const handleSalvar = async () => {
      if (!dadosSala || !usuario?.id) {
         toastError({
            title: 'Erro',
            description: 'Dados da sala ou usuário não disponíveis',
         });
         return;
      }

      // Validar permissões
      if (!podeEditarTitulo && !podeEditarSenha) {
         toastError({
            title: 'Sem permissão',
            description: 'Você não tem permissão para editar esta sala',
         });
         return;
      }

      const isValid = await form.trigger();
      if (!isValid) {
         toastError({
            title: 'Erro de validação',
            description: 'Verifique os campos do formulário',
         });
         return;
      }

      setSalvando(true);
      setSalvandoParticipantes(true);

      try {
         // ========================================
         // PARTE 1: PERSISTIR MUDANÇAS DE PARTICIPANTES
         // ========================================

         // Criar maps para comparação rápida
         const origMap = new Map(dadosSala.participantes.map((p) => [p.id, p]));
         const localMap = new Map(participantesLocais.map((p) => [p.id, p]));

         // Calcular diferenças
         const toRemove = dadosSala.participantes.filter(
            (p) => !localMap.has(p.id),
         );
         const toAdd = participantesLocais.filter((p) => !origMap.has(p.id));
         const toUpdate = participantesLocais.filter((p) => {
            const orig = origMap.get(p.id);
            return orig && orig.role !== p.role;
         });

         // VALIDAÇÃO FRONTEND: Não permitir remover o dono
         const dono = dadosSala.participantes.find((p) => p.role === 0);
         if (dono && toRemove.some((r) => r.id === dono.id)) {
            toastError({
               title: 'Operação não permitida',
               description: 'Não é permitido remover o dono da sala',
            });
            setSalvando(false);
            setSalvandoParticipantes(false);
            return;
         }

         // VALIDAÇÃO FRONTEND: Admin não pode alterar role do dono
         if (meuRole === 1 && dono && toUpdate.some((u) => u.id === dono.id)) {
            toastError({
               title: 'Operação não permitida',
               description: 'Administradores não podem alterar o role do dono',
            });
            setSalvando(false);
            setSalvandoParticipantes(false);
            return;
         }

         // ========================================
         // PARTE 1: PERSISTIR PARTICIPANTES + DADOS GERAIS EM UMA ÚNICA CHAMADA
         // ========================================

         const formData = form.getValues();
         const tituloMudou = formData.titulo !== dadosSala.titulo;
         const senhaMudou =
            formData.alterarSenha &&
            formData.salaPrivada &&
            formData.senha.trim().length > 0;

         const temMudancasParticipante =
            toAdd.length > 0 || toRemove.length > 0;

         if (tituloMudou || senhaMudou || temMudancasParticipante) {
            const dados: {
               titulo: string;
               senha?: string;
               participantesAdicionarIds?: string[];
               participantesRemoverIds?: string[];
            } = {
               titulo: formData.titulo,
               ...(temMudancasParticipante && {
                  participantesAdicionarIds: toAdd.map((p) => p.id),
                  participantesRemoverIds: toRemove.map((p) => p.id),
               }),
            };

            if (senhaMudou) {
               dados.senha = formData.senha;
            }

            await aoSalvar(dados);
         }

         setSalvandoParticipantes(false);

         // ========================================
         // PARTE 2: ALTERAÇÕES DE ROLE (separado, pois não está no alterarSala)
         // ========================================

         if (toUpdate.length > 0) {
            try {
               await Promise.all(
                  toUpdate.map((participante) =>
                     alterarRoleParticipante({
                        sala_id: dadosSala.id,
                        pessoa_id: participante.id,
                        role: participante.role as 1 | 2,
                     }).unwrap(),
                  ),
               );
            } catch (error) {
               const apiError = getApiErrorMessage(error);
               toastError({
                  title: 'Erro ao alterar roles',
                  description:
                     apiError.Detalhe ||
                     'Falha ao alterar role de um ou mais participantes',
               });
               setSalvando(false);
               setSalvandoParticipantes(false);
               return;
            }
         }

         // SUCESSO TOTAL
         toastSuccess({
            title: 'Sala atualizada!',
            description: 'Todas as alterações foram salvas com sucesso',
         });

         handleFechar(true); // Força fechamento sem verificar mudanças
      } catch (error) {
         const apiError = getApiErrorMessage(error);
         toastError({
            title: apiError.Mensagem || 'Erro ao salvar',
            description:
               apiError.Detalhe || 'Ocorreu um erro ao salvar as alterações',
         });
      } finally {
         setSalvando(false);
         setSalvandoParticipantes(false);
      }
   };

   const handleFechar = (forcarFechamento = false) => {
      // Se tiver mudanças não salvas E não for forçado, mostrar dialog de confirmação
      if (temMudancasNaoSalvas && !forcarFechamento) {
         setDialogConfirmarFechamento(true);
         return;
      }

      form.reset();
      aoFechar();
   };

   const handleConfirmarFechamento = () => {
      setDialogConfirmarFechamento(false);
      form.reset();
      aoFechar();
   };

   return (
      <>
         {(salvando || salvandoParticipantes) && (
            <Loading
               active
               type="transaction"
            />
         )}
         <ModalBase
            open={aberto}
            onOpenChange={(open) => {
               if (!open) {
                  handleFechar(false);
               }
            }}
            titulo="Editar Sala"
            maxWidth="2xl"
            botoesAcoes={
               <>
                  <button
                     onClick={() => handleFechar(false)}
                     disabled={salvando}
                     className="flex-1 rounded-xl bg-white/5 py-3 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     Cancelar
                  </button>
                  <button
                     onClick={handleSalvar}
                     disabled={
                        salvando || (!podeEditarTitulo && !podeEditarSenha)
                     }
                     className={`flex-1 rounded-xl py-3 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        temMudancasNaoSalvas
                           ? 'animate-pulse bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                           : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                     }`}
                  >
                     <span className="flex items-center justify-center gap-2">
                        Salvar
                        {temMudancasNaoSalvas && (
                           <span className="flex h-2 w-2 items-center justify-center rounded-full bg-white">
                              <span className="h-2 w-2 animate-ping rounded-full bg-white opacity-75"></span>
                           </span>
                        )}
                     </span>
                  </button>
               </>
            }
         >
            <div className="flex max-h-[70vh] flex-col overflow-hidden">
               <p className="mt-2 flex items-center justify-between px-4 text-sm text-gray-400">
                  Gerencie as configurações da sala{' '}
                  <Tooltip>
                     <TooltipTrigger>
                        <InfoIcon />
                     </TooltipTrigger>
                     <TooltipContent className="bg-accent">
                        <p className="w-60 text-xs text-purple-200 sm:w-3xs">
                           <strong>ℹ️ Importante:</strong> As alterações de
                           participantes serão salvas apenas quando você clicar
                           em &quot;Salvar&quot; no final.
                        </p>
                     </TooltipContent>
                  </Tooltip>
               </p>

               {!dadosSala ? (
                  <div className="flex items-center justify-center p-8">
                     <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                  </div>
               ) : (
                  <FormProvider {...form}>
                     <div className="flex min-h-0 flex-1 flex-col">
                        <TabsCustom
                           value={abaAtiva}
                           onValueChange={setAbaAtiva}
                           className="flex min-h-0 flex-1 flex-col"
                           tabsListClassName="bg-transparent grid h-fit w-full grid-cols-2 items-center gap-2 "
                           tabsTrigger={[
                              {
                                 value: 'geral',
                                 label: 'Geral',
                                 icon: <Settings className="h-4 w-4" />,
                              },
                              {
                                 value: 'participantes',
                                 label: 'Participantes',
                                 icon: <Users className="h-4 w-4" />,
                              },
                           ]}
                           tabsContent={[
                              {
                                 value: 'geral',
                                 content: (
                                    <div className="space-y-4 overflow-y-auto p-6">
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
                                                      disabled={
                                                         !podeEditarTitulo
                                                      }
                                                   />
                                                </FormControl>
                                                <FormMessage />
                                                {!podeEditarTitulo && (
                                                   <p className="text-xs text-gray-500">
                                                      Apenas dono e
                                                      administradores podem
                                                      alterar o título
                                                   </p>
                                                )}
                                             </FormItem>
                                          )}
                                       />

                                       {/* Status Sala Privada (apenas visualização) */}
                                       <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                                          <div className="space-y-0.5">
                                             <label className="text-sm font-medium">
                                                Sala Privada
                                             </label>
                                             <p className="text-xs text-gray-400">
                                                {salaPrivada
                                                   ? 'Esta sala possui senha'
                                                   : 'Esta sala é pública'}
                                             </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <Lock className="h-4 w-4 text-gray-400" />
                                             <span className="text-sm text-gray-400">
                                                {salaPrivada
                                                   ? 'Com senha'
                                                   : 'Sem senha'}
                                             </span>
                                          </div>
                                       </div>

                                       {/* Alterar Senha (apenas se sala privada e dono) */}
                                       {salaPrivada && podeEditarSenha && (
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
                                                                  Defina uma
                                                                  nova senha
                                                                  para a sala
                                                               </p>
                                                            </div>
                                                            <Switch
                                                               checked={
                                                                  field.value
                                                               }
                                                               onCheckedChange={
                                                                  field.onChange
                                                               }
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
                                                   render={({
                                                      field,
                                                      fieldState,
                                                   }) => (
                                                      <FormItem>
                                                         <FormControl>
                                                            <PasswordInput
                                                               value={
                                                                  field.value
                                                               }
                                                               onChange={
                                                                  field.onChange
                                                               }
                                                               name={field.name}
                                                               placeholder="Digite a nova senha (mínimo 6 caracteres)"
                                                               error={
                                                                  !!fieldState.error
                                                               }
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
                                             Apenas o dono pode alterar a senha
                                             da sala
                                          </p>
                                       )}
                                    </div>
                                 ),
                              },
                              {
                                 value: 'participantes',
                                 content: (
                                    <div className="h-full overflow-y-auto p-6">
                                       <AbaParticipantes
                                          participantes={participantesLocais}
                                          participantesOriginais={
                                             dadosSala?.participantes || []
                                          }
                                          onAlterarParticipantes={
                                             setParticipantesLocais
                                          }
                                          meuRole={meuRole}
                                       />
                                    </div>
                                 ),
                              },
                           ]}
                        />
                     </div>
                  </FormProvider>
               )}
            </div>
         </ModalBase>

         {/* Dialog de Confirmação ao Fechar com Mudanças */}
         <DialogConfirmacao
            titulo="Alterações não salvas"
            btnConfirmar="Sim"
            btnCancelar="não"
            textoPadrao="Você tem alterações não salvas. Deseja realmente sair sem
                     salvar?"
            dialogAberto={dialogConfirmarFechamento}
            setDialogAberto={setDialogConfirmarFechamento}
            tipo="cancelamento"
            handleSubmit={handleConfirmarFechamento}
            dialogLoading={salvando || salvandoParticipantes}
         />
      </>
   );
}
