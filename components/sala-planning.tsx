'use client';

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { Eye, RotateCcw, UserPlus } from 'lucide-react';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { useAdicionarParticipanteSessaoMutation } from '@/services/api/sessoes-api';
import { toast } from 'sonner';
import { ModalAdicionarVisitante } from './sala/modal-adicionar-visitante';
import { Button } from './ui/button';
import CardVotos from './sala/card-votos';
import ListaParticipantes from './sala/lista-participantes';
import HeaderSala from './sala/header-sala';
import { ListaHistorias } from './sala/lista-historias';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import CardMediaVotacao from './sala/card-media-votacao';

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
  jaFoiVotada: boolean;
  voto: number[] | [];
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

const VOTO_MAP: Record<string, number> = {
  '?': 0,
  '☕': -1,
  '1': 1,
  '2': 2,
  '3': 3,
  '5': 5,
  '8': 8,
  '13': 13,
  '21': 21,
  '34': 34,
  '55': 55,
  '89': 89,
};

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
  const [votoRascunho, setVotoRascunho] = useState<
    string | null
  >(null);
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
  const requestVotosIdRef = useRef(0);
  const buscaPessoasTimerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);
  const votosRevelados = modoVisualizacao
    ? true
    : sala.votos_revelados;

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
        const reqId = ++requestVotosIdRef.current;
        setCarregandoVotos(true);
        try {
          const votos = await aoBuscarVotosPorHistoria(
            historiaVisualizadaId,
          );
          if (reqId !== requestVotosIdRef.current) return;
          console.log(
            '[historia]',
            historiaVisualizadaId,
            'antes de setar votos',
          );
          setVotosCarregados(votos);
          console.log(
            '[historia]',
            historiaVisualizadaId,
            'depois de setar votos',
          );
        } catch (error) {
          if (reqId !== requestVotosIdRef.current) return;
          console.error(
            'Erro ao buscar votos da história visualizada:',
            error,
          );
          setVotosCarregados([]);
        } finally {
          if (reqId !== requestVotosIdRef.current) return;
          setCarregandoVotos(false);
        }
      } else if (!modoVisualizacao) {
        // Voltou do modo visualização, restaurar votos da sala
        requestVotosIdRef.current += 1;
        console.log(
          '[historia]',
          sala.historia_atual_id,
          'antes de setar votos',
        );
        setVotosCarregados(sala.votos || []);
        console.log(
          '[historia]',
          sala.historia_atual_id,
          'depois de setar votos',
        );
      }
    };

    buscarVotosHistoriaVisualizada();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoVisualizacao, historiaVisualizadaId]);

  // Sincronizar votos da sala quando não estiver em modo visualização
  useEffect(() => {
    if (!modoVisualizacao) {
      requestVotosIdRef.current += 1;
      console.log(
        '[historia]',
        sala.historia_atual_id,
        'antes de setar votos',
      );
      setVotosCarregados(sala.votos || []);
      console.log(
        '[historia]',
        sala.historia_atual_id,
        'depois de setar votos',
      );
    }
  }, [sala.votos, modoVisualizacao, sala.historia_atual_id]);

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
  const votosAtivos = useMemo(
    () =>
      modoVisualizacao
        ? votosCarregados
        : votosCarregados ?? sala.votos ?? [],
    [modoVisualizacao, votosCarregados, sala.votos],
  );

  const votosPorPessoaId = useMemo(
    () =>
      new Map(votosAtivos.map((voto) => [voto.pessoa_id, voto])),
    [votosAtivos],
  );

  // Processar participantes com seus votos
  const participantesComVotos = useMemo(
    () =>
      (sala.participantes || [])
        .filter((p) => !p.inativo)
        .map((participante) => {
          const voto = votosPorPessoaId.get(participante.id);
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
        }),
    [sala.participantes, votosPorPessoaId],
  );

  // Verificar se o usuário atual já votou (usando votos ativos)
  const votoUsuario = votosPorPessoaId.get(usuarioAtualId);
  const votoDoServidor = votoUsuario?.valor;
  const votoConfirmado = !!votoUsuario;
  const votoSelecionado = votoConfirmado
    ? votoDoServidor !== undefined
      ? votoDoServidor.toString()
      : null
    : votoRascunho;

  const todosVotaram = useMemo(
    () =>
      participantesComVotos
        .filter((p) => p.deveParticipar)
        .every((p) => p.votou),
    [participantesComVotos],
  );
  const totalVotosParticipantes = useMemo(
    () =>
      participantesComVotos.filter(
        (p) => p.deveParticipar && p.votou,
      ).length,
    [participantesComVotos],
  );
  const totalDevemVotar = useMemo(
    () =>
      participantesComVotos.filter((p) => p.deveParticipar)
        .length,
    [participantesComVotos],
  );
  const participantesOnline = sala.participantes?.filter(
    (p) => p.online,
  );

  // Handlers
  const handleSelecionarVoto = (carta: string) => {
    // Desabilitar seleção se estiver em modo visualização
    if (votoConfirmado || modoVisualizacao) return;

    if (votoSelecionado === carta) {
      setVotoRascunho(null);
    } else {
      setVotoRascunho(carta);
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
      const valorNumerico = VOTO_MAP[votoSelecionado];
      if (valorNumerico === undefined) {
        toast.error('Voto inválido');
        return;
      }

      if (aoEnviarVoto) {
        await aoEnviarVoto(valorNumerico, participaVotacao);
      }
    } catch (error) {
      console.error('Erro ao confirmar voto:', error);
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleCancelarVoto = () => {
    if (votoConfirmado) return;
    setVotoRascunho(null);
  };

  const handleRevelarVotos = async () => {
    if (!todosVotaram) return;

    setLoadingAcao(true);
    try {
      if (aoRevelarVotos) {
        await aoRevelarVotos();
      }
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
      setVotoRascunho(null);
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
    setVotoRascunho(null);

    // Buscar votos da história selecionada
    if (aoBuscarVotosPorHistoria) {
      const reqId = ++requestVotosIdRef.current;
      setCarregandoVotos(true);
      try {
        const votos =
          await aoBuscarVotosPorHistoria(historiaId);
        if (reqId !== requestVotosIdRef.current) return;
        console.log(
          '[historia]',
          historiaId,
          'antes de setar votos',
        );
        setVotosCarregados(votos);
        console.log(
          '[historia]',
          historiaId,
          'depois de setar votos',
        );
      } catch (error) {
        if (reqId !== requestVotosIdRef.current) return;
        console.error(
          'Erro ao buscar votos da história:',
          error,
        );
        setVotosCarregados([]);
      } finally {
        if (reqId !== requestVotosIdRef.current) return;
        setCarregandoVotos(false);
      }
    }

    if (aoSelecionarHistoria) {
      await aoSelecionarHistoria(historiaId);
    }

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

  const handleBuscarPessoas = (termo: string) => {
    setTermoBusca(termo);
    if (buscaPessoasTimerRef.current) {
      clearTimeout(buscaPessoasTimerRef.current);
    }
    if (termo.length < 2) {
      return;
    }
    buscaPessoasTimerRef.current = setTimeout(() => {
      pesquisarPessoas({ termo });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (buscaPessoasTimerRef.current) {
        clearTimeout(buscaPessoasTimerRef.current);
      }
    };
  }, []);

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
            <Badge
              variant={'neutral'}
              className="text-sm"
            >
              {carregandoVotos ? (
              <Skeleton className="h-4 w-20 border-transparent bg-gray-500 p-1 text-white hover:bg-gray-600" />
            ) : (
                `${totalVotosParticipantes} / ${totalDevemVotar} votaram`
              )}
            </Badge>
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
        </div>

        {/* Resultados - mostrar quando votos revelados OU em modo visualização (história já votada) */}
        {(votosRevelados || modoVisualizacao) &&
          votosCarregados.length > 0 && (
            <CardMediaVotacao
              modoVisualizacao={modoVisualizacao}
              participantesComVotos={participantesComVotos}
            />
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
                    : `Aguardando ${totalDevemVotar - totalVotosParticipantes}`}
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
