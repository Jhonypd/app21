import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Users } from 'lucide-react';
import { CustomButton } from '../ui/custom-button';

interface CreateRoomModalProps {
  onCreateRoom: (roomData: {
    name: string;
    hasPassword: boolean;
    password?: string;
  }) => void;
}

export const CreateRoomModal = ({
  onCreateRoom,
}: CreateRoomModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    onCreateRoom({
      name: roomName.trim(),
      hasPassword,
      password: hasPassword ? password : undefined,
    });

    // Reset form
    setRoomName('');
    setPassword('');
    setHasPassword(false);
    setIsOpen(false);
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
              />
            </div>
          )}

          <div className="flex w-full justify-end gap-3 pt-4">
            <CustomButton
              text="Cancelar"
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
            />
            <CustomButton
              text="Criar Sala"
              variant="primary"
              type="submit"
              disabled={!roomName.trim()}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
