'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface BannerModoSemHistoriaProps {
  mostrar: boolean;
}

export function BannerModoSemHistoria({
  mostrar,
}: BannerModoSemHistoriaProps) {
  if (!mostrar) return null;

  return (
    <>
      <Tooltip delayDuration={900}>
        <TooltipTrigger className="animate-pulse rounded-full bg-amber-300/10 p-1.5">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-0 sm:max-w-md">
          <Alert
            variant="default"
            className="mb-4 w-full border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
          >
            <AlertTitle className="text-base font-semibold text-yellow-800 dark:text-yellow-400">
              Atenção
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-500">
              Esta sessão não possui histórias vinculadas.
              Os votos registrados não serão salvos
              permanentemente. Adicione histórias para
              começar a salvar os votos.
            </AlertDescription>
          </Alert>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
