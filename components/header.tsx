import React from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { MenuPerfil } from './menu-perfil';
import { DadosContaPessoa } from '@/services/api/pessoas.api';

interface HeaderProps {
  usuario: DadosContaPessoa | null;
  logout: () => void;
}

export function Header({ usuario, logout }: HeaderProps) {
  // const { logout, usuario, isAuthenticated } = useAuth();

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

            <MenuPerfil
              aoSair={logout}
              usuario={{
                email: usuario?.email || '',
                nome: usuario?.nome || '',
              }}
            />
          </div>
        </div>

        {/* Greeting */}
      </header>
    </div>
  );
}
