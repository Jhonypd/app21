import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

export function Header({
  userNome,
}: {
  userNome?: string;
}) {
  const obterIniciais = () => {
    if (!userNome) return '';
    const nomes = userNome.split(' ');
    const iniciais = nomes.map((n) =>
      n.charAt(0).toUpperCase(),
    );
    return iniciais.slice(0, 2).join('');
  };
  return (
    <div className="sticky top-1 z-50 flex w-full items-center rounded-2xl bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
      <header className="z-10 w-full px-4 pt-4 pb-2">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-lg shadow-purple-500/50">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm">PlanningHub</h1>
              <p className="text-xs text-gray-600">
                Seu workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10 active:scale-95">
              <Bell className="h-5 w-5" />
              <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500"></div>
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <span className="text-sm">
                {obterIniciais()}
              </span>
            </div>
          </div>
        </div>

        {/* Greeting */}
      </header>
    </div>
  );
}
