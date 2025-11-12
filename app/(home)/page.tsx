'use client';

import { AcoesPrincipais } from '@/components/AcoesPrincipais';
import { DadosSala } from '@/components/cardSala';
import { CriarSala } from '@/components/criar-sala';
import { EntrarSala } from '@/components/EntrarSala';
import { EstatisticasRapidas } from '@/components/estatisticas-rapidas';
import { ListaSalas } from '@/components/listaSalas';
import { useState } from 'react';

const LandingPage = () => {
  const [modalCriarAberto, setModalCriarAberto] =
    useState(false);
  const [modalEntrarAberto, setModalEntrarAberto] =
    useState(false);

  const salasRecentes: DadosSala[] = [
    {
      id: 'e6a0953e-445c-4614-9a88-4dd714348b6e',
      codigo: 4,
      titulo: 'Backend',
      criado_por: 'e483f765-5e6b-43a0-877e-6bf5c5a9d4af',
      data_criacao: '2025-11-02T16:56:02.182Z',
      data_alteracao: '2025-11-02T16:56:02.182Z',
      inativo: false,
      votos: [],
      proprietario: {
        id: 'e483f765-5e6b-43a0-877e-6bf5c5a9d4af',
        nome: 'Jhony Pereira',
        inativo: false,
      },
      participantes: [],
    },
  ];
  return (
    <div className="container">
      <div className="relative mx-auto max-w-4xl space-y-6 overflow-x-auto rounded-2xl px-4 text-center">
        <EstatisticasRapidas />

        <AcoesPrincipais
          aoClicarCriar={() => setModalCriarAberto(true)}
          aoClicarEntrar={() => setModalEntrarAberto(true)}
        />

        <ListaSalas salas={salasRecentes} />
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
