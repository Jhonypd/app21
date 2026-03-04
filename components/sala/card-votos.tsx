import React, { useState, useEffect } from 'react';
import { BannerModoSemHistoria } from './banner-modo-sem-historias';
import { Button } from '../ui/button';
import { toastSuccess, toastError } from '../custom-toast';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useAtualizarParticipaVotacaoMutation } from '@/services/api/sessoes-api';
import Loading from '../loading';

interface CardVotosProps {
   role: number;
   emModoPratica: boolean;
   votosRevelados: boolean;
   votoSelecionado: string | null;
   loadingAcao: boolean;
   sessaoId?: string;
   participaVotacaoInicial?: boolean;
   modoVisualizacao?: boolean;
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
   sessaoId,
   participaVotacaoInicial,
   modoVisualizacao = false,
   handleSelecionarVoto,
}) => {
   const participaSempre = role === 2 || role === 3;

   const [participaVotacao, setParticipaVotacao] = useState(
      participaSempre ? true : (participaVotacaoInicial ?? true),
   );

   const [atualizarParticipaVotacao, { isLoading }] =
      useAtualizarParticipaVotacaoMutation();

   // Atualizar estado quando prop mudar
   useEffect(() => {
      if (!participaSempre && participaVotacaoInicial !== undefined) {
         setParticipaVotacao(participaVotacaoInicial);
      }
   }, [participaVotacaoInicial, participaSempre]);

   const toggleParticipacao = async (ativo: boolean) => {
      if (participaSempre) return;

      setParticipaVotacao(ativo);

      // Chamar API para persistir a mudança
      if (sessaoId) {
         try {
            await atualizarParticipaVotacao({
               sessaoId,
               participaVotacao: ativo,
            }).unwrap();

            toastSuccess({
               description: ativo
                  ? 'Agora você está participando da votação'
                  : 'Agora você não está participando da votação',
            });
         } catch (error) {
            if (process.env.NODE_ENV === 'development') {
               console.error(
                  'Erro ao atualizar participação na votação:',
                  error,
               );
            }
            toastError({
               title: 'Erro ao atualizar participação',
               description: 'Tente novamente',
            });
            // Reverter estado em caso de erro
            setParticipaVotacao(!ativo);
         }
      } else {
         toastSuccess({
            description: ativo
               ? 'Agora você está participando da votação'
               : 'Agora você não está participando da votação',
         });
      }
   };

   const podeVotar = participaVotacao && !votosRevelados && !modoVisualizacao;

   return (
      <>
         {isLoading && (
            <Loading
               active
               type="transaction"
            />
         )}
         <div className="border-border bg-card mx-auto w-full max-w-md rounded-lg border p-6 shadow-sm">
            <header className="mb-4 flex items-center justify-between px-6">
               <h2 className="text-lg">
                  {modoVisualizacao
                     ? 'Visualizando história anterior'
                     : participaVotacao
                       ? 'Selecione sua pontuação'
                       : 'Você não está votando'}
               </h2>

               <BannerModoSemHistoria mostrar={emModoPratica} />

               {!participaSempre && !modoVisualizacao && (
                  <div className="flex flex-col items-center gap-2">
                     <Label>Votar?</Label>
                     <Switch
                        checked={participaVotacao}
                        onCheckedChange={toggleParticipacao}
                        disabled={votosRevelados}
                     />
                  </div>
               )}
            </header>

            {participaVotacao && !modoVisualizacao && (
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
                              handleSelecionarVoto(carta, participaVotacao)
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
                              participaVotacao,
                           )
                        }
                        disabled={votosRevelados}
                        className="!mx-auto aspect-[3/4] h-56 rounded-2xl border-2 text-9xl transition-all md:h-96"
                     >
                        {votoSelecionado}
                     </Button>
                  )}
               </div>
            )}

            {votoSelecionado && !votosRevelados && !modoVisualizacao && (
               <div className="mt-4 rounded-xl border border-green-500/30 bg-green-600/10 px-4 py-3 text-center text-sm text-green-400">
                  ✓ Voto enviado: {votoSelecionado} | Clique novamente para
                  cancelar
               </div>
            )}

            {votosRevelados && votoSelecionado && !modoVisualizacao && (
               <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-600/10 px-4 py-3 text-center text-sm text-amber-400">
                  Votos revelados - votação encerrada
               </div>
            )}

            {modoVisualizacao && (
               <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-600/10 px-4 py-3 text-center text-sm text-blue-400">
                  Clique em &quot;VOLTAR PARA HISTORIA ATUAL&quot; para
                  continuar votando
               </div>
            )}
         </div>
      </>
   );
};

export default CardVotos;
