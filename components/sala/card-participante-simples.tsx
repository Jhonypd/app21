import {
  gerarIniciais,
  getAvatarGradient,
} from '@/utils/avatar-cores-helper';
import { CheckCircle2 } from 'lucide-react';

interface Participante {
  id: string;
  nome: string;
  inativo: boolean;
  role: number;
  online?: boolean;
}

function CardVotacaoSimples({
  participante,
  voto,
  votou,
  votosRevelados,
}: {
  participante: Participante;
  voto: string | null;
  votou: boolean;
  votosRevelados: boolean;
}) {
  const mostrarVoto = votou && votosRevelados;
  const fundoAvatar = getAvatarGradient(participante.id);

  return (
    <div className="perspective-1000 h-36 w-full">
      <div
        className={`transform-style-3d relative h-full w-full transition-transform duration-700 ${
          mostrarVoto ? 'rotate-y-180' : ''
        }`}
      >
        {/* Frente - Avatar */}
        <div className="border-border bg-card absolute inset-0 rounded-xl border p-3 shadow-sm transition-all backface-hidden hover:shadow-md">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            {/* Avatar */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${fundoAvatar} shadow-lg transition-transform hover:scale-105`}
            >
              <span className="text-base font-bold text-white uppercase">
                {gerarIniciais(participante.nome)}
              </span>
            </div>

            {/* Nome */}
            <p className="text-foreground w-full truncate text-center text-sm font-medium">
              {participante.nome}
            </p>

            {/* Status - Votou */}
            {votou && !votosRevelados && (
              <div className="bg-primary/20 flex items-center gap-1.5 rounded-full px-2.5 py-1">
                <CheckCircle2 className="text-primary h-3.5 w-3.5" />
                <span className="text-primary text-xs font-medium">
                  Votou
                </span>
              </div>
            )}

            {/* Status - Aguardando */}
            {!votou && (
              <div className="bg-muted flex items-center gap-1.5 rounded-full px-2.5 py-1">
                <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full" />
                <span className="text-muted-foreground text-xs">
                  Aguardando
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verso - Voto */}
        <div className="border-primary from-primary/20 via-primary/10 absolute inset-0 rotate-y-180 rounded-xl border-2 bg-gradient-to-br to-transparent p-3 shadow-lg backface-hidden">
          <div className="flex h-full flex-col items-center justify-center gap-3">
            {/* Voto grande */}
            <div className="bg-primary ring-primary/20 flex h-16 w-16 items-center justify-center rounded-xl shadow-lg ring-2">
              <span className="text-primary-foreground text-3xl font-bold">
                {voto}
              </span>
            </div>

            {/* Nome */}
            <p className="text-foreground line-clamp-2 w-full text-center text-xs font-medium">
              {participante.nome}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardVotacaoSimples;
