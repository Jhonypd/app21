'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSalaAuth } from '@/hooks/salaAuth';
import { useParams, useRouter } from 'next/navigation';
import {
  useObterDadosSessaoAtivaQuery,
  useSairDaSalaMutation,
  useSelecionarHistoriaAtualMutation,
} from '@/services/api/salas-api';
import { useSelector } from 'react-redux';
import { RootState } from '@/services/api/configs/store/store';
import Loading from '@/components/loading';
import {
  toastError,
  toastSuccess,
} from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useEffect, useState, useCallback } from 'react';
import { SalaPlanning } from '@/components/sala-planning';
import {
  useEncerrarSessaoMutation,
  useRevelarVotosMutation,
  useResetarVotosMutation,
} from '@/services/api/sessoes-api';
import { useVotarMutation } from '@/services/api/votos-api';

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import DialogConfirmacao from '@/components/dialog-confirmacao';

const PageSala = () => {
  const params = useParams();
  const router = useRouter();
  const codigoSala = params.sala as string;
  const { usuario } = useAuth();
  const {
    encerrarSessaoAtiva,
    obterSessaoAtiva,
    limparTokenSala,
  } = useSalaAuth();

  // Estados de loading
  const [loading, setLoading] = useState(false);
  const [encerrandoSessao, setEncerrandoSessao] =
    useState(false);
  const [encerrandoDialog, setEncerrandoDialog] =
    useState(false);

  // Estados de controle
  const [dialogEncerrarAberto, setDialogEncerrarAberto] =
    useState(false);
  const [skipQuery, setSkipQuery] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] =
    useState(false);
  const [historiaVisualizadaId, setHistoriaVisualizadaId] =
    useState<string | null>(null);

  // Buscar dados da sessão ativa
  const { data, isLoading, error } =
    useObterDadosSessaoAtivaQuery(codigoSala, {
      skip: !codigoSala || skipQuery,
    });

  const [encerrarSessao] = useEncerrarSessaoMutation();
  const [sairDaSala] = useSairDaSalaMutation();
  const [
    selecionarHistoriaAtual,
    { reset: resetSelecionarHistoria },
  ] = useSelecionarHistoriaAtualMutation();
  const [votar] = useVotarMutation();
  const [revelarVotos] = useRevelarVotosMutation();
  const [resetarVotos] = useResetarVotosMutation();

  // Debug: Verificar tokens do Redux
  const currentRefreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken,
  );

  useEffect(() => {
    console.log('🔐 [PageSala] Token atual do Redux:', {
      refreshTokenPreview:
        currentRefreshToken?.substring(0, 30) + '...',
      refreshTokenFull: currentRefreshToken,
    });
  }, [currentRefreshToken]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      setSkipQuery(false);
      setEncerrandoSessao(false);
    };
  }, []);

  // Tratar erros da API
  useEffect(() => {
    if (error) {
      const msg = getApiErrorMessage(error);
      toastError({
        title: msg.Mensagem,
        description: msg.Detalhe,
      });
    }
  }, [error]);

  // Helper para tratar erros consistentemente
  const tratarErro = useCallback(
    (error: unknown, titulo: string) => {
      const msg = getApiErrorMessage(error);
      toastError({
        title: titulo,
        description: msg.Detalhe,
      });
    },
    [],
  );

  // Helper para limpar e sair da sala
  const limparESair = useCallback(
    async (salaId: string) => {
      try {
        await sairDaSala(salaId).unwrap();
        encerrarSessaoAtiva(salaId);
        limparTokenSala();
        toastSuccess({
          title: 'Saiu da sala',
          description: 'Você saiu da sala com sucesso',
        });
        router.push('/salas');
      } catch (error) {
        tratarErro(error, 'Erro ao sair da sala');
        // Redireciona mesmo com erro
        router.push('/salas');
      }
    },
    [
      sairDaSala,
      encerrarSessaoAtiva,
      limparTokenSala,
      router,
      tratarErro,
    ],
  );

  // Validações
  const salaResultado = data?.Resultado?.sala;
  const usuarioId = usuario?.id ?? '';
  const sessaoAtiva = salaResultado
    ? obterSessaoAtiva(salaResultado.id)
    : null;

  // Determinar role do usuário
  const participanteAtual =
    salaResultado?.participantes?.find(
      (p) => p.id === usuario?.id,
    );
  const meuRole =
    usuario?.id === salaResultado?.criado_por
      ? 0
      : (participanteAtual?.role ?? 2);

  // Auto-selecionar primeira história ao entrar na sala
  useEffect(() => {
    const autoSelecionarPrimeiraHistoria = async () => {
      if (
        !salaResultado?.id ||
        !salaResultado.sessaoAtiva?.id ||
        salaResultado.historia_atual_id || // Já tem história selecionada
        !salaResultado.historias?.length ||
        (meuRole !== 0 && meuRole !== 1) // Apenas Dono/Admin
      ) {
        return;
      }

      const primeiraHistoria = salaResultado.historias[0];

      console.log(
        '[AUTO-SELECT] Selecionando primeira história automaticamente:',
        primeiraHistoria.titulo,
      );

      try {
        await selecionarHistoriaAtual({
          salaId: salaResultado.id,
          historiaId: primeiraHistoria.id,
        }).unwrap();
      } catch (error) {
        console.error(
          '[AUTO-SELECT] Erro ao selecionar primeira história:',
          error,
        );
      }
    };

    setTimeout(() => {
      autoSelecionarPrimeiraHistoria();
    }, 3000);
  }, [
    salaResultado?.id,
    salaResultado?.historia_atual_id,
    salaResultado?.historias,
    salaResultado?.sessaoAtiva?.id,
    meuRole,
    selecionarHistoriaAtual,
  ]);

  // Estados computados
  const estaCarregando =
    isLoading || encerrandoSessao || loading;
  const salaNaoEncontrada =
    !estaCarregando &&
    data &&
    (!data.Sucesso || !data.Resultado?.sala);

  // Handlers
  const handleVoltar = async () => {
    setLoading(true);

    if (!salaResultado) {
      router.push('/salas');
      setLoading(false);
      return;
    }

    // Se não há sessão ativa, apenas redireciona
    if (!sessaoAtiva) {
      router.push('/salas');
      setLoading(false);
      return;
    }

    await limparESair(salaResultado.id);
    setLoading(false);
  };

  const handleAbrirDialogEncerrar = async () => {
    setDialogEncerrarAberto(true);
  };

  const handleEncerrarSessao = async () => {
    if (!salaResultado || !sessaoAtiva) {
      toastError({
        title: 'Erro',
        description: 'Nenhuma sessão ativa para encerrar',
      });
      return;
    }

    try {
      setSkipQuery(true);
      setEncerrandoSessao(true);
      setEncerrandoDialog(true);

      await encerrarSessao(salaResultado.id).unwrap();

      encerrarSessaoAtiva(salaResultado.id);
      limparTokenSala();

      setDialogEncerrarAberto(false);
      toastSuccess({
        title: 'Sessão encerrada',
        description:
          'A sessão foi encerrada para todos os participantes',
      });

      router.push('/salas');
    } catch (error) {
      setDialogEncerrarAberto(false);
      setEncerrandoSessao(false);
      setEncerrandoDialog(false);
      setSkipQuery(false);
      tratarErro(error, 'Erro ao encerrar sessão');
    }
  };

  const handleEnviarVoto = async (
    valor: number,
    participaVotacao: boolean,
  ) => {
    const sessaoId = salaResultado?.sessaoAtiva?.id;
    const historiaId = salaResultado?.historia_atual_id;

    if (!sessaoId || !historiaId) {
      toastError({
        title: 'Erro ao votar',
        description:
          'Nenhuma história selecionada para votação',
      });
      return;
    }

    try {
      await votar({
        sessaoId,
        valor,
        historia_id: historiaId,
        participa_votacao: participaVotacao,
      }).unwrap();

      toastSuccess({
        description: participaVotacao
          ? 'Voto registrado com sucesso!'
          : 'Você não está participando da votação',
      });
    } catch (error: unknown) {
      tratarErro(error, 'Erro ao enviar voto');
    }
  };

  const handleRevelarVotos = async () => {
    if (!salaResultado?.sessaoAtiva?.id) {
      toastError({
        title: 'Erro',
        description: 'Nenhuma sessão ativa encontrada',
      });
      return;
    }

    try {
      await revelarVotos(
        salaResultado.sessaoAtiva.id,
      ).unwrap();
      toastSuccess({
        description: 'Votos revelados com sucesso!',
      });
    } catch (error: unknown) {
      tratarErro(error, 'Erro ao revelar votos');
    }
  };

  const handleResetarVotos = async () => {
    if (!salaResultado?.sessaoAtiva?.id) {
      toastError({
        title: 'Erro',
        description: 'Nenhuma sessão ativa encontrada',
      });
      return;
    }

    try {
      await resetarVotos(
        salaResultado.sessaoAtiva.id,
      ).unwrap();
      toastSuccess({
        description:
          'Votos resetados! Podem votar novamente.',
      });
    } catch (error: unknown) {
      tratarErro(error, 'Erro ao resetar votos');
    }
  };

  const handleSelecionarHistoria = async (
    historiaId: string,
  ) => {
    try {
      if (!salaResultado?.id) return;

      console.log(
        '🎯 [handleSelecionarHistoria] Iniciando seleção:',
        {
          salaId: salaResultado.id,
          historiaId,
          timestamp: new Date().toISOString(),
          currentRefreshToken:
            currentRefreshToken?.substring(0, 30) + '...',
        },
      );

      // Limpar cache da mutation antes de chamar
      resetSelecionarHistoria();

      await selecionarHistoriaAtual({
        salaId: salaResultado.id,
        historiaId,
      }).unwrap();

      console.log(
        '✅ [handleSelecionarHistoria] Seleção concluída com sucesso',
      );

      toastSuccess({
        title: 'História alterada',
        description:
          'Todos os participantes foram notificados',
      });
    } catch (error: unknown) {
      console.error(
        '❌ [handleSelecionarHistoria] Erro:',
        error,
      );
      tratarErro(error, 'Erro ao selecionar história');
    }
  };

  const handleModoVisualizacaoChange = (
    ativo: boolean,
    historiaId?: string,
  ) => {
    setModoVisualizacao(ativo);
    setHistoriaVisualizadaId(historiaId || null);
  };

  // Loading state
  // if (estaCarregando) {
  //   return (
  //     <Loading
  //       active
  //       type="transaction"
  //     />
  //   );
  // }

  // Sala não encontrada (só mostra após loading terminar)
  if (salaNaoEncontrada) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md space-y-6 text-center">
          <div className="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
            <XCircle className="text-destructive h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-foreground text-2xl font-bold">
              Sala não encontrada
            </h2>
            <p className="text-muted-foreground">
              A sala{' '}
              <span className="font-mono font-semibold">
                {codigoSala}
              </span>{' '}
              não existe ou você não tem permissão para
              acessá-la.
            </p>
          </div>

          <Button
            onClick={handleVoltar}
            size="lg"
            className="mt-4"
          >
            Voltar para salas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {encerrandoSessao ||
        (estaCarregando && (
          <Loading
            active
            type="transaction"
          />
        ))}

      {estaCarregando === false && (
        <SalaPlanning
          usuarioAtualId={usuarioId}
          aoVoltar={handleVoltar}
          sala={salaResultado!}
          sessaoId={sessaoAtiva ?? undefined}
          meuRole={meuRole}
          aoEnviarVoto={handleEnviarVoto}
          aoRevelarVotos={handleRevelarVotos}
          aoResetarVotos={handleResetarVotos}
          aoSelecionarHistoria={handleSelecionarHistoria}
          aoEncerrarSessao={handleAbrirDialogEncerrar}
          modoVisualizacao={modoVisualizacao}
          historiaVisualizadaId={historiaVisualizadaId}
          onModoVisualizacaoChange={
            handleModoVisualizacaoChange
          }
        />
      )}

      {/* Dialog de confirmação para encerrar sessão */}

      <DialogConfirmacao
        textoPadrao="Isso vai encerrar a sessão de Planning Poker
              para todos os participantes. Deseja continuar?"
        dialogAberto={dialogEncerrarAberto}
        setDialogAberto={setDialogEncerrarAberto}
        dialogLoading={encerrandoDialog}
        handleSubmit={handleEncerrarSessao}
        titulo="Encerrar sessão?"
      />
    </>
  );
};

export default PageSala;
