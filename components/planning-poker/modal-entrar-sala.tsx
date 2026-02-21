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
import { LogIn, Users } from 'lucide-react';
import { ButtonCustom } from '../button-custom';

interface ModalEntrarSalaProps {
  EntrarSala: (DadosSala: {
    sala_id: string;
    nome: string;
    senha?: string;
  }) => void;
}

export const ModalEntrarSala = ({
  EntrarSala,
}: ModalEntrarSalaProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [salaId, setSalaId] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaId.trim() || !userName.trim()) return;

    EntrarSala({
      sala_id: salaId.trim().toUpperCase(),
      nome: userName.trim(),
      senha: password || undefined,
    });

    // Reset form
    setSalaId('');
    setUserName('');
    setPassword('');
    setNeedsPassword(false);
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <ButtonCustom
          icon={<LogIn className="h-5 w-5" />}
          text="Entrar na sala"
          variant="default"
        />
      </DialogTrigger>

      <DialogContent className="bg-accent border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Entrar em Sala Existente
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Digite o ID da sala e seu nome para participar
            das estimativas.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 pt-4"
        >
          <div className="space-y-2">
            <Label
              htmlFor="roomId"
              className="text-foreground"
            >
              ID da Sala
            </Label>
            <Input
              id="salaId"
              placeholder="Ex: ABC123"
              value={salaId}
              onChange={(e) =>
                setSalaId(e.target.value.toUpperCase())
              }
              className="bg-background border-border font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="userName"
              className="text-foreground"
            >
              Seu Nome
            </Label>
            <Input
              id="userName"
              placeholder="Ex: João Silva"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-background border-border"
              required
            />
          </div>

          {needsPassword && (
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
                placeholder="Digite a senha"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="bg-background border-border"
                required={needsPassword}
              />
            </div>
          )}

          <div className="flex w-full justify-end gap-3 pt-4">
            <ButtonCustom
              type="button"
              variant="outline"
              text="Cancelar"
              onClick={() => setIsOpen(false)}
            />

            <ButtonCustom
              text="Entrar na Sala"
              variant="default"
              type="submit"
              disabled={!salaId.trim() || !userName.trim()}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
