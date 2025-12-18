import React from 'react';
import { BannerModoSemHistoria } from './banner-modo-sem-historias';
import { Button } from '../ui/button';
interface CardVotosProps {
  emModoPratica: boolean;
  votosRevelados: boolean;
  votoSelecionado: string | null;
  votoConfirmado: boolean;
  loadingAcao: boolean;
  handleSelecionarVoto: (carta: string) => void;
  handleConfirmarVoto: () => void;
  handleCancelarVoto: () => void;
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

const CardVotos: React.FC<CardVotosProps> = ({
  emModoPratica,
  votosRevelados,
  votoSelecionado,
  votoConfirmado,
  loadingAcao,
  handleSelecionarVoto,
  handleConfirmarVoto,
  handleCancelarVoto,
}) => {
  return (
    <div className="border-border bg-card w-full max-w-md rounded-lg border p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between px-6">
        <h2 className="text-lg">Selecione sua pontuação</h2>
        <BannerModoSemHistoria mostrar={emModoPratica} />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9">
        {CARTAS_PLANNING.map((carta) => (
          <Button
            key={carta}
            onClick={() => handleSelecionarVoto(carta)}
            disabled={votosRevelados || votoConfirmado}
            className={`aspect-[3/4] h-28 rounded-2xl border-2 transition-all active:scale-95 ${
              votoSelecionado === carta
                ? 'scale-105 border-purple-400 bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
                : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
            } ${votosRevelados || votoConfirmado ? 'cursor-not-allowed opacity-50' : ''} mx-auto flex items-center justify-center text-2xl`}
          >
            {carta}
          </Button>
        ))}
      </div>

      {votoSelecionado && !votoConfirmado && (
        <div className="mt-4 flex w-full items-center justify-between gap-4">
          <Button
            variant={'destructive'}
            onClick={handleCancelarVoto}
            className="flex max-w-52 min-w-40 items-center uppercase transition-all"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarVoto}
            disabled={loadingAcao}
            className="flex max-w-52 min-w-40 items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 py-4 uppercase transition-all hover:from-green-700 hover:to-emerald-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirmar
          </Button>
        </div>
      )}

      {votoConfirmado && !votosRevelados && (
        <div className="mt-4 rounded-xl border border-green-500/30 bg-green-600/10 px-4 py-3 text-center">
          <p className="flex items-center justify-center gap-2 text-sm text-green-400">
            Voto confirmado: {votoSelecionado}
          </p>
        </div>
      )}
    </div>
  );
};

export default CardVotos;
