'use client';
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CardSala } from './card-sala';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import type { Salas } from '@/services/types';

interface ListaSalasProps {
  salas: Salas[];
  usuarioAtualId?: string;
  aoClicarSala?: (sala: Salas) => void;
}

export function ListaSalas({
  salas,
  usuarioAtualId,
  aoClicarSala,
}: ListaSalasProps) {
  const router = useRouter();

  const handleVerTodasClick = () => {
    router.push('/salas');
  };

  return (
    <>
      {/* Section Header */}
      <div className="flex items-center justify-between pt-4">
        <h3 className="text-lg">Recentes</h3>
        <Button
          type="button"
          onClick={handleVerTodasClick}
          className="flex h-fit w-fit items-center gap-1 bg-transparent text-sm text-purple-400"
        >
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Recent Rooms - Card Stack */}
      <div className="space-y-3">
        {salas.length > 0 ? (
          salas.map((sala, index) => (
            <CardSala
              key={sala.id}
              sala={sala}
              index={index}
              usuarioAtualId={usuarioAtualId}
            />
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p>Nenhuma sala encontrada</p>
            <p className="mt-2 text-sm">
              Crie sua primeira sala para começar!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
