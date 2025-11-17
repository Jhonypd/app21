import React from 'react';
import { Search, X } from 'lucide-react';

interface BarraBuscaProps {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
}

export function BarraBuscaSalas({
  valor,
  aoMudar,
  placeholder = 'Buscar...',
}: BarraBuscaProps) {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-10 pl-12 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
      />
      {valor && (
        <button
          onClick={() => aoMudar('')}
          className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
