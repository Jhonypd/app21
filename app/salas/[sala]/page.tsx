'use client';

import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { useObterSalaPorCodigoQuery } from '@/services/api/salas-api';
import Loading from '@/components/loading';
import {
  toastError,
  toastSuccess,
} from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useEffect } from 'react';
import { SalaPlanning } from '@/components/sala-planning';
import { useVotarMutation } from '@/services/api/votos-api';
import {
  useRevelarVotosMutation,
  useResetarVotosMutation,
} from '@/services/api/sessoes-api';

const PageSala = () => {
  const params = useParams();
  const router = useRouter();
  const codigoSala = params.sala as string;
  const { usuario } = useAuth();

  const { data, isLoading, error } =
    useObterSalaPorCodigoQuery(codigoSala, {
      skip: !codigoSala,
    });

  const [votar] = useVotarMutation();
  const [revelarVotos] = useRevelarVotosMutation();
  const [resetarVotos] = useResetarVotosMutation();

  useEffect(() => {
    if (error) {
      const msg = getApiErrorMessage(error);
      toastError({
        title: msg.Mensagem,
        description: msg.Detalhe,
      });
    }
  }, [error]);

  const handleVoltar = () => {
    router.push('/salas');
  };

  if (isLoading) {
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

  const sala = data.Resultado.sala;
  const usuarioId = usuario?.id ?? '';

  const handleEnviarVoto = async (valor: number) => {
    try {
      // TODO: Obter sessão ativa e historia_sessao_id atual
      // Por enquanto, mostrar erro que precisa de história ativa
      toastError({
        title: 'Funcionalidade em desenvolvimento',
        description:
          'A votação será implementada após a seleção de histórias',
      });
      console.log({ salaId: sala.id, valor });
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
      console.log({ salaId: sala.id, historiaId });
    } catch (error: any) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    }
  };

  return (
    <SalaPlanning
      usuarioAtualId={usuarioId}
      aoVoltar={handleVoltar}
      sala={sala}
      aoEnviarVoto={handleEnviarVoto}
      aoRevelarVotos={handleRevelarVotos}
      aoResetarVotos={handleResetarVotos}
      aoSelecionarHistoria={handleSelecionarHistoria}
    />
  );
};

export default PageSala;
