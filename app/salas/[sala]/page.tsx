'use client';

import { SalaPlanning } from '@/components/sala-planning';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { useObterSalaPorCodigoQuery } from '@/services/api/salas-api';
import Loading from '@/components/loading';
import { toastError } from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useEffect } from 'react';

const PageSala = () => {
  const params = useParams();
  const router = useRouter();
  const codigoSala = params.sala as string;
  const { usuario } = useAuth();

  const { data, isLoading, error } =
    useObterSalaPorCodigoQuery(codigoSala, {
      skip: !codigoSala,
    });

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

  return (
    <SalaPlanning
      usuarioAtualId={usuarioId}
      aoVoltar={handleVoltar}
      sala={{
        id: sala.id,
        codigo: sala.codigo,
        titulo: sala.titulo,
        criado_por: sala.criado_por,
        proprietario: {
          id: sala.proprietario.id,
          nome: sala.proprietario.nome, // Nome já vem descriptografado da API
        },
      }}
    />
  );
};

export default PageSala;
