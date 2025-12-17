'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { SearchInput } from '@/components/inputs/input-search';
import { ModalBase } from './modal-base';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
}

interface ModalAdicionarVisitanteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termoBusca: string;
  onBuscar: (termo: string) => void;
  pessoas: Pessoa[];
  carregando: boolean;
  onAdicionar: (pessoaId: string) => Promise<void>;
  adicionando: boolean;
}

export function ModalAdicionarVisitante({
  open,
  onOpenChange,
  termoBusca,
  onBuscar,
  pessoas,
  carregando,
  onAdicionar,
  adicionando,
}: ModalAdicionarVisitanteProps) {
  const [pessoaSelecionadaId, setPessoaSelecionadaId] =
    useState('');

  const handleClose = () => {
    setPessoaSelecionadaId('');
    onOpenChange(false);
  };

  const handleAdicionar = async () => {
    if (!pessoaSelecionadaId) return;
    await onAdicionar(pessoaSelecionadaId);
    setPessoaSelecionadaId('');
  };

  return (
    <ModalBase
      open={open}
      onOpenChange={handleClose}
      titulo="Adicionar Visitante"
      maxWidth="lg"
      botoes={
        <>
          <button
            onClick={handleClose}
            className="rounded-lg bg-slate-700 px-4 py-2 transition-all hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdicionar}
            disabled={!pessoaSelecionadaId || adicionando}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {adicionando ? 'Adicionando...' : 'Adicionar'}
          </button>
        </>
      }
    >
      {/* Campo de busca */}
      <SearchInput
        placeholder="Buscar por nome ou email..."
        value={termoBusca}
        onChange={(e) => onBuscar(e.target.value)}
        disabled={carregando}
        className="border-slate-700 bg-slate-800 text-white"
      />

      {/* Lista de resultados */}
      {carregando && (
        <p className="text-center text-sm text-gray-400">
          Buscando...
        </p>
      )}

      {pessoas && pessoas.length > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {pessoas.map((pessoa) => (
            <button
              key={pessoa.id}
              onClick={() =>
                setPessoaSelecionadaId(pessoa.id)
              }
              className={`w-full rounded-lg border p-3 text-left transition-all ${
                pessoaSelecionadaId === pessoa.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <p className="font-medium">{pessoa.nome}</p>
              <p className="text-sm text-gray-400">
                {pessoa.email}
              </p>
            </button>
          ))}
        </div>
      )}

      {!carregando &&
        pessoas.length === 0 &&
        termoBusca.length >= 2 && (
          <p className="text-center text-sm text-gray-400">
            Nenhuma pessoa encontrada
          </p>
        )}
    </ModalBase>
  );
}
