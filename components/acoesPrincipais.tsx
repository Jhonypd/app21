import React from 'react';
import {
  Plus,
  Search,
  Zap,
  ChevronRight,
} from 'lucide-react';

interface AcoesPrincipaisProps {
  aoClicarCriar: () => void;
  aoClicarEntrar: () => void;
}

export function AcoesPrincipais({
  aoClicarCriar,
  aoClicarEntrar,
}: AcoesPrincipaisProps) {
  return (
    <div className="space-y-3">
      {/* Create - Hero Action */}
      <button
        onClick={aoClicarCriar}
        className="group relative w-full rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 shadow-2xl shadow-purple-500/50 transition-all duration-200 active:scale-98"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 blur-xl transition-opacity group-active:opacity-50"></div>
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Plus className="h-8 w-8" />
          </div>
          <div className="flex-1 text-left">
            <div className="mb-0.5 text-xl">Criar Sala</div>
            <div className="text-sm text-white/80">
              Iniciar nova sessão de planning
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </button>

      {/* Join & Quick Access Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={aoClicarEntrar}
          className="group relative rounded-2xl bg-gradient-to-br from-blue-600/90 to-cyan-600/90 p-5 shadow-xl shadow-blue-500/30 backdrop-blur-xl transition-all active:scale-95"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Search className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="mb-0.5">Entrar</div>
            <div className="text-xs text-white/80">
              Usar código
            </div>
          </div>
        </button>

        <button className="group relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl transition-all active:scale-95">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
            <Zap className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div className="mb-0.5">Última</div>
            <div className="truncate text-xs text-gray-400">
              Sprint 24
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
