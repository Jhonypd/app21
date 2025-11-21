import React, { useState } from 'react';
import {
  Share2,
  Crown,
  Users,
  Edit,
  Play,
  ChevronRight,
  Copy,
  HousePlugIcon,
  UnplugIcon,
} from 'lucide-react';
import { copiarParaAreaTransferencia } from '@/utils/copiarTexto';
import { DialogEditarSala } from './dialog-editar-sala';
import {
  Salas,
  SalaParaEdicao,
  useLazyObterSalaParaEdicaoQuery,
} from '@/services/api/salas-api';
import { Button } from './ui/button';
import { toastError } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import Loading from './loading';

interface CardSalaProps {
  sala: Salas;
  index: number;
  entrarSessaoAtiva?: (
    codigo: string,
    senha?: string,
  ) => Promise<boolean>;
  abrirWizard?: (sala: Salas) => void;
  editarSala?: (dados: {
    titulo: string;
    senha?: string;
  }) => Promise<void>;
  podeIniciarSessao?: boolean; // Se o usuário pode iniciar sessão (dono ou admin)
}

export function CardSala({
  sala,
  index,
  entrarSessaoAtiva,
  abrirWizard,
  editarSala,
  podeIniciarSessao = false,
}: CardSalaProps) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dadosSala, setDadosSala] =
    useState<SalaParaEdicao | null>(null);
  const [obterSala, { isLoading: carregandoDados }] =
    useLazyObterSalaParaEdicaoQuery();

  const copiarCodigo = (codigo: string) => {
    copiarParaAreaTransferencia(codigo);
  };

  const handleAbrirDialogEditar = async () => {
    try {
      const response = await obterSala(sala.id).unwrap();
      setDadosSala(response.Resultado?.sala || null);
      setDialogAberto(true);
    } catch (error) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    }
  };

  const handleFecharDialog = () => {
    setDialogAberto(false);
    setDadosSala(null);
  };

  const entrarNaSala = async () => {
    if (entrarSessaoAtiva) {
      await entrarSessaoAtiva(sala.codigo);
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

  const eProprietario = sala.meuRole === 0;
  const tempoDecorrido = sala.data_ultima_sessao
    ? calcularTempoDecorrido(
        sala.data_ultima_sessao.toString(),
      )
    : calcularTempoDecorrido(sala.data_criacao.toString());
  const avatar = gerarAvatar(sala.titulo);
  const corAvatar = gerarCorAvatar(sala.id);

  return (
    <>
      {carregandoDados && (
        <Loading
          active
          type="transaction"
        />
      )}
      <div
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all active:scale-98"
        style={{ animationDelay: `${index * 100}ms` }}
      >
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
              {sala.status === 'online' && (
                <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-slate-950 bg-green-500 shadow-lg shadow-green-500/50"></div>
              )}
            </div>

            <div className="min-w-0 flex-1">
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
                  {sala.membros > 0
                    ? `${sala.membros} ${sala.membros === 1 ? 'membro' : 'membros'}`
                    : 'Sem membros'}
                </span>
                <span className="text-gray-600">•</span>
                <span className="">
                  {sala.status === 'online' ? (
                    <HousePlugIcon
                      className="text-green-500"
                      size={14}
                    />
                  ) : (
                    <UnplugIcon
                      className="text-gray-600"
                      size={14}
                    />
                  )}
                </span>
                <span className="text-gray-400">
                  {tempoDecorrido}
                </span>
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

            {/* Botão Editar (dono ou admin) */}
            {(sala.meuRole === 0 || sala.meuRole === 1) &&
              editarSala && (
                <Button
                  onClick={handleAbrirDialogEditar}
                  disabled={sala.inativo || carregandoDados}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    carregandoDados
                      ? 'Carregando...'
                      : 'Editar sala'
                  }
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={entrarNaSala}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm transition-all hover:bg-purple-700 active:bg-purple-800"
              disabled={
                sala.inativo || sala.status !== 'online'
              }
            >
              Entrar <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => copiarCodigo(sala.codigo)}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 transition-all hover:bg-white/10 active:scale-95"
            >
              <Copy className="h-4 w-4" />
              <span className="font-mono text-xs">
                {sala.codigo}
              </span>
            </Button>
            {podeIniciarSessao && abrirWizard && (
              <Button
                disabled={
                  sala.inativo || sala.status === 'online'
                }
                onClick={() => abrirWizard(sala)}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 transition-all hover:bg-green-700 active:scale-95 active:bg-green-800"
              >
                <Play className="h-4 w-4" />
                <span className="text-xs">Iniciar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Dialog Editar - Renderizado fora do dropdown */}
        <DialogEditarSala
          aberto={dialogAberto}
          aoFechar={handleFecharDialog}
          dadosSala={dadosSala}
          meuRole={sala.meuRole}
          aoSalvar={async (dados) => {
            if (editarSala) {
              await editarSala(dados);
            }
          }}
        />
      </div>
    </>
  );
}
