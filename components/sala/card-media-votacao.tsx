interface CardMediaVotacaoProps {
  participantesComVotos: {
    id: string;
    voto: string | null;
    votou: boolean;
  }[];
  modoVisualizacao: boolean;
}
const CardMediaVotacao = ({
  participantesComVotos,
  modoVisualizacao,
}: CardMediaVotacaoProps) => {
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
          <p className="text-xs text-gray-400">Média</p>
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
  );
};

export default CardMediaVotacao;
