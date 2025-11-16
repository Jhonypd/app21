import React from 'react';
import {
  ChevronRight,
  Share2,
  Copy,
  Crown,
  Users,
  Vote,
} from 'lucide-react';
import { copiarParaAreaTransferencia } from '@/utils/copiarTexto';

{
}
export interface DadosSala {
  votos: {
    pessoa: {
      nome: string;
      id: string;
      inativo: boolean;
    };
    id: string;
    valor: number;
  }[];
  proprietario: {
    nome: string;
    id: string;
    inativo: boolean;
  };
  titulo: string;
  id: string;
  codigo: string;
  inativo: boolean;
  data_criacao: Date;
  data_alteracao: Date | null;
  participantes: {
    pessoa_id: string;
    pessoa: {
      id: string;
      inativo: boolean;
      nome: string;
    };
  }[];
  criado_por: string;
}

interface CardSalaProps {
  sala: DadosSala;
  index: number;
  usuarioAtualId?: string; // ID do usuário logado para verificar se é proprietário
  aoClicar?: (sala: DadosSala) => void; // Callback quando clicar em entrar
}

export function CardSala({
  sala,
  index,
  usuarioAtualId,
  aoClicar,
}: CardSalaProps) {
  const copiarCodigo = (codigo: string) => {
    copiarParaAreaTransferencia(
      codigo.toString(),
      'Código copiado para a área de transferência!',
    );
  };

  const entrarNaSala = (titulo: string) => {
    if (aoClicar) {
      aoClicar(sala);
    } else {
      alert(`Entrando na sala: ${titulo}`);
    }
  };

  // Gerar avatar com iniciais do título
  const gerarAvatar = (titulo: string) => {
    const palavras = titulo.trim().split(' ');
    if (palavras.length >= 2) {
      return palavras[0][0] + palavras[1][0];
    }
    return titulo.substring(0, 2);
  };

  // Calcular tempo decorrido
  const calcularTempoDecorrido = (data: string) => {
    const agora = new Date();
    const dataAlteracao = new Date(data);
    const diferencaMs =
      agora.getTime() - dataAlteracao.getTime();

    const minutos = Math.floor(diferencaMs / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `${dias}d`;
    if (horas > 0) return `${horas}h`;
    if (minutos > 0) return `${minutos}m`;
    return 'agora';
  };

  // Gerar cor aleatória mas consistente baseada no ID
  const gerarCorAvatar = (id: string) => {
    const cores = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
    ];
    // Usar primeiro caractere do ID para escolher cor
    const index = id.charCodeAt(0) % cores.length;
    return cores[index];
  };

  const eProprietario = usuarioAtualId === sala.criado_por;
  const status =
    !sala.inativo && sala.participantes.length > 0
      ? 'active'
      : 'inactive';
  const tempoDecorrido = calcularTempoDecorrido(
    sala.data_alteracao
      ? sala.data_alteracao.toString()
      : sala.data_criacao.toString(),
  );
  const avatar = gerarAvatar(sala.titulo);
  const corAvatar = gerarCorAvatar(sala.id);

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all active:scale-98"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Live Indicator */}
      {status === 'active' && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
      )}

      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div
              className={`h-14 w-14 bg-gradient-to-br ${corAvatar} flex items-center justify-center rounded-2xl shadow-lg shadow-purple-500/50`}
            >
              <span className="text-lg uppercase">
                {avatar}
              </span>
            </div>
            {status === 'active' && (
              <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-slate-950 bg-green-500 shadow-lg shadow-green-500/50"></div>
            )}
          </div>

          <div className="min-w-0 flex-1 justify-items-start">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="truncate text-base">
                {sala.titulo}
              </h4>
              {eProprietario && (
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                  <Crown className="h-3 w-3 text-yellow-400" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-gray-400">
                <Users className="h-3 w-3" />
                {sala.participantes.length > 0
                  ? `${sala.participantes.length} ${sala.participantes.length === 1 ? 'membro' : 'membros'}`
                  : 'Sem participantes'}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">
                {tempoDecorrido}
              </span>
              {sala.votos.length > 0 && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Vote className="h-3 w-3" />
                    {sala.votos.length}
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              por {sala.proprietario.nome}
            </p>
          </div>

          <button
            onClick={() => {
              const shareText = `Entre na sala ${sala.titulo} com o código: ${sala.codigo}`;
              copiarParaAreaTransferencia(shareText);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10 active:scale-95"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => entrarNaSala(sala.titulo)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm transition-all hover:bg-purple-700 active:bg-purple-800"
            disabled={sala.inativo}
          >
            {sala.inativo ? 'Sala Inativa' : 'Entrar'}
            {!sala.inativo && (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => copiarCodigo(sala.codigo)}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 transition-all hover:bg-white/10 active:scale-95"
          >
            <Copy className="h-4 w-4" />
            <span className="font-mono text-xs">
              {sala.codigo}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
