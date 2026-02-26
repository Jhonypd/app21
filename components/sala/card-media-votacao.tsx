import { Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { VotosPorHistoriaResponse } from '@/services/types';
import { Badge } from '../ui/badge';

interface CardMediaVotacaoProps {
   listaVotos: VotosPorHistoriaResponse | null;
   modoVisualizacao: boolean;
   carregandoVotos: boolean;
}

const CardNumbers = ({
   value,
   carregandoVotos,
   mediaDisponivel,
   titulo,
}: {
   value: number | string;
   carregandoVotos: boolean;
   mediaDisponivel: boolean;
   titulo: string;
}) => {
   return (
      <div className="flex flex-col items-center justify-center gap-2">
         <p className="text-xs text-gray-400">{titulo}</p>
         {carregandoVotos && !mediaDisponivel ? (
            <Skeleton className="h-10 w-10 bg-white/5" />
         ) : (
            <p
               className={`text-3xl transition-opacity ${carregandoVotos ? 'opacity-50' : 'opacity-100'}`}
            >
               {value}
            </p>
         )}
      </div>
   );
};

const CardMediaVotacao = ({
   listaVotos,
   modoVisualizacao,
   carregandoVotos,
}: CardMediaVotacaoProps) => {
   const votos = Array.isArray(listaVotos?.votos)
      ? (listaVotos?.votos ?? [])
      : [];
   const possuiVotos = votos.length > 0;
   const mediaDisponivel = typeof listaVotos?.media === 'number';
   const pontoDisponivel = typeof listaVotos?.voto_vencedor === 'number';
   const mediaDisplay = mediaDisponivel
      ? Number(listaVotos?.media).toFixed(1)
      : '--';
   const pontoDisplay = pontoDisponivel ? listaVotos?.voto_vencedor : '--';

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
         <div className="flex gap-4">
            <div className="flex gap-4 rounded-sm bg-white/5 p-2">
               <CardNumbers
                  titulo="Pontuação"
                  value={pontoDisplay}
                  carregandoVotos={carregandoVotos}
                  mediaDisponivel={pontoDisponivel}
               />
               <CardNumbers
                  titulo="Média"
                  value={mediaDisplay}
                  carregandoVotos={carregandoVotos}
                  mediaDisponivel={mediaDisponivel}
               />
            </div>
            <div className="flex h-full w-full flex-wrap items-start gap-2">
               {carregandoVotos && !possuiVotos ? (
                  Array.from({ length: 3 }).map((_, i) => (
                     <Skeleton
                        key={i}
                        className="h-8 w-8 rounded-lg bg-white/5"
                     />
                  ))
               ) : !possuiVotos ? (
                  <div className="w-full rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-gray-400">
                     Nenhum voto registrado
                  </div>
               ) : (
                  votos
                     .filter((p) => !p.pessoa.inativo)
                     .map((p) => (
                        <Badge
                           key={p.id}
                           className="w-10 rounded-lg px-3 py-1"
                           variant={'secondary'}
                        >
                           <span className="font-mono text-sm">{p.valor}</span>
                        </Badge>
                     ))
               )}
            </div>
         </div>
      </div>
   );
};

export default CardMediaVotacao;
