'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  Eye,
  RotateCcw,
  Copy,
  Crown,
  UserPlus,
  Check,
  X,
  ListTodo,
  ChevronRight,
  Ban,
} from 'lucide-react';
import { copiarParaAreaTransferencia } from '@/utils/copiarTexto';
import { CardParticipante } from './sala/card-participante';

import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { useAdicionarParticipanteSessaoMutation } from '@/services/api/sessoes-api';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/api-error';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { useSalaAuth } from '@/hooks/salaAuth';

// Interfaces baseadas na estrutura real da API
interface Proprietario {
  id: string;
  inativo: boolean;
  nome: string;
}

interface Historia {
  id: string;
  titulo: string;
  descricao: string;
}

interface Participante {
  id: string;
  nome: string;
  inativo: boolean;
  role: number; // 0=Dono, 1=Admin, 2=Membro, 3=Visitante
  // mudei a role para obrigatória porque sempre vem da API
}

interface Voto {
  pessoa: {
    nome: string;
    inativo: boolean;
  };
  id: string;
  pessoa_id: string;
  valor: number;
}

interface SessaoAtiva {
  id: string;
  criada_em: Date;
  ativa: boolean;
  iniciada_por: string; // ID da pessoa que iniciou a sessão
}

interface SalaData {
  id: string;
  codigo: string;
  titulo: string;
  senha: string | null;
  inativo: boolean;
  data_criacao: Date;
  data_alteracao: Date | null;
  criado_por: string;
  proprietario: Proprietario;
  historias: Historia[];
  participantes: Participante[];
  votos: Voto[];
  sessaoAtiva?: SessaoAtiva; // Dados da sessão ativa
}

interface SalaPlanningProps {
  sala: SalaData;
  usuarioAtualId: string;
  sessaoId?: string; // ID da sessão ativa (necessário para visitantes)
  meuRole?: number; // 0=Dono, 1=Admin, 2=Membro, 3=Visitante
  aoVoltar: () => void | Promise<void>;
  aoEnviarVoto?: (valor: number) => Promise<void>;
  aoRevelarVotos?: () => Promise<void>;
  aoResetarVotos?: () => Promise<void>;
  aoSelecionarHistoria?: (
    historiaId: string,
  ) => Promise<void>;
  aoEncerrarSessao?: () => Promise<void>;
  aoAnularVoto?: (votoId: string) => Promise<void>;
}

const CARTAS_PLANNING = [
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '21',
  '34',
  '55',
  '89',
  '?',
  '☕',
];

export function SalaPlanning({
  sala,
  usuarioAtualId,
  sessaoId,
  meuRole = 2, // Default: Membro
  aoVoltar,
  aoEnviarVoto,
  aoRevelarVotos,
  aoResetarVotos,
  aoSelecionarHistoria,
  aoEncerrarSessao,
  aoAnularVoto,
}: SalaPlanningProps) {
  // Estados
  const [votoSelecionado, setVotoSelecionado] = useState<
    string | null
  >(null);
  const [votoConfirmado, setVotoConfirmado] =
    useState(false);
  const [votosRevelados, setVotosRevelados] =
    useState(false);
  const [historiaAtual, setHistoriaAtual] =
    useState<Historia | null>(null);
  const [modalVisitantesAberto, setModalVisitantesAberto] =
    useState(false);
  const [mostrarHistorias, setMostrarHistorias] =
    useState(false);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [pessoaSelecionadaId, setPessoaSelecionadaId] =
    useState('');

  const eProprietario = sala.criado_por === usuarioAtualId;
  // Verificar se o usuário iniciou a sessão (dono ou admin que criou a sessão)
  const iniciouSessao =
    sala.sessaoAtiva?.iniciada_por === usuarioAtualId;
  const podeEncerrarSessao = eProprietario || iniciouSessao;

  // Mutations para visitantes
  const [
    adicionarVisitante,
    { isLoading: adicionandoVisitante },
  ] = useAdicionarParticipanteSessaoMutation();
  const [
    pesquisarPessoas,
    { data: pessoasEncontradas, isFetching },
  ] = useLazyPesquisarPorNomeOuEmailQuery();

  // Inicializar com a primeira história se existir
  useEffect(() => {
    if (
      sala.historias &&
      sala.historias.length > 0 &&
      !historiaAtual
    ) {
      setHistoriaAtual(sala.historias[0]);
    }
  }, [sala.historias, historiaAtual]);

  // Processar participantes com seus votos do array de votos
  const participantesComVotos = (sala.participantes || [])
    .filter((p) => !p.inativo)
    .map((participante) => {
      const voto = (sala.votos || []).find(
        (v) => v.pessoa_id === participante.id,
      );
      return {
        id: participante.id,
        nome: participante.nome,
        voto: voto ? voto.valor.toString() : null,
        votou: !!voto,
        votoId: voto?.id,
      };
    });

  // Verificar se o usuário atual já votou
  const votoUsuario = (sala.votos || []).find(
    (v) => v.pessoa_id === usuarioAtualId,
  );

  useEffect(() => {
    if (votoUsuario) {
      setVotoSelecionado(votoUsuario.valor.toString());
      setVotoConfirmado(true);
    }
  }, [votoUsuario]);

  const todosVotaram = participantesComVotos.every(
    (p) => p.votou,
  );
  const totalVotos = participantesComVotos.filter(
    (p) => p.votou,
  ).length;

  // Handlers
  const handleSelecionarVoto = (carta: string) => {
    if (votoConfirmado) return;

    if (votoSelecionado === carta) {
      setVotoSelecionado(null);
    } else {
      setVotoSelecionado(carta);
    }
  };

  const handleConfirmarVoto = async () => {
    if (!votoSelecionado || votoConfirmado) return;

    setLoadingAcao(true);
    try {
      let valorNumerico: number;
      if (votoSelecionado === '?') {
        valorNumerico = 0;
      } else if (votoSelecionado === '☕') {
        valorNumerico = -1;
      } else {
        valorNumerico = parseInt(votoSelecionado);
      }

      if (aoEnviarVoto) {
        await aoEnviarVoto(valorNumerico);
      }
      setVotoConfirmado(true);
    } catch (error) {
      console.error('Erro ao confirmar voto:', error);
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleCancelarVoto = () => {
    if (votoConfirmado) return;
    setVotoSelecionado(null);
  };

  const handleRevelarVotos = async () => {
    if (!todosVotaram) return;

    setLoadingAcao(true);
    try {
      if (aoRevelarVotos) {
        await aoRevelarVotos();
      }
      setVotosRevelados(true);
    } catch (error) {
      console.error('Erro ao revelar votos:', error);
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleResetarVotacao = async () => {
    setLoadingAcao(true);
    try {
      if (aoResetarVotos) {
        await aoResetarVotos();
      }
      setVotosRevelados(false);
      setVotoSelecionado(null);
      setVotoConfirmado(false);
    } catch (error) {
      console.error('Erro ao resetar votação:', error);
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleSelecionarHistoriaItem = async (
    historia: Historia,
  ) => {
    setHistoriaAtual(historia);
    setMostrarHistorias(false);

    if (aoSelecionarHistoria) {
      await aoSelecionarHistoria(historia.id);
    }
  };

  const handleEncerrarSessao = async () => {
    // Validar se pode encerrar
    if (!podeEncerrarSessao) {
      toast.error(
        'Apenas o dono ou quem iniciou a sessão pode encerrá-la',
      );
      return;
    }

    setLoadingAcao(true);
    try {
      if (aoEncerrarSessao) {
        await aoEncerrarSessao();
      }
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleBuscarPessoas = async (termo: string) => {
    setTermoBusca(termo);
    if (termo.length >= 2) {
      await pesquisarPessoas({ termo });
    }
  };

  const handleAdicionarVisitante = async () => {
    if (!pessoaSelecionadaId || !sessaoId) {
      toast.error('Selecione uma pessoa para adicionar');
      return;
    }

    try {
      await adicionarVisitante({
        sessaoId: sessaoId,
        pessoaId: pessoaSelecionadaId,
      }).unwrap();

      toast.success('Visitante adicionado com sucesso!');
      setModalVisitantesAberto(false);
      setTermoBusca('');
      setPessoaSelecionadaId('');
    } catch (erro: unknown) {
      const errorMessage = getApiErrorMessage(erro);
      toast.error(errorMessage.Mensagem);
    }
  };

  const handleAnularVoto = async (
    votoId: string,
    nomeParticipante: string,
  ) => {
    if (!confirm(`Anular voto de ${nomeParticipante}?`))
      return;

    setLoadingAcao(true);
    try {
      if (aoAnularVoto) {
        await aoAnularVoto(votoId);
      }
    } catch (error) {
      console.error('Erro ao anular voto:', error);
    } finally {
      setLoadingAcao(false);
    }
  };

  const calcularMedia = () => {
    const votosNumericos = participantesComVotos
      .map((p) => p.voto)
      .filter((v) => v && !isNaN(Number(v)))
      .map(Number);

    if (votosNumericos.length === 0) return null;

    const soma = votosNumericos.reduce((a, b) => a + b, 0);
    return (soma / votosNumericos.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-6 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <button
              onClick={() => aoVoltar()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <h1 className="text-xl">{sala.titulo}</h1>
              <p className="text-xs text-gray-400">
                por {sala.proprietario.nome}
                {eProprietario && (
                  <Crown className="ml-1 inline h-3 w-3 text-yellow-400" />
                )}
              </p>
            </div>

            {podeEncerrarSessao && (
              <button
                onClick={handleEncerrarSessao}
                disabled={loadingAcao}
                className="flex items-center gap-2 rounded-xl bg-red-600/20 px-3 py-2 text-red-400 transition-all hover:bg-red-600/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                title="Encerrar sessão para todos"
              >
                <Ban className="h-4 w-4" />
                <span className="text-xs">
                  Encerrar Sessão
                </span>
              </button>
            )}
          </div>

          {/* História Atual */}
          {eProprietario &&
            sala.historias &&
            sala.historias.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={() =>
                    setMostrarHistorias(!mostrarHistorias)
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">
                        {historiaAtual
                          ? historiaAtual.titulo
                          : 'Selecione uma história'}
                      </span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${mostrarHistorias ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>

                {mostrarHistorias && (
                  <div className="mt-2 max-h-60 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/50 p-2">
                    {sala.historias.map((historia) => (
                      <button
                        key={historia.id}
                        onClick={() =>
                          handleSelecionarHistoriaItem(
                            historia,
                          )
                        }
                        className={`w-full rounded-lg p-3 text-left transition-all ${
                          historiaAtual?.id === historia.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <p className="text-sm">
                          {historia.titulo}
                        </p>
                        {historia.descricao && (
                          <p className="mt-1 text-xs text-gray-400">
                            {historia.descricao}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          {historiaAtual && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-600/10 px-4 py-3">
              <p className="text-xs text-purple-300">
                Estimando agora:
              </p>
              <p className="text-sm">
                {historiaAtual.titulo}
              </p>
              {historiaAtual.descricao && (
                <p className="mt-1 text-xs text-gray-400">
                  {historiaAtual.descricao}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-6 px-4">
        {/* Participantes */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes ({participantesComVotos.length})
            </h2>
            <div className="text-sm text-gray-400">
              {totalVotos}/{participantesComVotos.length}{' '}
              votaram
            </div>
          </div>

          <div className="space-y-2">
            {sala.participantes?.map((participante) => {
              const votoParticipante =
                participantesComVotos.find(
                  (p) => p.id === participante.id,
                );

              return (
                <div
                  key={participante.id}
                  className="relative"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <CardParticipante
                        participante={{
                          id: participante.id,
                          nome: participante.nome,
                          role: participante.role,
                        }}
                        jaExistia={true}
                        meuRole={meuRole}
                        mostrarAcoes={false} // Desabilitar ações na sala de planning
                        voto={
                          votoParticipante?.voto
                            ? votoParticipante.voto
                            : null
                        } // depois tem que buscar o voto real
                        votosRevelados={votosRevelados}
                      />
                    </div>

                    {/* Status do voto */}
                    <div className="flex items-center gap-2">
                      {/* Botão anular voto (apenas proprietário) */}
                      {eProprietario &&
                        votoParticipante?.votou &&
                        votoParticipante.votoId &&
                        participante.id !==
                          usuarioAtualId && (
                          <button
                            onClick={() =>
                              handleAnularVoto(
                                votoParticipante.votoId!,
                                participante.nome,
                              )
                            }
                            disabled={loadingAcao}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-all hover:bg-red-500/30 disabled:cursor-not-allowed"
                            title="Anular voto"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        {votosRevelados && (
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-4">
            <h3 className="mb-2 text-sm text-gray-300">
              Resultado da Votação
            </h3>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400">
                  Média
                </p>
                <p className="text-3xl">
                  {calcularMedia() || '—'}
                </p>
              </div>
              <div className="flex flex-1 flex-wrap gap-2">
                {participantesComVotos
                  .filter((p) => p.votou)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg bg-white/10 px-3 py-1"
                    >
                      <span className="font-mono text-xs">
                        {p.voto}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Cards de Planning */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2>Selecione sua estimativa</h2>
            {votoSelecionado && !votoConfirmado && (
              <button
                onClick={handleCancelarVoto}
                className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1 text-xs text-red-400 transition-all hover:bg-red-500/30"
              >
                <X className="h-3 w-3" />
                Cancelar
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {CARTAS_PLANNING.map((carta) => (
              <button
                key={carta}
                onClick={() => handleSelecionarVoto(carta)}
                disabled={votosRevelados || votoConfirmado}
                className={`aspect-[3/4] rounded-2xl border-2 transition-all active:scale-95 ${
                  votoSelecionado === carta
                    ? 'scale-105 border-purple-400 bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                } ${votosRevelados || votoConfirmado ? 'cursor-not-allowed opacity-50' : ''} flex items-center justify-center text-2xl`}
              >
                {carta}
              </button>
            ))}
          </div>

          {votoSelecionado && !votoConfirmado && (
            <button
              onClick={handleConfirmarVoto}
              disabled={loadingAcao}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 transition-all hover:from-green-700 hover:to-emerald-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
              {loadingAcao
                ? 'Confirmando...'
                : 'Confirmar Voto'}
            </button>
          )}

          {votoConfirmado && !votosRevelados && (
            <div className="mt-4 rounded-xl border border-green-500/30 bg-green-600/10 px-4 py-3 text-center">
              <p className="flex items-center justify-center gap-2 text-sm text-green-400">
                <Check className="h-4 w-4" />
                Voto confirmado: {votoSelecionado}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Adicionar Visitante - Apenas Admin/Dono */}
          {sessaoId && meuRole <= 1 && (
            <button
              onClick={() => setModalVisitantesAberto(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-600/20 px-4 py-3 transition-all hover:bg-purple-600/30 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">
                Adicionar Visitante
              </span>
            </button>
          )}

          {/* Revelar/Resetar (apenas proprietário) */}
          {eProprietario && !votosRevelados ? (
            <button
              onClick={handleRevelarVotos}
              disabled={!todosVotaram || loadingAcao}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 transition-all ${
                todosVotaram
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-98'
                  : 'cursor-not-allowed bg-white/5 opacity-50'
              }`}
            >
              <Eye className="h-5 w-5" />
              <span className="text-sm">
                {loadingAcao
                  ? 'Revelando...'
                  : todosVotaram
                    ? 'Revelar Votos'
                    : `Aguardando ${participantesComVotos.length - totalVotos}`}
              </span>
            </button>
          ) : null}

          {eProprietario && votosRevelados && (
            <button
              onClick={handleResetarVotacao}
              disabled={loadingAcao}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 transition-all hover:from-purple-700 hover:to-pink-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm">
                {loadingAcao
                  ? 'Resetando...'
                  : 'Nova Votação'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Adicionar Visitante */}
      <Dialog
        open={modalVisitantesAberto}
        onOpenChange={setModalVisitantesAberto}
      >
        <DialogContent className="border-slate-700 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Adicionar Visitante
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Campo de busca */}
            <div className="relative">
              <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={termoBusca}
                onChange={(e) =>
                  handleBuscarPessoas(e.target.value)
                }
                className="border-slate-700 bg-slate-800 pl-10 text-white"
              />
            </div>

            {/* Lista de resultados */}
            {isFetching && (
              <p className="text-center text-sm text-gray-400">
                Buscando...
              </p>
            )}

            {pessoasEncontradas?.Resultado?.pessoas &&
              pessoasEncontradas.Resultado.pessoas.length >
                0 && (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {pessoasEncontradas.Resultado.pessoas.map(
                    (pessoa: {
                      id: string;
                      nome: string;
                      email: string;
                    }) => (
                      <button
                        key={pessoa.id}
                        onClick={() =>
                          setPessoaSelecionadaId(pessoa.id)
                        }
                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                          pessoaSelecionadaId === pessoa.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        <p className="font-medium">
                          {pessoa.nome}
                        </p>
                        <p className="text-sm text-gray-400">
                          {pessoa.email}
                        </p>
                      </button>
                    ),
                  )}
                </div>
              )}
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setModalVisitantesAberto(false);
                setTermoBusca('');
                setPessoaSelecionadaId('');
              }}
              className="rounded-lg bg-slate-700 px-4 py-2 transition-all hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdicionarVisitante}
              disabled={
                !pessoaSelecionadaId || adicionandoVisitante
              }
              className="rounded-lg bg-purple-600 px-4 py-2 transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adicionandoVisitante
                ? 'Adicionando...'
                : 'Adicionar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
