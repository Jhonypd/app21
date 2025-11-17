import React from 'react';

import {
  Ordenacao,
  TipoOrdenacao,
} from './opcao-ordenacao';
import {
  FiltroStatus,
  TipoFiltroStatus,
} from './opcao-filtro';

interface PainelFiltrosProps {
  visivel: boolean;
  statusSelecionado: TipoFiltroStatus;
  ordenacaoSelecionada: TipoOrdenacao;
  aoMudarStatus: (valor: TipoFiltroStatus) => void;
  aoMudarOrdenacao: (valor: TipoOrdenacao) => void;
}

export function PainelFiltros({
  visivel,
  statusSelecionado,
  ordenacaoSelecionada,
  aoMudarStatus,
  aoMudarOrdenacao,
}: PainelFiltrosProps) {
  if (!visivel) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 mt-4 space-y-3 duration-200">
      <FiltroStatus
        valor={statusSelecionado}
        aoMudar={aoMudarStatus}
      />

      <Ordenacao
        valor={ordenacaoSelecionada}
        aoMudar={aoMudarOrdenacao}
      />
    </div>
  );
}
