'use client';

import { AcoesPrincipais } from '@/components/acoes-principais';
import { CriarSala } from '@/components/criar-sala';
import { EntrarSala } from '@/components/entrar-sala';
import { EstatisticasRapidas } from '@/components/estatisticas-rapidas';
import { ListaSalas } from '@/components/lista-salas';
import { useAuth } from '@/hooks/useAuth';
import type { Salas } from '@/services/types';
import { useListarSalasQuery } from '@/services/api/salas-api';
import { useEffect, useState } from 'react';

const LandingPage = () => {
  const { usuario } = useAuth();
  const [modalCriarAberto, setModalCriarAberto] =
    useState(false);
  const [modalEntrarAberto, setModalEntrarAberto] =
    useState(false);
  const [salaAtual, setSalaAtual] = useState<Salas | null>(
    null,
  );

  const [salasRecentes, setSalasRecentes] = useState<
    Salas[]
  >([]);

  const { data } = useListarSalasQuery({
    itensPagina: 3,
    pagina: 0,
  });

  useEffect(() => {
    if (usuario) {
      if (data && data.Sucesso && data.Resultado) {
        setSalasRecentes(data.Resultado.salas);
      }
    }
  }, [usuario, data]);

  const usuarioAtualId = usuario?.id as string;

  return (
    <div className="container">
      <div className="relative mx-auto max-w-4xl space-y-6 overflow-x-auto rounded-2xl px-4 text-center">
        <EstatisticasRapidas />

        <AcoesPrincipais
          aoClicarCriar={() => setModalCriarAberto(true)}
          aoClicarEntrar={() => setModalEntrarAberto(true)}
        />

        <ListaSalas
          salas={salasRecentes}
          usuarioAtualId={usuarioAtualId}
          aoClicarSala={(sala) => setSalaAtual(sala)}
        />
      </div>
      <CriarSala
        aberto={modalCriarAberto}
        aoFechar={() => setModalCriarAberto(false)}
      />
      <EntrarSala
        aberto={modalEntrarAberto}
        aoFechar={() => setModalEntrarAberto(false)}
      />
    </div>
  );
};

export default LandingPage;
