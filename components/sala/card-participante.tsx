import { TimerIcon, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getRoleInfo } from '@/utils/role-helpers';
import { Card, CardContent } from '../ui/card';
import {
  gerarIniciais,
  getAvatarGradient,
  getAvatarGradientPorRole,
} from '@/utils/avatar-cores-helper';

interface CardParticipanteProps {
  participante: {
    id: string;
    nome: string;
    role: number;
    online?: boolean;
  };
  jaExistia: boolean;
  meuRole?: number | null;
  mostrarAcoes?: boolean;
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
  layout?: 'horizontal' | 'vertical';
}

export function CardParticipante({
  participante,
  layout = 'horizontal',
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

  const fundoAvatar =
    participante && participante.role >= 2
      ? getAvatarGradient(participante.id)
      : getAvatarGradientPorRole(
          participante.id,
          participante.role,
        );

  // Layout Vertical
  if (layout === 'vertical') {
    return (
      <Card className="group hover:shadow-primary/10 relative w-40 overflow-hidden border-0 transition-all hover:shadow-lg">
        {/* Indicador de role no topo */}
        {isDono && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500" />
        )}
        {isAdmin && !isDono && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
        )}

        <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
          {/* Avatar */}
          <div className="relative">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${fundoAvatar} shadow-lg transition-all group-hover:scale-105`}
            >
              <span className="text-lg font-medium text-white uppercase">
                {gerarIniciais(participante.nome)}
              </span>
            </div>
          </div>

          {/* Nome */}
          <div className="w-full space-y-1">
            <p className="truncate text-sm font-medium">
              {participante.nome}
            </p>

            {/* Badge de role */}
            <Badge
              variant="outline"
              className={`text-xs ${roleInfo.badgeClass}`}
            >
              <Icon className="mr-1 h-3 w-3" />
              {roleInfo.label}
            </Badge>
          </div>

          {/* Status do voto */}
          <div className="w-full">
            {voto && votosRevelados ? (
              <div className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600/20 px-3 py-2 dark:bg-green-600/30">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {voto}
                </span>
              </div>
            ) : voto && !votosRevelados ? (
              <div className="bg-primary/20 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2">
                <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-primary text-xs">
                  Votou
                </span>
              </div>
            ) : (
              <div className="bg-muted flex items-center justify-center gap-1.5 rounded-lg px-3 py-2">
                <TimerIcon className="text-muted-foreground h-3 w-3" />
                <span className="text-muted-foreground text-xs">
                  Aguardando
                </span>
              </div>
            )}
          </div>

          {/* Ações */}
          {mostrarAcoes &&
            (podeAlterarRole || podeRemoverEste) && (
              <div className="flex w-full flex-col gap-2 border-t pt-3">
                {/* Alterar Role */}
                {podeAlterarRole &&
                  !isDono &&
                  jaExistia &&
                  onAlterarRole && (
                    <div className="flex gap-2">
                      {participante.role === 2 && (
                        <button
                          onClick={() =>
                            onAlterarRole(
                              participante.id,
                              1,
                            )
                          }
                          className="flex-1 rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs text-blue-600 transition-all hover:bg-blue-600/30 active:scale-95 dark:text-blue-400"
                        >
                          ↑ Promover
                        </button>
                      )}
                      {participante.role === 1 && (
                        <button
                          onClick={() =>
                            onAlterarRole(
                              participante.id,
                              2,
                            )
                          }
                          className="bg-muted text-muted-foreground hover:bg-muted/80 flex-1 rounded-lg px-3 py-1.5 text-xs transition-all active:scale-95"
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
                    className="bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all active:scale-95"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </button>
                )}
              </div>
            )}
        </CardContent>
      </Card>
    );
  }

  // Layout Horizontal (padrão)
  return (
    <Card className="group hover:shadow-primary/10 relative overflow-hidden transition-all hover:shadow-lg">
      {/* Indicador de role no topo */}
      {isDono && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500" />
      )}
      {isAdmin && !isDono && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
      )}

      <CardContent className="flex items-center gap-4 p-4">
        {/* Avatar com iniciais */}
        <div className="relative flex-shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${fundoAvatar} shadow-lg transition-all group-hover:scale-105`}
          >
            <span className="text-sm font-medium text-white uppercase">
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
              <div className="flex items-center gap-1.5 rounded-lg bg-green-600/20 px-2 py-1 dark:bg-green-600/30">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Votou: {voto}
                </span>
              </div>
            ) : voto && !votosRevelados ? (
              <div className="bg-primary/20 flex items-center gap-1.5 rounded-lg px-2 py-1">
                <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-primary text-xs">
                  Votou
                </span>
              </div>
            ) : (
              <div className="bg-muted flex items-center gap-1.5 rounded-lg px-2 py-1">
                <TimerIcon className="text-muted-foreground h-3 w-3" />
                <span className="text-muted-foreground text-xs">
                  Aguardando...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ações - só mostrar se mostrarAcoes = true */}
        {mostrarAcoes && (
          <div className="flex flex-shrink-0 flex-col gap-2">
            {/* Alterar Role */}
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
                      className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs text-blue-600 transition-all hover:bg-blue-600/30 active:scale-95 dark:text-blue-400"
                    >
                      ↑ Promover
                    </button>
                  )}
                  {participante.role === 1 && (
                    <button
                      onClick={() =>
                        onAlterarRole(participante.id, 2)
                      }
                      className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg px-3 py-1.5 text-xs transition-all active:scale-95"
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
                className="bg-destructive/20 text-destructive hover:bg-destructive/30 flex items-center justify-center rounded-lg p-2 transition-all hover:scale-110 active:scale-95"
                title="Remover participante"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
