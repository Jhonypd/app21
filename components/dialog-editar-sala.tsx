'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Settings,
  Users,
  Crown,
  Shield,
  User,
  UserPlus,
  Trash2,
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
import { SalaParaEdicao } from '@/services/api/salas-api';
import {
  useLazyPesquisarPorNomeOuEmailQuery,
  DadosPessoaResumo,
} from '@/services/api/pessoas.api';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import Loading from './loading';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
  onAlterarParticipantes: (
    participantes: ParticipanteLocal[],
  ) => void;
  meuRole?: number | null;
}

function AbaParticipantes({
  participantes,
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
  const [pessoaSelecionada, setPessoaSelecionada] =
    useState<string>('');
  const [roleSelecionado, setRoleSelecionado] = useState<
    1 | 2
  >(2);
  const [termoBusca, setTermoBusca] = useState('');
  const [pessoasEncontradas, setPessoasEncontradas] =
    useState<DadosPessoaResumo[]>([]);

  const [buscarPessoas, { isLoading: buscando }] =
    useLazyPesquisarPorNomeOuEmailQuery();

  // Permissões
  const podeAdicionar = meuRole === 0 || meuRole === 1; // Dono ou Admin
  const podeRemover = meuRole === 0 || meuRole === 1; // Dono ou Admin
  const podeAlterarRole = meuRole === 0; // Apenas Dono
  const podeAdicionarAdmin = meuRole === 0; // Apenas Dono pode adicionar Admin

  // Helper para determinar ícone e label do role
  const getRoleInfo = (role: number) => {
    switch (role) {
      case 0:
        return {
          icon: Crown,
          label: 'Dono',
          color: 'text-yellow-500',
          badgeClass:
            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        };
      case 1:
        return {
          icon: Shield,
          label: 'Admin',
          color: 'text-blue-500',
          badgeClass:
            'bg-blue-500/10 text-blue-500 border-blue-500/20',
        };
      case 2:
      default:
        return {
          icon: User,
          label: 'Membro',
          color: 'text-gray-400',
          badgeClass:
            'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
    }
  };

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

  // Buscar pessoas ao digitar
  useEffect(() => {
    const buscar = async () => {
      if (termoBusca.trim().length < 2) {
        setPessoasEncontradas([]);
        return;
      }

      try {
        const resultado = await buscarPessoas({
          termo: termoBusca,
        }).unwrap();
        // Filtrar pessoas que já são participantes
        const idsParticipantes = participantes.map(
          (p) => p.id,
        );
        const pessoas = resultado.Resultado?.pessoas || [];
        const pessoasFiltradas = pessoas.filter(
          (p: DadosPessoaResumo) =>
            !idsParticipantes.includes(p.id),
        );
        setPessoasEncontradas(pessoasFiltradas);
      } catch {
        setPessoasEncontradas([]);
      }
    };

    const timer = setTimeout(buscar, 300);
    return () => clearTimeout(timer);
  }, [termoBusca, buscarPessoas, participantes]);

  const handleAbrirDialogAdicionar = () => {
    setDialogAdicionarAberto(true);
    setPessoaSelecionada('');
    setRoleSelecionado(2);
    setTermoBusca('');
    setPessoasEncontradas([]);
  };

  const handleFecharDialogAdicionar = () => {
    setDialogAdicionarAberto(false);
    setPessoaSelecionada('');
    setRoleSelecionado(2);
    setTermoBusca('');
    setPessoasEncontradas([]);
  };

  const handleAdicionarParticipante = () => {
    if (!pessoaSelecionada) return;

    const pessoaEncontrada = pessoasEncontradas.find(
      (p) => p.id === pessoaSelecionada,
    );
    if (!pessoaEncontrada) return;

    const novoParticipante: ParticipanteLocal = {
      id: pessoaEncontrada.id,
      nome: pessoaEncontrada.nome,
      inativo: pessoaEncontrada.inativo,
      role: roleSelecionado,
    };

    onAlterarParticipantes([
      ...participantes,
      novoParticipante,
    ]);
    handleFecharDialogAdicionar();
  };

  return (
    <>
      <div className="space-y-4">
        {/* Mensagem informativa */}
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
          <p className="text-xs text-purple-300">
            <strong>ℹ️ Importante:</strong> As alterações de
            participantes serão salvas apenas quando você
            clicar em &quot;Salvar&quot; no final.
          </p>
        </div>

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
        <div className="space-y-2">
          {participantes.map((participante) => {
            const roleInfo = getRoleInfo(participante.role);
            const Icon = roleInfo.icon;
            const isDono = participante.role === 0;
            const isAdmin = participante.role === 1;

            // Admin não pode remover dono ou outro admin
            const podeRemoverEste =
              podeRemover &&
              !isDono &&
              (meuRole === 0 || !isAdmin);

            return (
              <div
                key={participante.id}
                className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full bg-white/10 p-2 ${roleInfo.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {participante.nome}
                    </p>
                    <Badge
                      variant="outline"
                      className={`mt-1 ${roleInfo.badgeClass}`}
                    >
                      {roleInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  {/* Alterar Role - apenas dono pode fazer */}
                  {podeAlterarRole && !isDono && (
                    <div className="flex gap-1">
                      {participante.role === 2 && (
                        <button
                          onClick={() =>
                            handleAlterarRole(
                              participante.id,
                              1,
                            )
                          }
                          className="rounded-lg bg-blue-600/20 px-3 py-1 text-xs text-blue-400 transition-all hover:bg-blue-600/30 active:scale-95"
                        >
                          Promover
                        </button>
                      )}
                      {participante.role === 1 && (
                        <button
                          onClick={() =>
                            handleAlterarRole(
                              participante.id,
                              2,
                            )
                          }
                          className="rounded-lg bg-gray-600/20 px-3 py-1 text-xs text-gray-400 transition-all hover:bg-gray-600/30 active:scale-95"
                        >
                          Rebaixar
                        </button>
                      )}
                    </div>
                  )}

                  {/* Remover */}
                  {podeRemoverEste && (
                    <button
                      onClick={() =>
                        setParticipanteRemover({
                          id: participante.id,
                          nome: participante.nome,
                        })
                      }
                      className="rounded-lg bg-red-600/20 p-2 text-red-400 transition-all hover:bg-red-600/30 active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Informações sobre permissões */}
        <div className="rounded-xl bg-blue-500/10 p-4">
          <p className="text-xs text-blue-400">
            <strong>Dica:</strong>{' '}
            {meuRole === 0 &&
              'Como dono, você pode promover membros a admin ou removê-los da sala.'}
            {meuRole === 1 &&
              'Como admin, você pode adicionar e remover membros (mas não outros admins).'}
            {(meuRole === 2 || meuRole === null) &&
              'Apenas dono e admins podem gerenciar participantes.'}
          </p>
        </div>
      </div>

      {/* Dialog para Adicionar Participante */}
      <AlertDialog
        open={dialogAdicionarAberto}
        onOpenChange={(open) =>
          !open && handleFecharDialogAdicionar()
        }
      >
        <AlertDialogContent className="border-white/20 bg-slate-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Adicionar Participante
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Busque e adicione um novo participante à sala
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                Buscar pessoa
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) =>
                    setTermoBusca(e.target.value)
                  }
                  placeholder="Digite o nome ou email..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                />
                {buscando && (
                  <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de resultados */}
            {termoBusca.trim().length >= 2 &&
              pessoasEncontradas.length > 0 && (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl bg-white/5 p-2">
                  {pessoasEncontradas.map((pessoa) => (
                    <button
                      key={pessoa.id}
                      onClick={() =>
                        setPessoaSelecionada(pessoa.id)
                      }
                      className={`w-full rounded-lg p-3 text-left transition-all ${
                        pessoaSelecionada === pessoa.id
                          ? 'border border-purple-500 bg-purple-600/20'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {pessoa.nome}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pessoa.email}
                      </p>
                    </button>
                  ))}
                </div>
              )}

            {termoBusca.trim().length >= 2 &&
              pessoasEncontradas.length === 0 &&
              !buscando && (
                <p className="py-4 text-center text-sm text-gray-400">
                  Nenhuma pessoa encontrada
                </p>
              )}

            {/* Seletor de Role */}
            {pessoaSelecionada && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Tipo de participante
                </label>
                <Select
                  value={roleSelecionado.toString()}
                  onValueChange={(value) =>
                    setRoleSelecionado(
                      Number(value) as 1 | 2,
                    )
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 bg-slate-900">
                    <SelectItem
                      value="2"
                      className="text-white hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Membro</span>
                      </div>
                    </SelectItem>
                    {podeAdicionarAdmin && (
                      <SelectItem
                        value="1"
                        className="text-white hover:bg-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Administrador</span>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!podeAdicionarAdmin && (
                  <p className="text-xs text-gray-500">
                    Apenas o dono pode adicionar
                    administradores
                  </p>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAdicionarParticipante}
              disabled={!pessoaSelecionada}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              Adicionar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Remoção */}
      <AlertDialog
        open={!!participanteRemover}
        onOpenChange={(open) =>
          !open && setParticipanteRemover(null)
        }
      >
        <AlertDialogContent className="border-white/20 bg-slate-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Remover Participante
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-gray-400">
              Tem certeza que deseja remover{' '}
              <strong className="text-white">
                {participanteRemover?.nome}
              </strong>{' '}
              da sala? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoverParticipante}
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

  const handleSalvar = async () => {
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
    try {
      const formData = form.getValues();
      const dados: { titulo: string; senha?: string } = {
        titulo: formData.titulo,
      };

      // Só incluir senha se:
      // 1. Usuário marcou para alterar senha
      // 2. Sala é privada (tem ou terá senha)
      // 3. Senha não está vazia
      if (
        formData.alterarSenha &&
        formData.salaPrivada &&
        formData.senha.trim()
      ) {
        dados.senha = formData.senha;
      }

      await aoSalvar(dados);

      toastSuccess({
        title: 'Sala atualizada!',
        description:
          'As alterações foram salvas com sucesso',
      });

      handleFechar();
    } catch (error) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleFechar = () => {
    form.reset();
    aoFechar();
  };

  return (
    <>
      {salvando && (
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
          className="rounded-sm border-white/20 bg-slate-900 p-0 text-white sm:max-w-2xl"
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
              <p className="mt-1 text-sm text-gray-400">
                Gerencie as configurações da sala
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
                    tabsListClassName="bg-transparent grid h-fit w-full grid-cols-2 items-center gap-2 border-0 p-6 pb-0"
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
                <div className="flex gap-2 border-t border-white/10 p-6">
                  <button
                    onClick={handleFechar}
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
                    className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-sm transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </FormProvider>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
