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

interface CriarSalaProps {
  aberto: boolean;
  aoFechar: () => void;
}

export function CriarSala({
  aberto,
  aoFechar,
}: CriarSalaProps) {
  const [nomeSala, setNomeSala] = useState('');

  const handleCriar = () => {
    if (nomeSala.trim()) {
      const codigoGerado = Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();
      alert(
        `Sala "${nomeSala}" criada com sucesso! Código: ${codigoGerado}`,
      );
      setNomeSala('');
      aoFechar();
    }
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={aoFechar}
    >
      <DialogContent className="border-slate-700 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl text-transparent">
            Criar Nova Sala
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Digite um nome para sua sala de planning poker
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="nome-sala"
              className="text-gray-300"
            >
              Nome da Sala
            </Label>
            <Input
              id="nome-sala"
              placeholder="Ex: Sprint 25 - Frontend"
              value={nomeSala}
              onChange={(e) => setNomeSala(e.target.value)}
              className="border-slate-700 bg-slate-800 text-white placeholder:text-gray-500 focus:border-purple-500"
              onKeyDown={(e) =>
                e.key === 'Enter' && handleCriar()
              }
            />
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
            onClick={handleCriar}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            disabled={!nomeSala.trim()}
          >
            Criar Sala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
