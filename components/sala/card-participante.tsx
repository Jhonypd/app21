import {
  TimerIcon,
  Trash2,
  Crown,
  Shield,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { getRoleInfo } from '@/utils/role-helpers';

interface CardParticipanteProps {
  participante: {
    id: string;
    nome: string;
    role: number;
    online?: boolean;
  };
  jaExistia: boolean;
  meuRole?: number | null;
  mostrarAcoes?: boolean; // Controla se mostra botões de promover/rebaixar/remover
  onAlterarRole?: (
    pessoaId: string,
    novoRole: 1 | 2,
  ) => void;
  onRemover?: (participante: {
    id: string;
    nome: string;
  }) => void;
  voto?: string | null;
  votosRevelados?: boolean;
}

export function CardParticipante({
  participante,
  jaExistia,
  meuRole,
  mostrarAcoes = true,
  onAlterarRole,
  onRemover,
  voto,
  votosRevelados,
}: CardParticipanteProps) {
  const roleInfo = getRoleInfo(participante.role);
  const Icon = roleInfo.icon;
  const isDono = participante.role === 0;
  const isAdmin = participante.role === 1;

  // Permissões
  const podeRemover = meuRole === 0 || meuRole === 1;
  const podeAlterarRole = meuRole === 0;

  // Admin não pode remover dono ou outro admin
  const podeRemoverEste =
    podeRemover && !isDono && (meuRole === 0 || !isAdmin);

  // Gerar iniciais do nome
  const gerarIniciais = (nome: string) => {
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
      return palavras[0][0] + palavras[1][0];
    }
    return nome.substring(0, 2);
  };

  // Cor do avatar baseada no role
  const getAvatarGradient = () => {
    if (isDono) return 'from-yellow-500 to-orange-500';
    if (isAdmin) return 'from-blue-500 to-cyan-500';
    return 'from-purple-500 to-pink-500';
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/10">
      {/* Indicador de role no topo (linha colorida) */}
      {isDono && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500" />
      )}
      {isAdmin && !isDono && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
      )}

      <div className="flex items-center gap-4 p-4">
        {/* Avatar com iniciais */}
        <div className="relative flex-shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarGradient()} shadow-lg transition-all group-hover:scale-105`}
          >
            <span className="text-sm font-medium uppercase">
              {gerarIniciais(participante.nome)}
            </span>
          </div>
        </div>

        {/* Info do participante */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex w-full items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">
              {participante.nome}
            </p>

            {/* Badge de role - versão compacta */}
            <Badge
              variant="outline"
              className={`text-xs ${roleInfo.badgeClass} flex-shrink-0`}
            >
              <Icon className="mr-1 h-3 w-3" />
              {roleInfo.label}
            </Badge>
          </div>

          {/* Status do voto */}
          <div className="flex items-center gap-2">
            {voto && votosRevelados ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-green-600/20 px-2 py-1">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                <span className="text-xs font-medium text-green-400">
                  Votou: {voto}
                </span>
              </div>
            ) : voto && !votosRevelados ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-purple-600/20 px-2 py-1">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
                <span className="text-xs text-purple-400">
                  Votou
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg bg-gray-600/20 px-2 py-1">
                <TimerIcon className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  Aguardando...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ações - só mostrar se mostrarAcoes = true */}
        {mostrarAcoes && (
          <div className="flex flex-shrink-0 flex-col gap-2">
            {/* Alterar Role - apenas dono pode fazer E participante já deve existir no banco */}
            {podeAlterarRole &&
              !isDono &&
              jaExistia &&
              onAlterarRole && (
                <div className="flex gap-1">
                  {participante.role === 2 && (
                    <button
                      onClick={() =>
                        onAlterarRole(participante.id, 1)
                      }
                      className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs text-blue-400 transition-all hover:bg-blue-600/30 active:scale-95"
                    >
                      ↑ Promover
                    </button>
                  )}
                  {participante.role === 1 && (
                    <button
                      onClick={() =>
                        onAlterarRole(participante.id, 2)
                      }
                      className="rounded-lg bg-gray-600/20 px-3 py-1.5 text-xs text-gray-400 transition-all hover:bg-gray-600/30 active:scale-95"
                    >
                      ↓ Rebaixar
                    </button>
                  )}
                </div>
              )}

            {/* Remover */}
            {podeRemoverEste && onRemover && (
              <button
                onClick={() =>
                  onRemover({
                    id: participante.id,
                    nome: participante.nome,
                  })
                }
                className="flex items-center justify-center rounded-lg bg-red-600/20 p-2 text-red-400 transition-all hover:scale-110 hover:bg-red-600/30 active:scale-95"
                title="Remover participante"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
