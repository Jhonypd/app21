'use client';

import React from 'react';
import {
  CheckCircle2,
  Users,
  FileText,
  Code,
} from 'lucide-react';

interface StepConclusaoProps {
  tituloSala: string;
  codigoSala: string;
  totalConvidados: number;
  totalHistorias: number;
}

export function StepConclusao({
  tituloSala,
  codigoSala,
  totalConvidados,
  totalHistorias,
}: StepConclusaoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="mb-2 text-xl">Tudo pronto!</h3>
        <p className="text-sm text-gray-400">
          Sua sessão de planning está configurada e pronta
          para começar
        </p>
      </div>

      {/* Resumo */}
      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-gray-400">
            <Code className="h-4 w-4" />
            <span className="text-xs tracking-wide uppercase">
              Sala
            </span>
          </div>
          <p className="mb-1">{tituloSala}</p>
          <p className="font-mono text-sm text-purple-400">
            {codigoSala}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-gray-400">
              <Users className="h-4 w-4" />
              <span className="text-xs tracking-wide uppercase">
                Convidados
              </span>
            </div>
            <p className="text-2xl">{totalConvidados}</p>
            <p className="text-xs text-gray-500">
              pessoa{totalConvidados !== 1 ? 's' : ''}{' '}
              convidada{totalConvidados !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-gray-400">
              <FileText className="h-4 w-4" />
              <span className="text-xs tracking-wide uppercase">
                Histórias
              </span>
            </div>
            <p className="text-2xl">{totalHistorias}</p>
            <p className="text-xs text-gray-500">
              item{totalHistorias !== 1 ? 's' : ''} para
              estimar
            </p>
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-600/10 p-4">
        <p className="mb-2 text-sm text-purple-300">
          📋 O que acontece agora?
        </p>
        <ul className="space-y-2 text-xs text-gray-400">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Os convidados receberão uma notificação para
              entrar na sala
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Você poderá selecionar histórias e iniciar a
              votação
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <span>
              Todos os participantes poderão votar
              simultaneamente
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
