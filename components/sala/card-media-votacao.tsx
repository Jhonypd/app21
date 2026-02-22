import { Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface CardMediaVotacaoProps {
  votos: {
    id: string;
    valor: number;
    pessoa_id: string;
    pessoa: {
      nome: string;
      inativo: boolean;
    };
  }[];
  modoVisualizacao: boolean;
  carregandoVotos: boolean;
}
const CardMediaVotacao = ({
  votos,
  modoVisualizacao,
  carregandoVotos,
}: CardMediaVotacaoProps) => {
  const calcularMedia = () => {
    const votosNumericos = votos
      .map((p) => p.valor)
      .filter((v) => v && !isNaN(Number(v)))
      .map(Number);

    if (votosNumericos.length === 0) return null;

    const soma = votosNumericos.reduce((a, b) => a + b, 0);
    return (soma / votosNumericos.length).toFixed(1);
  };
  return (
    <div
      className={`rounded-2xl border p-4 ${
        modoVisualizacao
          ? 'border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-cyan-600/20'
          : 'border-purple-500/30 bg-gradient-to-br from-purple-600/20 to-pink-600/20'
      }`}
    >
      <div className="mb-2 flex items-center justify-between text-sm text-gray-300">
        <h3>
          {modoVisualizacao
            ? 'Resultado da História'
            : 'Resultado da Votação'}
        </h3>
        {carregandoVotos && (
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Atualizando votos
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-400">Média</p>
          <p
            className={`text-3xl transition-opacity ${carregandoVotos ? 'opacity-50' : 'opacity-100'}`}
          >
            {carregandoVotos
              ? '...'
              : calcularMedia() || '—'}
          </p>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          {carregandoVotos && votos.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 w-8 rounded-lg bg-white/5"
              />
            ))
          ) : votos.length === 0 ? (
            <div className="w-full rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-gray-400">
              Nenhum voto registrado
            </div>
          ) : (
            votos
              .filter((p) => !p.pessoa.inativo)
              .map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg bg-white/10 px-3 py-1"
                >
                  <span className="font-mono text-sm">
                    {p.valor}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CardMediaVotacao;
