import React from 'react';
import {
  Clock,
  TrendingUp,
  Users,
  LucideIcon,
} from 'lucide-react';

export type TipoOrdenacao =
  | 'recentes'
  | 'antigas'
  | 'participantes';

interface OpcaoOrdenacao {
  valor: TipoOrdenacao;
  label: string;
  icone: LucideIcon;
}

interface OrdenacaoProps {
  valor: TipoOrdenacao;
  aoMudar: (valor: TipoOrdenacao) => void;
}

const OPCOES: OpcaoOrdenacao[] = [
  { valor: 'recentes', label: 'Recentes', icone: Clock },
  { valor: 'antigas', label: 'Antigas', icone: TrendingUp },
  {
    valor: 'participantes',
    label: 'Participantes',
    icone: Users,
  },
];

export function Ordenacao({
  valor,
  aoMudar,
}: OrdenacaoProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-400">
        Ordenar por
      </p>
      <div className="flex flex-wrap gap-2">
        {OPCOES.map((opcao) => {
          const Icone = opcao.icone;
          return (
            <button
              key={opcao.valor}
              onClick={() => aoMudar(opcao.valor)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all active:scale-95 ${
                valor === opcao.valor
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Icone className="h-4 w-4" />
              {opcao.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
