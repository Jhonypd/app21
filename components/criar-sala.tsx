import React from 'react';
import { WizardCriarSala } from './wizard-criar-sala';

interface CriarSalaProps {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar?: (salaId: string) => void;
}

export function CriarSala({
  aberto,
  aoFechar,
  aoCriar,
}: CriarSalaProps) {
  return (
    <WizardCriarSala
      aberto={aberto}
      aoFechar={aoFechar}
      aoCriar={aoCriar}
    />
  );
}
