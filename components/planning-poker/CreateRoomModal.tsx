import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Users } from 'lucide-react';
import { CustomButton } from '../ui/custom-button';
import { useAuth } from '@/hooks/useAuth';

interface CreateRoomModalProps {
  onRoomCreated?: (room: any) => void; // Callback opcional quando sala é criada
}

export const CreateRoomModal = ({
  onRoomCreated,
}: CreateRoomModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Assumindo que você tem uma forma de pegar o ID do usuário
  const { user, session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim()) return;
    if (!user?.id || !session?.access_token) {
      setError(
        'Você precisa estar logado para criar uma sala',
      );
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: hasPassword ? password : null,
          privateRoom: hasPassword,
        }),
      });

      const roomData = await response.json();

      if (!response.ok) {
        throw new Error(
          roomData?.error || 'Erro ao criar sala',
        );
      }

      if (onRoomCreated) {
        onRoomCreated(roomData);
      }

      setRoomName('');
      setPassword('');
      setHasPassword(false);
      setIsOpen(false);

      console.log('Sala criada com sucesso!', roomData);
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao criar sala',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <CustomButton
          text="Nova sala"
          variant="primary"
          icon={<Plus />}
        />
      </DialogTrigger>

      <DialogContent className="bg-muted border-border max-w-11/12 rounded-xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Criar Sala de Planning Poker
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure sua sala para estimativas de sprint.
            Você será o administrador.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 pt-4"
        >
          {error && (
            <div className="bg-destructive/15 text-destructive border-destructive/20 rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="roomName"
              className="text-foreground"
            >
              Nome da Sala
            </Label>
            <Input
              id="roomName"
              placeholder="Ex: Sprint 24 - Planning"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-background border-border"
              required
              disabled={isLoading}
            />
          </div>

          <div className="bg-muted/30 border-border flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label
                htmlFor="hasPassword"
                className="text-foreground font-medium"
              >
                Proteger com senha
              </Label>
              <p className="text-muted-foreground text-sm">
                Apenas usuários com a senha poderão entrar
              </p>
            </div>
            <Switch
              id="hasPassword"
              checked={hasPassword}
              onCheckedChange={setHasPassword}
              disabled={isLoading}
            />
          </div>

          {hasPassword && (
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-foreground"
              >
                Senha da Sala
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite uma senha"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="bg-background border-border"
                required={hasPassword}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex w-full justify-end gap-3 pt-4">
            <CustomButton
              text="Cancelar"
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            />
            <CustomButton
              text={isLoading ? 'Criando...' : 'Criar Sala'}
              variant="primary"
              type="submit"
              disabled={!roomName.trim() || isLoading}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
