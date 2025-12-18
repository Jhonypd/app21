'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSalaAuth } from '@/hooks/salaAuth';
import { useParams, useRouter } from 'next/navigation';
import {
  useObterDadosSessaoAtivaQuery,
  useSairDaSalaMutation,
} from '@/services/api/salas-api';
import Loading from '@/components/loading';
import {
  toastError,
  toastInfo,
  toastSuccess,
} from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useEffect, useState, useCallback } from 'react';
import { SalaPlanning } from '@/components/sala-planning';
import { useEncerrarSessaoMutation } from '@/services/api/sessoes-api';

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import DialogConfirmacao from '@/components/DialogConfirmacao';

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

  // Buscar dados da sessão ativa
  const { data, isLoading, error } =
    useObterDadosSessaoAtivaQuery(codigoSala, {
      skip: !codigoSala || skipQuery,
    });

  const [encerrarSessao] = useEncerrarSessaoMutation();
  const [sairDaSala] = useSairDaSalaMutation();

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
  const meuRole =
    usuario?.id === salaResultado?.criado_por ? 0 : 2;

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

  const handleEnviarVoto = async (valor: number) => {
    try {
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'A votação será implementada após a seleção de histórias',
      });
      console.log({ salaId: salaResultado?.id, valor });
    } catch (error: unknown) {
      tratarErro(error, 'Erro ao enviar voto');
    }
  };

  const handleRevelarVotos = async () => {
    try {
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'Revelar votos será implementado com gestão de sessões',
      });
    } catch (error: unknown) {
      tratarErro(error, 'Erro ao revelar votos');
    }
  };

  const handleResetarVotos = async () => {
    try {
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'Resetar votos será implementado com gestão de sessões',
      });
    } catch (error: unknown) {
      tratarErro(error, 'Erro ao resetar votos');
    }
  };

  const handleSelecionarHistoria = async (
    historiaId: string,
  ) => {
    try {
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'Seleção de história será implementada',
      });
      console.log({
        salaId: salaResultado?.id,
        historiaId,
      });
    } catch (error: unknown) {
      tratarErro(error, 'Erro ao selecionar história');
    }
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

  // Overlay de encerramento
  if (encerrandoSessao) {
    toastInfo({
      title: 'Encerrando sessão',
      description:
        'Aguarde enquanto a sessão é encerrada para todos os participantes.',
    });
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
