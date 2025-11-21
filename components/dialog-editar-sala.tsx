'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Settings,
  Users,
  UserPlus,
  InfoIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from './ui/form';
import { TabsCustom } from './tabs';
import { TextInput } from './inputs/input-text';
import { PasswordInput } from './inputs/input-password';
import { Switch } from './ui/switch';
import {
  SalaParaEdicao,
  useAdicionarParticipanteMutation,
  useRemoverParticipanteMutation,
  useAlterarRoleParticipanteMutation,
} from '@/services/api/salas-api';
import { CardParticipante } from './sala/card-participante';
import { DialogAdicionarParticipante } from './sala/dialog-adicionar-participante';
import { DialogRemoverParticipante } from './sala/dialog-remover-participante';
import { toastError, toastSuccess } from './custom-toast';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/api-error';
import Loading from './loading';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

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
  onAlterarParticipantes: (
    participantes: ParticipanteLocal[],
  ) => void;
  meuRole?: number | null;
}

function AbaParticipantes({
  participantes,
  participantesOriginais,
  onAlterarParticipantes,
  meuRole,
}: AbaParticipantesProps) {
  const [participanteRemover, setParticipanteRemover] =
    useState<{
      id: string;
      nome: string;
    } | null>(null);
  const [dialogAdicionarAberto, setDialogAdicionarAberto] =
    useState(false);

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

  const handleAlterarRole = (
    pessoa_id: string,
    novoRole: 1 | 2,
  ) => {
    const novosParticipantes = participantes.map((p) =>
      p.id === pessoa_id ? { ...p, role: novoRole } : p,
    );
    onAlterarParticipantes(novosParticipantes);
  };

  const handleAbrirDialogAdicionar = () => {
    setDialogAdicionarAberto(true);
  };

  const handleFecharDialogAdicionar = () => {
    setDialogAdicionarAberto(false);
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

      {/* Dialog para Adicionar Participante */}
      <DialogAdicionarParticipante
        aberto={dialogAdicionarAberto}
        aoFechar={handleFecharDialogAdicionar}
        participantesExistentes={participantes}
        meuRole={meuRole}
        onAdicionar={(pessoaId, nome, role) => {
          const novoParticipante: ParticipanteLocal = {
            id: pessoaId,
            nome,
            role,
            inativo: false,
          };

          onAlterarParticipantes([
            ...participantes,
            novoParticipante,
          ]);

          handleFecharDialogAdicionar();
        }}
      />

      {/* Dialog de Confirmação de Remoção */}
      <DialogRemoverParticipante
        participante={participanteRemover}
        onFechar={() => setParticipanteRemover(null)}
        onConfirmar={handleRemoverParticipante}
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
  }) => Promise<void>;
  children?: React.ReactNode;
}

export function DialogEditarSala({
  aberto,
  aoFechar,
  dadosSala,
  meuRole,
  aoSalvar,
  children,
}: DialogEditarSalaProps) {
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const [participantesLocais, setParticipantesLocais] =
    useState<ParticipanteLocal[]>([]);
  const [salvandoParticipantes, setSalvandoParticipantes] =
    useState(false);
  const [
    dialogConfirmarFechamento,
    setDialogConfirmarFechamento,
  ] = useState(false);

  // Hooks
  const { usuario } = useAuth();
  const [adicionarParticipante] =
    useAdicionarParticipanteMutation();
  const [removerParticipante] =
    useRemoverParticipanteMutation();
  const [alterarRoleParticipante] =
    useAlterarRoleParticipanteMutation();

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
    if (
      participantesLocais.length !==
      dadosSala.participantes.length
    ) {
      return true;
    }

    // Verificar se algum participante mudou de role
    const origMap = new Map(
      dadosSala.participantes.map((p) => [p.id, p]),
    );
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
      (formData.alterarSenha &&
        formData.senha.trim().length > 0)
    );
  };

  const temMudancasNaoSalvas =
    temMudancasParticipantes() || temMudancasGerais();

  const handleSalvar = async () => {
    if (!dadosSala || !usuario?.id) {
      toastError({
        title: 'Erro',
        description:
          'Dados da sala ou usuário não disponíveis',
      });
      return;
    }

    // Validar permissões
    if (!podeEditarTitulo && !podeEditarSenha) {
      toastError({
        title: 'Sem permissão',
        description:
          'Você não tem permissão para editar esta sala',
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
      const origMap = new Map(
        dadosSala.participantes.map((p) => [p.id, p]),
      );
      const localMap = new Map(
        participantesLocais.map((p) => [p.id, p]),
      );

      // Calcular diferenças
      const toRemove = dadosSala.participantes.filter(
        (p) => !localMap.has(p.id),
      );
      const toAdd = participantesLocais.filter(
        (p) => !origMap.has(p.id),
      );
      const toUpdate = participantesLocais.filter((p) => {
        const orig = origMap.get(p.id);
        return orig && orig.role !== p.role;
      });

      // VALIDAÇÃO FRONTEND: Não permitir remover o dono
      const dono = dadosSala.participantes.find(
        (p) => p.role === 0,
      );
      if (dono && toRemove.some((r) => r.id === dono.id)) {
        toastError({
          title: 'Operação não permitida',
          description:
            'Não é permitido remover o dono da sala',
        });
        setSalvando(false);
        setSalvandoParticipantes(false);
        return;
      }

      // VALIDAÇÃO FRONTEND: Admin não pode alterar role do dono
      if (
        meuRole === 1 &&
        dono &&
        toUpdate.some((u) => u.id === dono.id)
      ) {
        toastError({
          title: 'Operação não permitida',
          description:
            'Administradores não podem alterar o role do dono',
        });
        setSalvando(false);
        setSalvandoParticipantes(false);
        return;
      }

      // EXECUTAR MUDANÇAS NA ORDEM SEGURA: remover → adicionar → alterar role

      // 1) REMOÇÕES (sequencial para melhor controle de erro)
      for (const participante of toRemove) {
        try {
          await removerParticipante({
            sala_id: dadosSala.id,
            pessoa_id: participante.id,
          }).unwrap();
        } catch (error) {
          const apiError = getApiErrorMessage(error);
          toastError({
            title: `Erro ao remover ${participante.nome}`,
            description:
              apiError.Detalhe ||
              'Falha ao remover participante',
          });
          setSalvando(false);
          setSalvandoParticipantes(false);
          return; // Abortar em caso de erro
        }
      }

      // 2) ADIÇÕES (paralelo para melhor performance)
      if (toAdd.length > 0) {
        try {
          await Promise.all(
            toAdd.map((participante) =>
              adicionarParticipante({
                sala_id: dadosSala.id,
                pessoa_id: participante.id,
                role: participante.role as 1 | 2,
              }).unwrap(),
            ),
          );
        } catch (error) {
          const apiError = getApiErrorMessage(error);
          toastError({
            title: 'Erro ao adicionar participantes',
            description:
              apiError.Detalhe ||
              'Falha ao adicionar um ou mais participantes',
          });
          setSalvando(false);
          setSalvandoParticipantes(false);
          return; // Abortar em caso de erro
        }
      }

      // 3) ALTERAÇÕES DE ROLE (paralelo para melhor performance)
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
          return; // Abortar em caso de erro
        }
      }

      setSalvandoParticipantes(false);

      // ========================================
      // PARTE 2: PERSISTIR MUDANÇAS GERAIS (TÍTULO/SENHA)
      // ========================================

      const formData = form.getValues();

      // Verificar se houve mudanças reais no título ou senha
      const tituloMudou =
        formData.titulo !== dadosSala.titulo;
      const senhaMudou =
        formData.alterarSenha &&
        formData.salaPrivada &&
        formData.senha.trim().length > 0;

      // Só chamar API se houver mudanças
      if (tituloMudou || senhaMudou) {
        const dados: { titulo: string; senha?: string } = {
          titulo: formData.titulo,
        };

        // Só incluir senha se foi alterada
        if (senhaMudou) {
          dados.senha = formData.senha;
        }

        await aoSalvar(dados);
      }

      // SUCESSO TOTAL
      toastSuccess({
        title: 'Sala atualizada!',
        description:
          'Todas as alterações foram salvas com sucesso',
      });

      handleFechar(true); // Força fechamento sem verificar mudanças
    } catch (error) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem || 'Erro ao salvar',
        description:
          apiError.Detalhe ||
          'Ocorreu um erro ao salvar as alterações',
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
      <Dialog
        open={aberto}
        onOpenChange={aoFechar}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent
          className="h-full rounded-sm border-white/20 bg-slate-900 p-0 text-white sm:h-[600px] sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Editar Sala</DialogTitle>
            <DialogDescription>
              Gerencie as configurações da sala
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[90vh] flex-col">
            {/* Header Visual */}
            <div className="border-b border-white/10 p-6">
              <h2 className="text-xl">Editar Sala</h2>
              <p className="mt-1 flex items-center justify-between text-sm text-gray-400">
                Gerencie as configurações da sala{' '}
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon />
                  </TooltipTrigger>
                  <TooltipContent className="bg-accent">
                    <p className="w-60 text-xs text-purple-200 sm:w-3xs">
                      <strong>ℹ️ Importante:</strong> As
                      alterações de participantes serão
                      salvas apenas quando você clicar em
                      &quot;Salvar&quot; no final.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </p>
            </div>

            {!dadosSala ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : (
              <FormProvider {...form}>
                <div className="flex flex-1 flex-col">
                  <TabsCustom
                    value={abaAtiva}
                    onValueChange={setAbaAtiva}
                    className="flex flex-1 flex-col"
                    tabsListClassName="bg-transparent grid h-fit w-full grid-cols-2 items-center gap-2 "
                    tabsTrigger={[
                      {
                        value: 'geral',
                        label: 'Geral',
                        icon: (
                          <Settings className="h-4 w-4" />
                        ),
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
                              render={({
                                field,
                                fieldState,
                              }) => (
                                <FormItem>
                                  <FormControl>
                                    <TextInput
                                      label="Título da Sala"
                                      value={field.value}
                                      onChange={
                                        field.onChange
                                      }
                                      placeholder="Ex: Sprint Planning - Time Alpha"
                                      error={
                                        !!fieldState.error
                                      }
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
                            {salaPrivada &&
                              podeEditarSenha && (
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
                                                Alterar
                                                Senha
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
                                              name={
                                                field.name
                                              }
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

                            {!podeEditarSenha &&
                              salaPrivada && (
                                <p className="text-xs text-gray-500">
                                  Apenas o dono pode alterar
                                  a senha da sala
                                </p>
                              )}
                          </div>
                        ),
                      },
                      {
                        value: 'participantes',
                        content: (
                          <div className="overflow-y-auto p-6">
                            <AbaParticipantes
                              participantes={
                                participantesLocais
                              }
                              participantesOriginais={
                                dadosSala?.participantes ||
                                []
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

                {/* Footer */}
                <div className="fixed right-0 bottom-0 flex w-full gap-2 border-t border-white/10 p-6">
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
                      salvando ||
                      (!podeEditarTitulo &&
                        !podeEditarSenha)
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
                </div>
              </FormProvider>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação ao Fechar com Mudanças */}
      <AlertDialog
        open={dialogConfirmarFechamento}
        onOpenChange={setDialogConfirmarFechamento}
      >
        <AlertDialogContent className="border-white/20 bg-slate-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Alterações não salvas
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-gray-400">
              Você tem alterações não salvas. Deseja
              realmente sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Continuar Editando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarFechamento}
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
            >
              Sair sem Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
