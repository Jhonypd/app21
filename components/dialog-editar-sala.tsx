'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog';

interface DialogEditarSalaProps {
  tituloAtual: string;
  senhaAtual: string | null;
  salaPrivada: boolean;
  aoSalvar: (dados: {
    titulo: string;
    senha?: string;
  }) => Promise<void>;
  children?: React.ReactNode;
}

export function DialogEditarSala({
  tituloAtual,
  senhaAtual,
  salaPrivada,
  aoSalvar,
  children,
}: DialogEditarSalaProps) {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState(tituloAtual);
  const [senha, setSenha] = useState(senhaAtual || '');
  const [alterarSenha, setAlterarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aberto) {
      setTitulo(tituloAtual);
      setSenha(senhaAtual || '');
      setAlterarSenha(false);
    }
  }, [aberto, tituloAtual, senhaAtual]);

  const handleSalvar = async () => {
    if (!titulo.trim()) return;

    setLoading(true);
    try {
      const dados: { titulo: string; senha?: string } = {
        titulo: titulo.trim(),
      };

      if (salaPrivada && alterarSenha) {
        dados.senha = senha;
      }

      await aoSalvar(dados);
      setAberto(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={setAberto}
    >
      <DialogTrigger asChild>
        {children || (
          <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm transition-all hover:bg-white/10">
            <Edit className="h-4 w-4" />
            Editar
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="border-white/20 bg-slate-900 text-white sm:max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Editar Sala</h2>
            <button
              onClick={() => setAberto(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-all hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Título da Sala *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Sprint Planning Q4"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
              />
            </div>

            {/* Senha (apenas se sala for privada) */}
            {salaPrivada && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm text-gray-300">
                    Senha
                  </label>
                  {!alterarSenha && (
                    <button
                      onClick={() => setAlterarSenha(true)}
                      className="text-xs text-purple-400 transition-all hover:text-purple-300"
                    >
                      Alterar senha
                    </button>
                  )}
                </div>

                {alterarSenha ? (
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) =>
                        setSenha(e.target.value)
                      }
                      placeholder="Nova senha"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setAlterarSenha(false);
                        setSenha(senhaAtual || '');
                      }}
                      className="text-xs text-gray-400 transition-all hover:text-gray-300"
                    >
                      Cancelar alteração
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
                    <Lock className="h-4 w-4" />
                    <span>••••••••</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2">
            <button
              onClick={() => setAberto(false)}
              className="flex-1 rounded-xl bg-white/5 py-3 text-sm transition-all hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={!titulo.trim() || loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-sm transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
