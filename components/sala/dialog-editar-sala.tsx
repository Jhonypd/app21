'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, Users, InfoIcon } from 'lucide-react';
import { TabsCustom } from '../tabs';
import type { SalaParaEdicao } from '@/services/types';
import { useAlterarRoleParticipanteMutation } from '@/services/api/salas-api';
import { toastError, toastSuccess } from '../custom-toast';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/api-error';
import Loading from '../loading';
import { ModalBase } from '../modal-base';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import DialogConfirmacao from '../dialog-confirmacao';
import { AbaParticipantes } from './aba-participantes-sala';
import {
   AbaGeralSala,
   EditarSalaSchema,
   type EditarSalaFormData,
} from './aba-geral-sala';
import { ButtonCustom } from '../button-custom';
import { ScrollArea } from '../ui/scroll-area';

// Tipo para mudanças pendentes
type ParticipanteLocal = SalaParaEdicao['participantes'][0];

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

function ResumoConfiguracoesSala() {
   return (
      <p className="mt-2 flex items-center justify-between px-4 text-sm text-gray-400">
         Gerencie as configurações da sala{' '}
         <Tooltip>
            <TooltipTrigger>
               <InfoIcon />
            </TooltipTrigger>
            <TooltipContent className="">
               <p className="w-60 text-xs text-slate-800/80 sm:w-3xs">
                  <strong> Importante:</strong> As alterações de participantes
                  serão salvas apenas quando você clicar em &quot;Salvar&quot;
                  no final.
               </p>
            </TooltipContent>
         </Tooltip>
      </p>
   );
}

interface AcoesDialogEditarSalaProps {
   carregando: boolean;
   podeSalvar: boolean;
   temMudancasNaoSalvas: boolean;
   onCancelar: () => void;
   onSalvar: () => void;
}

const AcoesDialogEditarSala = ({
   carregando,
   podeSalvar,
   onCancelar,
   onSalvar,
}: AcoesDialogEditarSalaProps) => {
   return (
      <>
         <ButtonCustom
            onClick={onCancelar}
            disabled={carregando}
            className="flex-1 rounded-xl bg-white/5 py-3 text-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
         >
            Cancelar
         </ButtonCustom>
         <ButtonCustom
            onClick={onSalvar}
            disabled={carregando || !podeSalvar}
            className={`flex-1 rounded-xl py-3 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50`}
         >
            Salvar
         </ButtonCustom>
      </>
   );
};

export const DialogEditarSala = ({
   aberto,
   aoFechar,
   dadosSala,
   meuRole,
   aoSalvar,
}: DialogEditarSalaProps) => {
   const [salvando, setSalvando] = useState(false);
   const [abaAtiva, setAbaAtiva] = useState('geral');
   const [participantesLocais, setParticipantesLocais] = useState<
      ParticipanteLocal[]
   >([]);
   const [salvandoParticipantes, setSalvandoParticipantes] = useState(false);
   const [dialogConfirmarFechamento, setDialogConfirmarFechamento] =
      useState(false);
   const carregando = salvando || salvandoParticipantes;

   // Hooks
   const { usuario } = useAuth();
   const [alterarRoleParticipante] = useAlterarRoleParticipanteMutation();

   const podeEditarTitulo = meuRole === 0 || meuRole === 1;
   const podeEditarSenha = meuRole === 0;

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

   const temMudancasParticipantes = () => {
      if (!dadosSala) return false;

      if (participantesLocais.length !== dadosSala.participantes.length) {
         return true;
      }

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
         const origMap = new Map(dadosSala.participantes.map((p) => [p.id, p]));
         const localMap = new Map(participantesLocais.map((p) => [p.id, p]));

         const toRemove = dadosSala.participantes.filter(
            (p) => !localMap.has(p.id),
         );
         const toAdd = participantesLocais.filter((p) => !origMap.has(p.id));
         const toUpdate = participantesLocais.filter((p) => {
            const orig = origMap.get(p.id);
            return orig && orig.role !== p.role;
         });

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

         if (meuRole === 1 && dono && toUpdate.some((u) => u.id === dono.id)) {
            toastError({
               title: 'Operação não permitida',
               description: 'Administradores não podem alterar o role do dono',
            });
            setSalvando(false);
            setSalvandoParticipantes(false);
            return;
         }

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

         toastSuccess({
            title: 'Sala atualizada!',
            description: 'Todas as alterações foram salvas com sucesso',
         });

         handleFechar(true);
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
         {carregando && (
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
               <AcoesDialogEditarSala
                  carregando={carregando}
                  podeSalvar={podeEditarTitulo || podeEditarSenha}
                  temMudancasNaoSalvas={temMudancasNaoSalvas}
                  onCancelar={() => handleFechar(false)}
                  onSalvar={handleSalvar}
               />
            }
         >
            <div className="flex max-h-[70vh] flex-col overflow-hidden">
               <ResumoConfiguracoesSala />

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
                                    <ScrollArea className="h-[350px] w-full">
                                       <AbaGeralSala
                                          form={form}
                                          salaPrivada={salaPrivada}
                                          alterarSenha={alterarSenha}
                                          podeEditarTitulo={podeEditarTitulo}
                                          podeEditarSenha={podeEditarSenha}
                                       />
                                    </ScrollArea>
                                 ),
                              },
                              {
                                 value: 'participantes',
                                 content: (
                                    <div className="h-full overflow-y-auto p-6">
                                       <AbaParticipantes
                                          participantes={participantesLocais}
                                          participantesOriginais={
                                             dadosSala.participantes
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
            btnCancelar="Não"
            textoPadrao="Você tem alterações não salvas. Deseja realmente sair sem salvar?"
            dialogAberto={dialogConfirmarFechamento}
            setDialogAberto={setDialogConfirmarFechamento}
            tipo="cancelamento"
            handleSubmit={async () => {
               handleConfirmarFechamento();
            }}
            dialogLoading={carregando}
         />
      </>
   );
};
