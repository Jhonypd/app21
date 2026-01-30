'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Users,
  Eye,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { useAdicionarParticipanteSessaoMutation } from '@/services/api/sessoes-api';
import { toast } from 'sonner';
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
  participa_votacao?: boolean;
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
  historia_atual_id: string | null;
  votos_revelados: boolean;
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
  aoEnviarVoto?: (
    valor: number,
    participaVotacao: boolean,
  ) => Promise<void>;
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
  aoBuscarVotosPorHistoria?: (
    historiaId: string,
  ) => Promise<Voto[]>;
  modoVisualizacao?: boolean;
  historiaVisualizadaId?: string | null;
  onModoVisualizacaoChange?: (
    ativo: boolean,
    historiaId?: string,
  ) => void;
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
  aoBuscarVotosPorHistoria,
  modoVisualizacao = false,
  historiaVisualizadaId,
  onModoVisualizacaoChange,
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

  // Estado para votos carregados (pode ser da história atual ou de outra)
  const [votosCarregados, setVotosCarregados] = useState<
    Voto[]
  >([]);
  const [carregandoVotos, setCarregandoVotos] =
    useState(false);

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

  // Verifica se está em modo prática (sem histórias)
  const emModoPratica =
    !sala.historias || sala.historias.length === 0;

  // Ref para controlar se já buscou votos da história visualizada
  const historiaVisualizadaAnterior = useRef<
    string | null | undefined
  >(null);

  // Buscar votos quando entrar em modo visualização (história anterior)
  useEffect(() => {
    // Só buscar se a história visualizada mudou
    if (
      historiaVisualizadaId ===
      historiaVisualizadaAnterior.current
    ) {
      return;
    }
    historiaVisualizadaAnterior.current =
      historiaVisualizadaId;

    const buscarVotosHistoriaVisualizada = async () => {
      if (
        modoVisualizacao &&
        historiaVisualizadaId &&
        aoBuscarVotosPorHistoria
      ) {
        setCarregandoVotos(true);
        try {
          const votos = await aoBuscarVotosPorHistoria(
            historiaVisualizadaId,
          );
          setVotosCarregados(votos);
        } catch (error) {
          console.error(
            'Erro ao buscar votos da história visualizada:',
            error,
          );
          setVotosCarregados([]);
        } finally {
          setCarregandoVotos(false);
        }
      } else if (!modoVisualizacao) {
        // Voltou do modo visualização, restaurar votos da sala
        setVotosCarregados(sala.votos || []);
      }
    };

    buscarVotosHistoriaVisualizada();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoVisualizacao, historiaVisualizadaId]);

  // Sincronizar votos da sala quando não estiver em modo visualização
  useEffect(() => {
    if (!modoVisualizacao) {
      setVotosCarregados(sala.votos || []);
    }
  }, [sala.votos, modoVisualizacao]);

  // Inicializar com a história atual da sala (ou primeira se não houver)
  useEffect(() => {
    if (
      sala.historias &&
      sala.historias.length > 0 &&
      !historiaAtualId
    ) {
      // Priorizar historia_atual_id da sala
      const historiaInicial = sala.historia_atual_id
        ? sala.historia_atual_id
        : sala.historias[0].id;
      setHistoriaAtualId(historiaInicial);
    }
  }, [
    sala.historias,
    sala.historia_atual_id,
    historiaAtualId,
  ]);

  // Usar votos carregados (pode ser da história visualizada ou atual)
  const votosAtivos = votosCarregados;

  // Processar participantes com seus votos
  const participantesComVotos = (sala.participantes || [])
    .filter((p) => !p.inativo)
    .map((participante) => {
      const voto = votosAtivos.find(
        (v) => v.pessoa_id === participante.id,
      );
      // Definir se deve participar da votação:
      // - Membros e Observadores (role 2, 3) sempre participam
      // - Donos/Admin (role 0, 1) participam se participa_votacao !== false
      const deveParticipar =
        participante.role === 2 ||
        participante.role === 3 ||
        (participante.role <= 1 &&
          participante.participa_votacao !== false);

      return {
        id: participante.id,
        nome: participante.nome,
        voto: voto ? voto.valor.toString() : null,
        votou: !!voto,
        votoId: voto?.id,
        deveParticipar,
      };
    });

  // Verificar se o usuário atual já votou (usando votos ativos)
  const votoUsuario = votosAtivos.find(
    (v) => v.pessoa_id === usuarioAtualId,
  );

  // Atualizar estado do voto quando mudar o voto do usuário
  const votoUsuarioId = votoUsuario?.id;
  const votoUsuarioValor = votoUsuario?.valor;
  useEffect(() => {
    if (votoUsuarioId && votoUsuarioValor !== undefined) {
      setVotoSelecionado(votoUsuarioValor.toString());
      setVotoConfirmado(true);
    } else {
      // Se não há voto do usuário (mudou de história), resetar estado
      setVotoSelecionado(null);
      setVotoConfirmado(false);
    }
  }, [votoUsuarioId, votoUsuarioValor]);

  const todosVotaram = participantesComVotos
    .filter((p) => p.deveParticipar)
    .every((p) => p.votou);
  const totalVotos = participantesComVotos.filter(
    (p) => p.votou,
  ).length;
  const totalDevemVotar = participantesComVotos.filter(
    (p) => p.deveParticipar,
  ).length;
  const participantesOnline = sala.participantes?.filter(
    (p) => p.online,
  );

  // Handlers
  const handleSelecionarVoto = (carta: string) => {
    // Desabilitar seleção se estiver em modo visualização
    if (votoConfirmado || modoVisualizacao) return;

    if (votoSelecionado === carta) {
      setVotoSelecionado(null);
    } else {
      setVotoSelecionado(carta);
    }
  };

  const handleConfirmarVoto = async (
    participaVotacao: boolean,
  ) => {
    // Desabilitar confirmação se estiver em modo visualização
    if (
      !votoSelecionado ||
      votoConfirmado ||
      modoVisualizacao
    )
      return;

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
        await aoEnviarVoto(valorNumerico, participaVotacao);
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
    // debugger;
    setHistoriaAtualId(historiaId);

    // Buscar votos da história selecionada
    if (aoBuscarVotosPorHistoria) {
      setCarregandoVotos(true);
      try {
        const votos =
          await aoBuscarVotosPorHistoria(historiaId);
        setVotosCarregados(votos);
      } catch (error) {
        console.error(
          'Erro ao buscar votos da história:',
          error,
        );
        setVotosCarregados([]);
      } finally {
        setCarregandoVotos(false);
      }
    }

    if (aoSelecionarHistoria) {
      await aoSelecionarHistoria(historiaId);
    }

    // Resetar estado de votação revelada ao mudar de história
    setVotosRevelados(false);
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

          <div className="mt-4">
            <ListaHistorias
              role={meuRole}
              historias={sala.historias}
              historiaAtualId={historiaAtualId || undefined}
              votacaoFinalizada={votosRevelados}
              onMudarHistoria={handleMudarHistoria}
              onReordenar={handleReordenarHistorias}
              onModoVisualizacaoChange={
                onModoVisualizacaoChange
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6 px-4">
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
              {carregandoVotos ? (
                <span className="animate-pulse">
                  Carregando votos...
                </span>
              ) : (
                `${totalVotos}/${totalDevemVotar} votaram`
              )}
            </div>
          </div>

          <ListaParticipantes
            participantesOnline={participantesOnline}
            participantesComVotos={participantesComVotos}
            meuRole={meuRole}
            votosRevelados={
              votosRevelados || modoVisualizacao
            }
            handleAnularVoto={handleAnularVoto}
          />
        </div>

        {/* Resultados - mostrar quando votos revelados OU em modo visualização (história já votada) */}
        {(votosRevelados || modoVisualizacao) &&
          votosCarregados.length > 0 && (
            <div
              className={`rounded-2xl border p-4 ${
                modoVisualizacao
                  ? 'border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-cyan-600/20'
                  : 'border-purple-500/30 bg-gradient-to-br from-purple-600/20 to-pink-600/20'
              }`}
            >
              <h3 className="mb-2 text-sm text-gray-300">
                {modoVisualizacao
                  ? 'Resultado da História'
                  : 'Resultado da Votação'}
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
          role={meuRole}
          emModoPratica={emModoPratica}
          votosRevelados={votosRevelados}
          votoSelecionado={votoSelecionado}
          votoConfirmado={votoConfirmado}
          loadingAcao={loadingAcao}
          sessaoId={sessaoId}
          participaVotacaoInicial={
            sala.participantes?.find(
              (p) => p.id === usuarioAtualId,
            )?.participa_votacao
          }
          modoVisualizacao={modoVisualizacao}
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

          {/* Revelar/Resetar - desabilitado em modo visualização */}
          {eProprietario &&
          !votosRevelados &&
          !modoVisualizacao ? (
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
                    : `Aguardando ${totalDevemVotar - totalVotos}`}
              </span>
            </Button>
          ) : null}

          {eProprietario &&
            votosRevelados &&
            !modoVisualizacao && (
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
