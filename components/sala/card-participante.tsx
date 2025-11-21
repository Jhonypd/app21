import { Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getRoleInfo } from '@/utils/role-helpers';

interface CardParticipanteProps {
  participante: {
    id: string;
    nome: string;
    role: number;
  };
  jaExistia: boolean;
  meuRole?: number | null;
  onAlterarRole: (
    pessoaId: string,
    novoRole: 1 | 2,
  ) => void;
  onRemover: (participante: {
    id: string;
    nome: string;
  }) => void;
}

export function CardParticipante({
  participante,
  jaExistia,
  meuRole,
  onAlterarRole,
  onRemover,
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

  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-full bg-white/10 p-2 ${roleInfo.color}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-medium">
            {participante.nome}
          </p>
          <Badge
            variant="outline"
            className={`mt-1 ${roleInfo.badgeClass}`}
          >
            {roleInfo.label}
          </Badge>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {/* Alterar Role - apenas dono pode fazer E participante já deve existir no banco */}
        {podeAlterarRole && !isDono && jaExistia && (
          <div className="flex gap-1">
            {participante.role === 2 && (
              <button
                onClick={() =>
                  onAlterarRole(participante.id, 1)
                }
                className="rounded-lg bg-blue-600/20 px-3 py-1 text-xs text-blue-400 transition-all hover:bg-blue-600/30 active:scale-95"
              >
                Promover
              </button>
            )}
            {participante.role === 1 && (
              <button
                onClick={() =>
                  onAlterarRole(participante.id, 2)
                }
                className="rounded-lg bg-gray-600/20 px-3 py-1 text-xs text-gray-400 transition-all hover:bg-gray-600/30 active:scale-95"
              >
                Rebaixar
              </button>
            )}
          </div>
        )}

        {/* Remover */}
        {podeRemoverEste && (
          <button
            onClick={() =>
              onRemover({
                id: participante.id,
                nome: participante.nome,
              })
            }
            className="rounded-lg bg-red-600/20 p-2 text-red-400 transition-all hover:bg-red-600/30 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
