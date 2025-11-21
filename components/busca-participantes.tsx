'use client';

import React, { useState } from 'react';
import { Search, UserPlus, X, Check } from 'lucide-react';
import { Input } from './ui/input';

export interface Participante {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
}

interface BuscaParticipantesProps {
  participantesSelecionados: Participante[];
  aoMudarParticipantes: (
    participantes: Participante[],
  ) => void;
  onBuscar?: (termo: string) => Promise<Participante[]>; // Função de busca customizável
  placeholder?: string;
}

export function BuscaParticipantes({
  participantesSelecionados,
  aoMudarParticipantes,
  onBuscar,
  placeholder = 'Buscar por nome ou email...',
}: BuscaParticipantesProps) {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<
    Participante[]
  >([]);
  const [buscando, setBuscando] = useState(false);

  // Busca mock (substituir pela API real)
  const buscarParticipantesMock = async (
    termo: string,
  ): Promise<Participante[]> => {
    // Simular delay da API
    await new Promise((resolve) =>
      setTimeout(resolve, 300),
    );

    // Dados mock
    const todosMock: Participante[] = [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao.silva@example.com',
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria.santos@example.com',
      },
      {
        id: '3',
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@example.com',
      },
      {
        id: '4',
        nome: 'Ana Costa',
        email: 'ana.costa@example.com',
      },
      {
        id: '5',
        nome: 'Carlos Ferreira',
        email: 'carlos.ferreira@example.com',
      },
      {
        id: '6',
        nome: 'Juliana Lima',
        email: 'juliana.lima@example.com',
      },
    ];

    return todosMock.filter(
      (p) =>
        p.nome
          .toLowerCase()
          .includes(termo.toLowerCase()) ||
        p.email.toLowerCase().includes(termo.toLowerCase()),
    );
  };

  const handleBuscar = async (termo: string) => {
    setTermoBusca(termo);

    if (termo.trim().length < 2) {
      setResultados([]);
      return;
    }

    setBuscando(true);
    try {
      const buscarFn = onBuscar || buscarParticipantesMock;
      const resultados = await buscarFn(termo);
      setResultados(resultados);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const adicionarParticipante = (
    participante: Participante,
  ) => {
    if (
      !participantesSelecionados.find(
        (p) => p.id === participante.id,
      )
    ) {
      aoMudarParticipantes([
        ...participantesSelecionados,
        participante,
      ]);
    }
    // Limpar busca após adicionar
    setTermoBusca('');
    setResultados([]);
  };

  const removerParticipante = (id: string) => {
    aoMudarParticipantes(
      participantesSelecionados.filter((p) => p.id !== id),
    );
  };

  const participanteJaSelecionado = (id: string) => {
    return participantesSelecionados.some(
      (p) => p.id === id,
    );
  };

  const gerarIniciais = (nome: string) => {
    const palavras = nome.trim().split(' ');
    if (palavras.length >= 2) {
      return palavras[0][0] + palavras[1][0];
    }
    return nome.substring(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={termoBusca}
          onChange={(e) => handleBuscar(e.target.value)}
          className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500"
        />
        {buscando && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Resultados da Busca */}
      {resultados.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
          {resultados.map((participante) => {
            const jaSelecionado = participanteJaSelecionado(
              participante.id,
            );
            return (
              <button
                key={participante.id}
                onClick={() =>
                  !jaSelecionado &&
                  adicionarParticipante(participante)
                }
                disabled={jaSelecionado}
                className={`flex w-full items-center gap-3 border-b border-white/5 p-3 text-left transition-all last:border-b-0 ${
                  jaSelecionado
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-white/5 active:scale-[0.99]'
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <span className="text-sm uppercase">
                    {gerarIniciais(participante.nome)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {participante.nome}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {participante.email}
                  </p>
                </div>
                {jaSelecionado ? (
                  <Check className="h-5 w-5 flex-shrink-0 text-green-400" />
                ) : (
                  <UserPlus className="h-5 w-5 flex-shrink-0 text-purple-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Participantes Selecionados */}
      {participantesSelecionados.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            {participantesSelecionados.length}{' '}
            {participantesSelecionados.length === 1
              ? 'participante selecionado'
              : 'participantes selecionados'}
          </p>
          <div className="space-y-2">
            {participantesSelecionados.map(
              (participante) => (
                <div
                  key={participante.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <span className="text-sm uppercase">
                      {gerarIniciais(participante.nome)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {participante.nome}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {participante.email}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      removerParticipante(participante.id)
                    }
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400 transition-all hover:bg-red-600/30 active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {termoBusca.trim().length >= 2 &&
        resultados.length === 0 &&
        !buscando && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-gray-400">
              {`Nenhum participante encontrado para "${termoBusca}"`}
            </p>
          </div>
        )}
    </div>
  );
}
