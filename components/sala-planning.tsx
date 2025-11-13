import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  Crown,
  Share2,
} from 'lucide-react';
import { copiarParaAreaTransferencia } from '@/utils/copiarTexto';

interface Participante {
  id: string;
  nome: string;
  voto: string | null;
  votou: boolean;
}

interface SalaPlanningProps {
  sala: {
    id: string;
    codigo: number;
    titulo: string;
    criado_por: string;
    proprietario: {
      id: string;
      nome: string;
    };
  };
  usuarioAtualId: string;
  aoVoltar: () => void;
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
}: SalaPlanningProps) {
  const [participantes, setParticipantes] = useState<
    Participante[]
  >([
    {
      id: usuarioAtualId,
      nome: 'Você',
      voto: null,
      votou: false,
    },
    { id: '2', nome: 'Ana Silva', voto: '5', votou: true },
    {
      id: '3',
      nome: 'Carlos Santos',
      voto: '8',
      votou: true,
    },
    {
      id: '4',
      nome: 'Maria Costa',
      voto: null,
      votou: false,
    },
  ]);

  const [votoSelecionado, setVotoSelecionado] = useState<
    string | null
  >(null);
  const [votosRevelados, setVotosRevelados] =
    useState(false);
  const [descricaoTask, setDescricaoTask] = useState('');

  const eProprietario = sala.criado_por === usuarioAtualId;
  const todosVotaram = participantes.every((p) => p.votou);
  const totalVotos = participantes.filter(
    (p) => p.votou,
  ).length;

  const selecionarVoto = (carta: string) => {
    setVotoSelecionado(carta);
    // Atualizar voto do usuário
    setParticipantes((prev) =>
      prev.map((p) =>
        p.id === usuarioAtualId
          ? { ...p, voto: carta, votou: true }
          : p,
      ),
    );
  };

  const revelarVotos = () => {
    setVotosRevelados(true);
  };

  const resetarVotacao = () => {
    setVotosRevelados(false);
    setVotoSelecionado(null);
    setParticipantes((prev) =>
      prev.map((p) => ({ ...p, voto: null, votou: false })),
    );
  };

  const calcularMedia = () => {
    const votosNumericos = participantes
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
                copiarParaAreaTransferencia(
                  sala.codigo.toString(),
                )
              }
              className="flex items-center gap-2 rounded-xl bg-purple-600/20 px-3 py-2 transition-all hover:bg-purple-600/30 active:scale-95"
            >
              <Copy className="h-4 w-4" />
              <span className="font-mono text-xs">
                {sala.codigo}
              </span>
            </button>
          </div>

          {/* Task Description */}
          <input
            type="text"
            value={descricaoTask}
            onChange={(e) =>
              setDescricaoTask(e.target.value)
            }
            placeholder="O que estamos estimando?"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 space-y-6 px-4">
        {/* Participantes */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes ({participantes.length})
            </h2>
            <div className="text-sm text-gray-400">
              {totalVotos}/{participantes.length} votaram
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {participantes.map((participante) => (
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
                {participantes
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
          <h2 className="mb-3">Selecione sua estimativa</h2>
          <div className="grid grid-cols-4 gap-3">
            {CARTAS_PLANNING.map((carta) => (
              <button
                key={carta}
                onClick={() => selecionarVoto(carta)}
                disabled={votosRevelados}
                className={`aspect-[3/4] rounded-2xl border-2 transition-all active:scale-95 ${
                  votoSelecionado === carta
                    ? 'scale-105 border-purple-400 bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                } ${votosRevelados ? 'cursor-not-allowed opacity-50' : ''} flex items-center justify-center text-2xl`}
              >
                {carta}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!votosRevelados ? (
            <button
              onClick={revelarVotos}
              disabled={!todosVotaram}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                todosVotaram
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-98'
                  : 'cursor-not-allowed bg-white/5 opacity-50'
              } `}
            >
              <Eye className="h-5 w-5" />
              {todosVotaram
                ? 'Revelar Votos'
                : `Aguardando ${participantes.length - totalVotos} voto(s)`}
            </button>
          ) : (
            <button
              onClick={resetarVotacao}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-4 transition-all hover:from-purple-700 hover:to-pink-700 active:scale-98"
            >
              <RotateCcw className="h-5 w-5" />
              Nova Votação
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
