import React from 'react';
import { BannerModoSemHistoria } from './banner-modo-sem-historias';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface CardVotosProps {
   role: number;
   emModoPratica: boolean;
   votosRevelados: boolean;
   votoSelecionado: string | null;
   uiDisabled: boolean;
   participaVotacao: boolean;
   modoVisualizacao?: boolean;
   onToggleParticipacao: (ativo: boolean) => Promise<void>;
   handleSelecionarVoto: (
      carta: string,
      participaVotacao: boolean,
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

const CardVotos: React.FC<CardVotosProps> = ({
   role,
   emModoPratica,
   votosRevelados,
   votoSelecionado,
   uiDisabled,
   participaVotacao,
   modoVisualizacao = false,
   onToggleParticipacao,
   handleSelecionarVoto,
}) => {
   const participaSempre = role === 2 || role === 3;
   const participaVotacaoAtual = participaSempre ? true : participaVotacao;

   const podeVotar =
      participaVotacaoAtual &&
      !votosRevelados &&
      !modoVisualizacao &&
      !uiDisabled;

   return (
      <div className="border-border bg-card mx-auto w-full max-w-md rounded-lg border p-6 shadow-sm">
         <header className="mb-4 flex items-center justify-between px-6">
            <h2 className="text-lg">
               {modoVisualizacao
                  ? 'Visualizando história anterior'
                  : participaVotacaoAtual
                    ? 'Selecione sua pontuação'
                    : 'Você não está votando'}
            </h2>

            <BannerModoSemHistoria mostrar={emModoPratica} />

            {!participaSempre && !modoVisualizacao && (
               <div className="flex flex-col items-center gap-2">
                  <Label>Votar?</Label>
                  <Switch
                     checked={participaVotacaoAtual}
                     onCheckedChange={onToggleParticipacao}
                     disabled={votosRevelados || uiDisabled}
                  />
               </div>
            )}
         </header>

         {participaVotacaoAtual && !modoVisualizacao && (
            <div
               className={
                  votoSelecionado
                     ? 'flex w-full items-center justify-center p-2'
                     : 'grid grid-cols-3 place-items-center gap-3 sm:grid-cols-4 md:grid-cols-6'
               }
            >
               {!votoSelecionado &&
                  CARTAS_PLANNING.map((carta) => (
                     <Button
                        key={carta}
                        onClick={() =>
                           handleSelecionarVoto(carta, participaVotacaoAtual)
                        }
                        disabled={!podeVotar}
                        className="mx-auto aspect-[3/4] h-28 rounded-2xl border-2 text-2xl transition-all active:scale-95"
                     >
                        {carta}
                     </Button>
                  ))}

               {votoSelecionado && (
                  <Button
                     onClick={() =>
                        handleSelecionarVoto(
                           votoSelecionado,
                           participaVotacaoAtual,
                        )
                     }
                     disabled={votosRevelados || uiDisabled}
                     className="!mx-auto aspect-[3/4] h-56 rounded-2xl border-2 text-9xl transition-all md:h-96"
                  >
                     {votoSelecionado}
                  </Button>
               )}
            </div>
         )}

         {votoSelecionado && !votosRevelados && !modoVisualizacao && (
            <div className="mt-4 rounded-xl border border-green-500/30 bg-green-600/10 px-4 py-3 text-center text-sm text-green-400">
               ✓ Voto enviado: {votoSelecionado} | Clique no card para mudar
            </div>
         )}

         {votosRevelados && votoSelecionado && !modoVisualizacao && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-600/10 px-4 py-3 text-center text-sm text-amber-400">
               Votos revelados - votação encerrada
            </div>
         )}

         {modoVisualizacao && (
            <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-600/10 px-4 py-3 text-center text-sm text-blue-400">
               Clique em &quot;VOLTAR PARA HISTORIA ATUAL&quot; para continuar
               votando
            </div>
         )}
      </div>
   );
};

export default CardVotos;
