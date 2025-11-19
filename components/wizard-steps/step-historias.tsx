'use client';

import React, { useState } from 'react';
import {
  Plus,
  Upload,
  X,
  FileText,
  Trash2,
} from 'lucide-react';

interface Historia {
  id: string;
  titulo: string;
  descricao: string;
}

interface StepHistoriasProps {
  salaId: string;
  historias: Historia[];
  aoMudarHistorias: (historias: Historia[]) => void;
}

export function StepHistorias({
  salaId,
  historias,
  aoMudarHistorias,
}: StepHistoriasProps) {
  const [modoAdicao, setModoAdicao] = useState(false);
  const [novaHistoria, setNovaHistoria] = useState({
    titulo: '',
    descricao: '',
  });

  const handleAdicionar = () => {
    if (!novaHistoria.titulo.trim()) return;

    const historia: Historia = {
      id: Date.now().toString(),
      titulo: novaHistoria.titulo,
      descricao: novaHistoria.descricao,
    };

    aoMudarHistorias([...historias, historia]);
    setNovaHistoria({ titulo: '', descricao: '' });
    setModoAdicao(false);
  };

  const handleRemover = (id: string) => {
    aoMudarHistorias(historias.filter((h) => h.id !== id));
  };

  const handleImportarCSV = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const linhas = text
        .split('\n')
        .filter((l) => l.trim());

      // Pular cabeçalho se existir
      const dados = linhas.slice(1);

      const historiasImportadas: Historia[] = dados.map(
        (linha, index) => {
          const [titulo, descricao] = linha
            .split(',')
            .map((s) => s.trim());
          return {
            id: `imported-${Date.now()}-${index}`,
            titulo: titulo || `História ${index + 1}`,
            descricao: descricao || '',
          };
        },
      );

      aoMudarHistorias([
        ...historias,
        ...historiasImportadas,
      ]);
    };
    reader.readAsText(file);

    // Limpar input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-400" />
          Adicionar Histórias
        </h3>
        <p className="text-sm text-gray-400">
          Crie histórias manualmente ou importe de um
          arquivo CSV
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <button
          onClick={() => setModoAdicao(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 py-3 text-sm transition-all hover:bg-purple-600/20"
        >
          <Plus className="h-4 w-4" />
          Nova História
        </button>

        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm transition-all hover:bg-white/10">
          <Upload className="h-4 w-4" />
          Importar CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImportarCSV}
            className="hidden"
          />
        </label>
      </div>

      {/* Formulário de nova história */}
      {modoAdicao && (
        <div className="space-y-3 rounded-xl border border-purple-500/30 bg-purple-600/10 p-4">
          <input
            type="text"
            value={novaHistoria.titulo}
            onChange={(e) =>
              setNovaHistoria({
                ...novaHistoria,
                titulo: e.target.value,
              })
            }
            placeholder="Título da história *"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
          />
          <textarea
            value={novaHistoria.descricao}
            onChange={(e) =>
              setNovaHistoria({
                ...novaHistoria,
                descricao: e.target.value,
              })
            }
            placeholder="Descrição (opcional)"
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdicionar}
              disabled={!novaHistoria.titulo.trim()}
              className="flex-1 rounded-lg bg-purple-600 py-2 text-sm transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setModoAdicao(false);
                setNovaHistoria({
                  titulo: '',
                  descricao: '',
                });
              }}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm transition-all hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de histórias */}
      {historias.length > 0 ? (
        <div>
          <p className="mb-3 text-sm text-gray-400">
            {historias.length} história
            {historias.length > 1 ? 's' : ''} adicionada
            {historias.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {historias.map((historia) => (
              <div
                key={historia.id}
                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="mb-1 text-sm">
                      {historia.titulo}
                    </p>
                    {historia.descricao && (
                      <p className="text-xs text-gray-400">
                        {historia.descricao}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      handleRemover(historia.id)
                    }
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/0 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-500" />
          <p className="text-sm text-gray-400">
            Nenhuma história adicionada ainda
          </p>
          <p className="text-xs text-gray-500">
            Adicione histórias manualmente ou importe um CSV
          </p>
        </div>
      )}

      {/* Dica sobre formato CSV */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-600/10 p-3">
        <p className="mb-1 text-xs text-blue-300">
          💡 Formato do CSV
        </p>
        <p className="text-xs text-gray-400">
          Cada linha deve conter:{' '}
          <code className="text-blue-300">
            titulo,descricao
          </code>
        </p>
        <p className="text-xs text-gray-500">
          Exemplo:{' '}
          <code>
            Implementar login,Criar tela de login com
            autenticação
          </code>
        </p>
      </div>
    </div>
  );
}
