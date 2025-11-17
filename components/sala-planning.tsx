'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  Eye,
  RotateCcw,
  Copy,
  Crown,
  Share2,
  Check,
  X,
  ListTodo,
  ChevronRight,
} from 'lucide-react';
import { copiarParaAreaTransferencia } from '@/utils/copiarTexto';

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
}

interface SalaPlanningProps {
  sala: SalaData;
  usuarioAtualId: string;
  aoVoltar: () => void;
  aoEnviarVoto?: (valor: number) => Promise<void>;
  aoRevelarVotos?: () => Promise<void>;
  aoResetarVotos?: () => Promise<void>;
  aoSelecionarHistoria?: (
    historiaId: string,
  ) => Promise<void>;
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
  aoVoltar,
  aoEnviarVoto,
  aoRevelarVotos,
  aoResetarVotos,
  aoSelecionarHistoria,
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
  const [mostrarHistorias, setMostrarHistorias] =
    useState(false);
  const [loadingAcao, setLoadingAcao] = useState(false);

  const eProprietario = sala.criado_por === usuarioAtualId;

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
  const participantesComVotos = sala.participantes
    .filter((p) => !p.inativo)
    .map((participante) => {
      const voto = sala.votos.find(
        (v) => v.pessoa_id === participante.id,
      );
      return {
        id: participante.id,
        nome: participante.nome,
        voto: voto ? voto.valor.toString() : null,
        votou: !!voto,
      };
    });

  // Verificar se o usuário atual já votou
  const votoUsuario = sala.votos.find(
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
    if (votoConfirmado) return; // Não permite mudar voto já confirmado

    // Se clicar na mesma carta, desseleciona
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
      // Converter voto para número (? = 0, ☕ = -1)
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
    if (votoConfirmado) return; // Não permite cancelar voto já confirmado
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

  const calcularMedia = () => {
    const votosNumericos = participantesComVotos
      .map((p) => p.voto)
      .filter((v) => v && !isNaN(Number(v)))
      .map(Number);

    if (votosNumericos.length === 0) return null;

    const soma = votosNumericos.reduce((a, b) => a + b, 0);
    return (soma / votosNumericos.length).toFixed(1);
  };
  console.log(eProprietario);
  console.log(sala.historias);
  console.log(sala);
  return (
    <div className="min-h-screen bg-slate-950 pb-6 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <button
              onClick={aoVoltar}
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

            <button
              onClick={() =>
                copiarParaAreaTransferencia(sala.codigo)
              }
              className="flex items-center gap-2 rounded-xl bg-purple-600/20 px-3 py-2 transition-all hover:bg-purple-600/30 active:scale-95"
            >
              <Copy className="h-4 w-4" />
              <span className="font-mono text-xs">
                {sala.codigo}
              </span>
            </button>
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

                {/* Lista de Histórias */}
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

          {/* Descrição da História Atual */}
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

          <div className="grid grid-cols-2 gap-3">
            {participantesComVotos.map((participante) => (
              <div
                key={participante.id}
                className="relative rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <span className="text-sm uppercase">
                      {participante.nome.substring(0, 2)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {participante.nome}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {participante.votou ? (
                        votosRevelados ? (
                          <span className="rounded-lg bg-purple-600 px-2 py-1 font-mono text-xs">
                            {participante.voto}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            ✓ Votou
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-gray-500">
                          Aguardando...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resultados (quando revelado) */}
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

          {/* Botão de Confirmar Voto */}
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
        <div className="space-y-3">
          {eProprietario && !votosRevelados ? (
            <button
              onClick={handleRevelarVotos}
              disabled={!todosVotaram || loadingAcao}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                todosVotaram
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-98'
                  : 'cursor-not-allowed bg-white/5 opacity-50'
              }`}
            >
              <Eye className="h-5 w-5" />
              {loadingAcao
                ? 'Revelando...'
                : todosVotaram
                  ? 'Revelar Votos'
                  : `Aguardando ${participantesComVotos.length - totalVotos} voto(s)`}
            </button>
          ) : null}

          {eProprietario && votosRevelados && (
            <button
              onClick={handleResetarVotacao}
              disabled={loadingAcao}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 transition-all hover:from-purple-700 hover:to-pink-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-5 w-5" />
              {loadingAcao
                ? 'Resetando...'
                : 'Nova Votação'}
            </button>
          )}

          <button
            onClick={() => {
              const shareText = `Participe da sala "${sala.titulo}" no PlanningHub! Código: ${sala.codigo}`;
              copiarParaAreaTransferencia(shareText);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-4 transition-all hover:bg-white/10 active:scale-95"
          >
            <Share2 className="h-5 w-5" />
            Convidar Participantes
          </button>
        </div>
      </div>
    </div>
  );
}
