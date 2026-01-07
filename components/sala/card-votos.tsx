import React, { useState } from 'react';
import { BannerModoSemHistoria } from './banner-modo-sem-historias';
import { Button } from '../ui/button';
import { toastSuccess } from '../custom-toast';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
interface CardVotosProps {
  role: number;
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
  role,
  emModoPratica,
  votosRevelados,
  votoSelecionado,
  votoConfirmado,
  loadingAcao,
  handleSelecionarVoto,
  handleConfirmarVoto,
  handleCancelarVoto,
}) => {
  const participaSempre = role === 2 || role === 3;

  const [participaVotacao, setParticipaVotacao] =
    useState(participaSempre);

  const toggleParticipacao = (ativo: boolean) => {
    if (participaSempre) return;

    setParticipaVotacao(ativo);

    if (!ativo && votoSelecionado) {
      handleCancelarVoto();
    }

    toastSuccess({
      description: ativo
        ? 'Agora você está participando da votação'
        : 'Agora você não está participando da votação',
    });
  };

  const podeVotar =
    participaVotacao && !votosRevelados && !votoConfirmado;

  return (
    <div className="border-border bg-card w-full max-w-md rounded-lg border p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between px-6">
        <h2 className="text-lg">
          {participaVotacao
            ? 'Selecione sua pontuação'
            : 'Você não está votando'}
        </h2>

        <BannerModoSemHistoria mostrar={emModoPratica} />

        {!participaSempre && (
          <div className="flex flex-col items-center gap-2">
            <Label>Votar?</Label>
            <Switch
              checked={participaVotacao}
              onCheckedChange={toggleParticipacao}
            />
          </div>
        )}
      </header>

      {participaVotacao && (
        <section
          className={
            votoSelecionado
              ? 'flex w-full p-2'
              : 'grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6'
          }
        >
          {!votoSelecionado &&
            CARTAS_PLANNING.map((carta) => (
              <Button
                key={carta}
                onClick={() => handleSelecionarVoto(carta)}
                disabled={!podeVotar}
                className="mx-auto aspect-[3/4] h-28 rounded-2xl border-2 text-2xl transition-all active:scale-95"
              >
                {carta}
              </Button>
            ))}

          {votoSelecionado && (
            <Button
              onClick={() =>
                handleSelecionarVoto(votoSelecionado)
              }
              disabled={!podeVotar}
              className="mx-auto aspect-[3/4] h-96 rounded-2xl border-2 text-9xl transition-all"
            >
              {votoSelecionado}
            </Button>
          )}
        </section>
      )}

      {votoSelecionado && !votoConfirmado && (
        <footer className="mt-4 flex justify-between gap-4">
          <Button
            variant="destructive"
            onClick={handleCancelarVoto}
            className="min-w-40 uppercase"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleConfirmarVoto}
            disabled={loadingAcao}
            className="min-w-40 bg-gradient-to-r from-green-600 to-emerald-600 uppercase"
          >
            Confirmar
          </Button>
        </footer>
      )}

      {votoConfirmado && !votosRevelados && (
        <div className="mt-4 rounded-xl border border-green-500/30 bg-green-600/10 px-4 py-3 text-center text-sm text-green-400">
          Voto confirmado: {votoSelecionado}
        </div>
      )}
    </div>
  );
};

export default CardVotos;
