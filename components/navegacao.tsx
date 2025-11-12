import React from 'react';
import { Home, Search, BarChart, User } from 'lucide-react';

interface NavegacaoProps {
  abaAtiva: string;
  aoMudarAba: (aba: string) => void;
}

export function Navegacao({
  abaAtiva,
  aoMudarAba,
}: NavegacaoProps) {
  const abas = [
    { id: 'home', label: 'Início', icone: Home },
    { id: 'search', label: 'Buscar', icone: Search },
    { id: 'stats', label: 'Stats', icone: BarChart },
    { id: 'profile', label: 'Perfil', icone: User },
  ];

  return (
    <nav className="fixed right-4 bottom-4 left-4 z-50 rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-1 p-2">
        {abas.map((aba) => {
          const Icone = aba.icone;
          return (
            <button
              key={aba.id}
              onClick={() => aoMudarAba(aba.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 transition-all ${
                abaAtiva === aba.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-400 active:bg-white/5'
              }`}
            >
              <Icone className="h-5 w-5" />
              <span className="text-xs">{aba.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
