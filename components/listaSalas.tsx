import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CardSala, DadosSala } from './cardSala';

interface ListaSalasProps {
  salas: DadosSala[];
  usuarioAtualId?: string;
}

export function ListaSalas({
  salas,
  usuarioAtualId,
}: ListaSalasProps) {
  return (
    <>
      {/* Section Header */}
      <div className="flex items-center justify-between pt-4">
        <h3 className="text-lg">Recentes</h3>
        <button className="flex items-center gap-1 text-sm text-purple-400">
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </button>
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
