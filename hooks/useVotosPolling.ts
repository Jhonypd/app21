'use client';

import { useEffect, useRef } from 'react';

interface UseVotosPollingOptions {
  intervalo?: number;
  habilitado?: boolean;
  onBuscaIntervalo?: () => void;
}

/**
 * Hook para gerenciar polling automático
 * Apenas gerencia os timers, sem fazer chamadas à API
 * A busca da API é responsabilidade de quem usa o hook
 * Preparado para ser substituído por WebSocket depois
 */
export function useVotosPolling({
  intervalo = 3000,
  habilitado = true,
  onBuscaIntervalo,
}: UseVotosPollingOptions) {
  const timeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const callbackRef = useRef(onBuscaIntervalo);
  const habilitadoRef = useRef(habilitado);
  const intervaloRef = useRef(intervalo);

  useEffect(() => {
    callbackRef.current = onBuscaIntervalo;
  }, [onBuscaIntervalo]);

  useEffect(() => {
    habilitadoRef.current = habilitado;
  }, [habilitado]);

  useEffect(() => {
    intervaloRef.current = intervalo;
  }, [intervalo]);

  const limparTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const agendarProximaExecucao = () => {
    if (!habilitadoRef.current) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      executarCallback();
    }, intervaloRef.current);
  };

  const executarCallback = async () => {
    if (!habilitadoRef.current) {
      return;
    }

    try {
      await callbackRef.current?.();
    } finally {
      if (habilitadoRef.current) {
        agendarProximaExecucao();
      }
    }
  };

  // Configurar polling sequencial
  useEffect(() => {
    limparTimeout();

    if (!habilitado) {
      return;
    }

    executarCallback();

    return () => {
      limparTimeout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      limparTimeout();
    };
  }, []);
}
