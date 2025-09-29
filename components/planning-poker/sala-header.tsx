import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Users,
  Copy,
  Settings,
  Crown,
  Sparkles,
  Timer,
  Lock,
} from 'lucide-react';

interface SalaHeaderProps {
  titulo: string;
  codigo: number;
  senha: string | null;
  totalParticipantes: number;
  isAdmin: boolean;
  isAnimatedMode: boolean;
  onCopyRoomId: () => void;
  onSettings?: () => void;
  onToggleAnimatedMode: (enabled: boolean) => void;
}

export const SalaHeader = ({
  titulo,
  codigo,
  senha,
  totalParticipantes,
  isAdmin,
  isAnimatedMode,
  onCopyRoomId,
  onSettings,
  onToggleAnimatedMode,
}: SalaHeaderProps) => {
  return (
    <Card className="bg-gradient-card border-border shadow-card p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold">
              {titulo}
            </h1>
            {isAdmin && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 border-yellow-300 bg-yellow-500 text-black"
              >
                <Crown className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {totalParticipantes} participante
                {totalParticipantes !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Código:</span>
              <Badge
                variant="outline"
                className="font-mono text-xs"
              >
                #{codigo}
              </Badge>
            </div>

            {senha && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Lock className="h-3 w-3" />
                Protegida
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {/* Mode Toggle */}
          <div className="bg-muted/30 flex items-center gap-2 rounded-lg px-3 py-2">
            <Timer className="text-muted-foreground h-4 w-4" />
            <Label
              htmlFor="animated-mode"
              className="cursor-pointer text-sm"
            >
              Modo Animado
            </Label>
            <Switch
              id="animated-mode"
              checked={isAnimatedMode}
              onCheckedChange={onToggleAnimatedMode}
            />
            <Sparkles
              className={`h-4 w-4 transition-colors ${
                isAnimatedMode
                  ? 'text-primary animate-pulse'
                  : 'text-muted-foreground'
              }`}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onCopyRoomId}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar ID
          </Button>

          {isAdmin && onSettings && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSettings}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
