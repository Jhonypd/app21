import React from 'react';

export type TipoFiltroStatus =
  | 'todas'
  | 'ativas'
  | 'encerradas';

interface OpcaoFiltro {
  valor: TipoFiltroStatus;
  label: string;
}

interface FiltroStatusProps {
  valor: TipoFiltroStatus;
  aoMudar: (valor: TipoFiltroStatus) => void;
}

const OPCOES: OpcaoFiltro[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'ativas', label: 'Ativas' },
  { valor: 'encerradas', label: 'Encerradas' },
];

export function FiltroStatus({
  valor,
  aoMudar,
}: FiltroStatusProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-400">Status</p>
      <div className="flex gap-2">
        {OPCOES.map((opcao) => (
          <button
            key={opcao.valor}
            onClick={() => aoMudar(opcao.valor)}
            className={`rounded-xl px-4 py-2 text-sm transition-all active:scale-95 ${
              valor === opcao.valor
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {opcao.label}
          </button>
        ))}
      </div>
    </div>
  );
}
