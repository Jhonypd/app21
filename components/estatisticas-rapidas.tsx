import React from 'react';

export function EstatisticasRapidas() {
  const estatisticas = [
    { valor: '12', label: 'Salas criadas', cor: 'purple' },
    { valor: '47', label: 'Participações', cor: 'pink' },
    { valor: '234', label: 'Votos dados', cor: 'blue' },
    {
      valor: '3',
      label: 'Ao vivo agora',
      cor: 'green',
      aoVivo: true,
    },
  ];

  const obterClassesCor = (cor: string) => {
    const cores = {
      purple:
        'bg-gradient-to-br from-purple-600/30 to-purple-600/10 border-purple-500/30',
      pink: 'bg-gradient-to-br from-pink-600/30 to-pink-600/10 border-pink-500/30',
      blue: 'bg-gradient-to-br from-blue-600/30 to-blue-600/10 border-blue-500/30',
      green:
        'bg-gradient-to-br from-green-600/30 to-green-600/10 border-green-500/30',
    };
    return cores[cor as keyof typeof cores] || cores.purple;
  };

  return (
    <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
      {estatisticas.map((stat, index) => (
        <div
          key={index}
          className={`w-32 flex-shrink-0 rounded-2xl border p-4 backdrop-blur-xl ${obterClassesCor(stat.cor)}`}
        >
          <div className="mb-1 flex items-center gap-1">
            {stat.aoVivo && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            )}
            <div className="text-3xl">{stat.valor}</div>
          </div>
          <div className="text-xs text-gray-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
