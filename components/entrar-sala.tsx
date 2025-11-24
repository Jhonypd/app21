import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface EntrarSalaProps {
  aberto: boolean;
  aoFechar: () => void;
}

export function EntrarSala({
  aberto,
  aoFechar,
}: EntrarSalaProps) {
  const [codigoSala, setCodigoSala] = useState('');

  const handleEntrar = () => {
    if (codigoSala.trim()) {
      setCodigoSala('');
      aoFechar();
    }
  };

  const formatarCodigo = (valor: string) => {
    // Converte para maiúsculas e remove caracteres especiais
    return valor
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={aoFechar}
    >
      <DialogContent className="border-slate-700 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-2xl text-transparent">
            Entrar em uma Sala
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Digite o código da sala para participar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="codigo-sala"
              className="text-gray-300"
            >
              Código da Sala
            </Label>
            <Input
              id="codigo-sala"
              placeholder="Ex: ABC123"
              value={codigoSala}
              onChange={(e) =>
                setCodigoSala(
                  formatarCodigo(e.target.value),
                )
              }
              className="border-slate-700 bg-slate-800 text-center font-mono text-lg tracking-wider text-white placeholder:text-gray-500 focus:border-blue-500"
              onKeyDown={(e) =>
                e.key === 'Enter' && handleEntrar()
              }
              maxLength={6}
            />
            <p className="text-center text-xs text-gray-500">
              O código possui até 6 caracteres
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={aoFechar}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEntrar}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
            disabled={!codigoSala.trim()}
          >
            Entrar na Sala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
