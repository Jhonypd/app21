'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert';

interface BannerModoPraticaProps {
  mostrar: boolean;
}

export function BannerModoPratica({
  mostrar,
}: BannerModoPraticaProps) {
  if (!mostrar) return null;

  return (
    <Alert
      variant="default"
      className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
    >
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="font-semibold text-yellow-800 dark:text-yellow-400">
        Atenção
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-500">
        Esta sessão não possui histórias vinculadas. Os
        votos registrados não serão salvos permanentemente.
        Adicione histórias para começar a salvar os votos.
      </AlertDescription>
    </Alert>
  );
}
