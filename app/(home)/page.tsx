'use client';

import { CriarSala } from '@/components/criar-sala';
import { EstatisticasRapidas } from '@/components/estatisticas-rapidas';

const LandingPage = () => {
  return (
    <div className="container">
      {/* Main Content */}
      <div className="relative z-10 space-y-6 px-4">
        <div className="flex flex-col py-20">
          <div className="mx-auto max-w-4xl overflow-x-auto rounded-2xl text-center">
            <EstatisticasRapidas />
          </div>
          <CriarSala
            aberto={false}
            aoFechar={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
