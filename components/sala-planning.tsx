'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { useAdicionarParticipanteSessaoMutation } from '@/services/api/sessoes-api';
import { useAdicionarHistoriaDuranteSessaoMutation } from '@/services/api/historias-api';
import { toast } from 'sonner';
import { DialogAdicionarHistoria } from './sala/dialog-adicionar-historia';
import { ModalAdicionarVisitante } from './sala/modal-adicionar-visitante';
import { Button } from './ui/button';
import CardVotos from './sala/card-votos';
import ListaParticipantes from './sala/lista-participantes';
import HeaderSala from './sala/header-sala';
import { ListaHistorias } from './sala/lista-historias';

// Interfaces baseadas na estrutura real da API
interface Proprietario {
  id: string;
  inativo: boolean;
  nome: string;
}

interface Historia {
  id: string;
  titulo: string;
  descricao?: string;
}

interface Participante {
  id: string;
  nome: string;
  inativo: boolean;
  role: number;
  online?: boolean;
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
  iniciada_por: string;
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
  sessaoAtiva?: SessaoAtiva;
}

interface SalaPlanningProps {
  sala: SalaData;
  usuarioAtualId: string;
  sessaoId?: string;
  meuRole?: number;
  aoVoltar: () => void | Promise<void>;
  aoEnviarVoto?: (valor: number) => Promise<void>;
  aoRevelarVotos?: () => Promise<void>;
  aoResetarVotos?: () => Promise<void>;
  aoSelecionarHistoria?: (
    historiaId: string,
  ) => Promise<void>;
  aoEncerrarSessao?: () => Promise<void>;
  aoAnularVoto?: (votoId: string) => Promise<void>;
  aoReordenarHistorias?: (
    historias: Historia[],
  ) => Promise<void>;
}

export function SalaPlanning({
  sala,
  usuarioAtualId,
  sessaoId,
  meuRole = 2,
  aoVoltar,
  aoEnviarVoto,
  aoRevelarVotos,
  aoResetarVotos,
  aoSelecionarHistoria,
  aoEncerrarSessao,
  aoAnularVoto,
  aoReordenarHistorias,
}: SalaPlanningProps) {
  // Estados
  const [votoSelecionado, setVotoSelecionado] = useState<
    string | null
  >(null);
  const [votoConfirmado, setVotoConfirmado] =
    useState(false);
  const [votosRevelados, setVotosRevelados] =
    useState(false);
  const [historiaAtualId, setHistoriaAtualId] = useState<
    string | null
  >(null);
  const [modalVisitantesAberto, setModalVisitantesAberto] =
    useState(false);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  const eProprietario = sala.criado_por === usuarioAtualId;
  const iniciouSessao =
    sala.sessaoAtiva?.iniciada_por === usuarioAtualId;
  const podeEncerrarSessao = eProprietario || iniciouSessao;

  // Mutations
  const [
    adicionarVisitante,
    { isLoading: adicionandoVisitante },
  ] = useAdicionarParticipanteSessaoMutation();
  const [
    pesquisarPessoas,
    { data: pessoasEncontradas, isFetching },
  ] = useLazyPesquisarPorNomeOuEmailQuery();
  const [adicionarHistoriaDuranteSessao] =
    useAdicionarHistoriaDuranteSessaoMutation();

  // Verifica se está em modo prática (sem histórias)
  const emModoPratica =
    !sala.historias || sala.historias.length === 0;
  const podeAdicionarHistorias =
    meuRole === 0 || meuRole === 1;

  // Inicializar com a primeira história se existir
  useEffect(() => {
    if (
      sala.historias &&
      sala.historias.length > 0 &&
      !historiaAtualId
    ) {
      setHistoriaAtualId(sala.historias[0].id);
    }
  }, [sala.historias, historiaAtualId]);

  // Processar participantes com seus votos
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
  const participantesOnline = sala.participantes?.filter(
    (p) => p.online,
  );

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

  const handleMudarHistoria = async (
    historiaId: string,
  ) => {
    setHistoriaAtualId(historiaId);

    if (aoSelecionarHistoria) {
      await aoSelecionarHistoria(historiaId);
    }

    // Resetar votação ao mudar de história
    setVotosRevelados(false);
    setVotoSelecionado(null);
    setVotoConfirmado(false);
  };

  const handleReordenarHistorias = async (
    novasHistorias: Historia[],
  ) => {
    if (aoReordenarHistorias) {
      await aoReordenarHistorias(novasHistorias);
    }
  };

  const handleEncerrarSessao = async () => {
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

  const handleAdicionarVisitante = async (
    pessoaId: string,
  ) => {
    if (!sessaoId) {
      toast.error('Sessão não encontrada');
      return;
    }

    await adicionarVisitante({
      sessaoId: sessaoId,
      pessoaId: pessoaId,
    }).unwrap();

    toast.success('Visitante adicionado com sucesso!');
    setModalVisitantesAberto(false);
    setTermoBusca('');
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

  const handleAdicionarHistoria = async (dados: {
    titulo: string;
    descricao?: string;
  }) => {
    await adicionarHistoriaDuranteSessao({
      salaId: sala.id,
      ...dados,
    }).unwrap();
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
          <HeaderSala
            aoVoltar={aoVoltar}
            titulo={sala.titulo}
            subtitulo={sala.proprietario.nome}
            podeEncerrarSessao={podeEncerrarSessao}
            handleEncerrarSessao={handleEncerrarSessao}
            loadingAcao={loadingAcao}
          />

          {/* Lista de Histórias - apenas se não estiver em modo prática */}
          {!emModoPratica && eProprietario && (
            <div className="mt-4">
              <ListaHistorias
                historias={sala.historias}
                historiaAtualId={
                  historiaAtualId || undefined
                }
                votacaoFinalizada={votosRevelados}
                onMudarHistoria={handleMudarHistoria}
                onReordenar={handleReordenarHistorias}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-6 px-4">
        {/* Botão Adicionar História (modo prática) */}
        {emModoPratica && podeAdicionarHistorias && (
          <div className="flex justify-end">
            <DialogAdicionarHistoria
              salaId={sala.id}
              onAdicionarHistoria={handleAdicionarHistoria}
              mostrarBotao={true}
            />
          </div>
        )}

        {/* Participantes */}
        <div className="mx-auto w-11/12 sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          <div className="mb-3 flex w-full items-center justify-between">
            <h2 className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes online (
              {participantesOnline.length} /{' '}
              {sala.participantes?.length})
            </h2>
            <div className="text-sm text-gray-400">
              {totalVotos}/{participantesOnline.length}{' '}
              votaram
            </div>
          </div>

          <ListaParticipantes
            participantesOnline={participantesOnline}
            participantesComVotos={participantesComVotos}
            meuRole={meuRole}
            votosRevelados={votosRevelados}
            eProprietario={eProprietario}
            usuarioAtualId={usuarioAtualId}
            loadingAcao={loadingAcao}
            handleAnularVoto={handleAnularVoto}
          />
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

        {/* Cards de votos */}
        <CardVotos
          emModoPratica={emModoPratica}
          votosRevelados={votosRevelados}
          votoSelecionado={votoSelecionado}
          votoConfirmado={votoConfirmado}
          loadingAcao={loadingAcao}
          handleSelecionarVoto={handleSelecionarVoto}
          handleConfirmarVoto={handleConfirmarVoto}
          handleCancelarVoto={handleCancelarVoto}
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Adicionar Visitante */}
          {sessaoId && meuRole <= 1 && (
            <Button
              onClick={() => setModalVisitantesAberto(true)}
              className="flex items-center gap-2 rounded-xl bg-purple-600/20 px-4 py-3 transition-all hover:bg-purple-600/30 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">
                Adicionar Visitante
              </span>
            </Button>
          )}

          {/* Revelar/Resetar */}
          {eProprietario && !votosRevelados ? (
            <Button
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
                    : `Aguardando ${participantesOnline.length - totalVotos}`}
              </span>
            </Button>
          ) : null}

          {eProprietario && votosRevelados && (
            <Button
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
            </Button>
          )}
        </div>
      </div>

      {/* Modal Adicionar Visitante */}
      <ModalAdicionarVisitante
        open={modalVisitantesAberto}
        onOpenChange={setModalVisitantesAberto}
        termoBusca={termoBusca}
        onBuscar={handleBuscarPessoas}
        pessoas={
          pessoasEncontradas?.Resultado?.pessoas || []
        }
        carregando={isFetching}
        onAdicionar={handleAdicionarVisitante}
        adicionando={adicionandoVisitante}
      />
    </div>
  );
}
