'use client';

import React from 'react';
import { Info, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface MenuPerfilProps {
  usuario: {
    nome: string;
    email: string;
  };
  versaoApp?: string;
  aoSair: () => void;
  children?: React.ReactNode;
}

export function MenuPerfil({
  usuario,
  versaoApp = '1.0.0.0',
  aoSair,
  children,
}: MenuPerfilProps) {
  // Gerar iniciais do nome
  const gerarIniciais = (nome: string) => {
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
      return palavras[0][0] + palavras[1][0];
    }
    return nome.substring(0, 2);
  };

  const iniciais = gerarIniciais(usuario.nome);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50 active:scale-95">
            <span className="text-sm uppercase">
              {iniciais}
            </span>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="max-w-72 border-white/20 bg-slate-900 p-0 text-white"
      >
        {/* Header com informações do usuário */}
        <div className="border-b border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <span className="text-base uppercase">
                {iniciais}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate">{usuario.nome}</p>
              <p className="truncate text-xs text-gray-400">
                {usuario.email}
              </p>
            </div>
          </div>

          {/* Versão */}
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Info className="h-4 w-4 text-purple-400" />
            <div className="flex flex-1 items-center gap-1">
              <p className="text-xs text-gray-400">V</p>
              <p className="font-mono text-xs text-purple-300">
                {versaoApp}
              </p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="p-2">
          <DropdownMenuItem
            onClick={aoSair}
            className="cursor-pointer justify-center rounded-lg text-red-400 focus:bg-red-500/10 focus:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
