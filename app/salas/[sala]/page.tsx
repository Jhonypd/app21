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
  toastSuccess,
} from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useEffect, useState } from 'react';
import { SalaPlanning } from '@/components/sala-planning';
import { useEncerrarSessaoMutation } from '@/services/api/sessoes-api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const PageSala = () => {
  const params = useParams();
  const router = useRouter();
  const codigoSala = params.sala as string;
  const { usuario } = useAuth();
  const {
    encerrarSessaoAtiva,
    obterSessaoAtiva,
    limparTokenSala,
    sessoesAtivas,
  } = useSalaAuth();

  // Estado para controle de diálogo de confirmação
  const [dialogEncerrarAberto, setDialogEncerrarAberto] =
    useState(false);

  // Estado para controlar se deve pular a query (após encerrar sessão)
  const [skipQuery, setSkipQuery] = useState(false);

  // Estado para controlar redirecionamento após encerrar
  const [encerrandoSessao, setEncerrandoSessao] =
    useState(false);

  // Buscar dados da sessão ativa (com histórias e votos filtrados)
  const { data, isLoading, error } =
    useObterDadosSessaoAtivaQuery(codigoSala, {
      skip: !codigoSala || skipQuery,
    });

  const [encerrarSessao] = useEncerrarSessaoMutation();
  const [sairDaSala] = useSairDaSalaMutation();

  useEffect(() => {
    if (error) {
      const msg = getApiErrorMessage(error);
      toastError({
        title: msg.Mensagem,
        description: msg.Detalhe,
      });
    }
  }, [error]);

  const handleVoltar = async () => {
    if (!data?.Resultado?.sala) {
      router.push('/salas');
      return;
    }

    const sala = data.Resultado.sala;
    const sessaoAtiva = obterSessaoAtiva(sala.id);

    // Se não há sessão ativa, apenas redireciona
    if (!sessaoAtiva) {
      router.push('/salas');
      return;
    }

    try {
      // Sair da sala (marca offline, mas mantém autorização)
      await sairDaSala(sala.id).unwrap();

      // Limpar sessão do Redux
      encerrarSessaoAtiva(sala.id);

      // Limpar token do cookie
      limparTokenSala();

      toastSuccess({
        title: 'Saiu da sala',
        description: 'Você saiu da sala com sucesso',
      });
      router.push('/salas');
    } catch (error) {
      const msg = getApiErrorMessage(error);
      toastError({
        title: 'Erro ao sair da sala',
        description: msg.Detalhe,
      });
      // Redireciona mesmo com erro
      router.push('/salas');
    }
  };

  const handleEncerrarSessao = async () => {
    if (!data?.Resultado?.sala) return;

    const sala = data.Resultado.sala;
    const sessaoAtiva = obterSessaoAtiva(sala.id);

    if (!sessaoAtiva) {
      toastError({
        title: 'Erro',
        description: 'Nenhuma sessão ativa para encerrar',
      });
      return;
    }

    try {
      // Desabilitar query antes de encerrar (evita revalidação automática)
      setSkipQuery(true);
      setEncerrandoSessao(true);

      await encerrarSessao(sala.id).unwrap();

      // Limpar estado local
      encerrarSessaoAtiva(sala.id);
      limparTokenSala();

      setDialogEncerrarAberto(false);
      toastSuccess({
        title: 'Sessão encerrada',
        description:
          'A sessão foi encerrada para todos os participantes',
      });

      // Redirecionar
      router.push('/salas');
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setDialogEncerrarAberto(false);
      setEncerrandoSessao(false);
      // Reabilitar query em caso de erro
      setSkipQuery(false);
      toastError({
        title: 'Erro ao encerrar sessão',
        description: msg.Detalhe,
      });
    }
  };

  if (isLoading || encerrandoSessao) {
    return (
      <Loading
        active
        type="transaction"
      />
    );
  }

  if (!data?.Sucesso || !data.Resultado?.sala) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="text-center">
          <p className="mb-2 text-lg">
            Sala não encontrada
          </p>
          <button
            onClick={handleVoltar}
            className="rounded-xl bg-purple-600 px-4 py-2 transition-all hover:bg-purple-700"
          >
            Voltar para salas
          </button>
        </div>
      </div>
    );
  }

  const salaResultado = data.Resultado.sala;
  const usuarioId = usuario?.id ?? '';
  const sessaoAtiva = obterSessaoAtiva(salaResultado.id);

  // Determinar role do usuário (baseado em criado_por temporariamente)
  // TODO: Buscar role real da API
  const meuRole =
    usuario?.id === salaResultado.criado_por ? 0 : 2;

  const handleEnviarVoto = async (valor: number) => {
    try {
      // TODO: Obter sessão ativa e historia_sessao_id atual
      // Por enquanto, mostrar erro que precisa de história ativa
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'A votação será implementada após a seleção de histórias',
      });
      console.log({ salaId: salaResultado.id, valor });
    } catch (error: unknown) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    }
  };

  const handleRevelarVotos = async () => {
    try {
      // TODO: Obter sessão ativa
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'Revelar votos será implementado com gestão de sessões',
      });
    } catch (error: unknown) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    }
  };

  const handleResetarVotos = async () => {
    try {
      // TODO: Obter sessão ativa
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'Resetar votos será implementado com gestão de sessões',
      });
    } catch (error: unknown) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    }
  };

  const handleSelecionarHistoria = async (
    historiaId: string,
  ) => {
    try {
      // TODO: Marcar história como ativa na sessão atual
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'Seleção de história será implementada',
      });
      console.log({ salaId: salaResultado.id, historiaId });
    } catch (error: unknown) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    }
  };

  return (
    <>
      <SalaPlanning
        usuarioAtualId={usuarioId}
        aoVoltar={handleVoltar}
        sala={salaResultado}
        sessaoId={sessaoAtiva ?? undefined}
        meuRole={meuRole}
        aoEnviarVoto={handleEnviarVoto}
        aoRevelarVotos={handleRevelarVotos}
        aoResetarVotos={handleResetarVotos}
        aoSelecionarHistoria={handleSelecionarHistoria}
        aoEncerrarSessao={async () =>
          setDialogEncerrarAberto(true)
        }
      />

      {/* Dialog de confirmação para encerrar sessão */}
      <Dialog
        open={dialogEncerrarAberto}
        onOpenChange={setDialogEncerrarAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar sessão?</DialogTitle>
            <DialogDescription>
              Isso vai encerrar a sessão de Planning Poker
              para todos os participantes.
              {meuRole === 0 &&
                ' Como dono da sala, você pode encerrar a sessão a qualquer momento.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogEncerrarAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEncerrarSessao}
            >
              Encerrar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageSala;
