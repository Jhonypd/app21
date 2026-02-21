'use client';

import {
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';

interface UseSafeAsyncHandlerOptions {
  onError?: (error: unknown, context: string) => void;
}

/**
 * Hook para gerenciar handlers assíncronos com cleanup automático
 * Evita memory leaks e race conditions
 */
export function useSafeAsyncHandler({
  onError,
}: UseSafeAsyncHandlerOptions = {}) {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeAsync = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context: string,
    ): Promise<T | null> => {
      try {
        if (!isMountedRef.current) {
          return null;
        }

        const result = await asyncFn();

        if (!isMountedRef.current) {
          return null;
        }

        return result;
      } catch (error) {
        if (isMountedRef.current && onError) {
          onError(error, context);
        }
        return null;
      }
    },
    [onError],
  );

  return { executeAsync, isMounted: isMountedRef.current };
}

/**
 * Hook para gerenciar timers com cleanup automático
 */
export function useSafeTimer() {
  const timerRefRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [loadingTime, setLoadingTime] = useState(false);

  const schedule = useCallback(
    (callback: () => void, delayMs: number) => {
      // Limpar timer anterior
      if (timerRefRef.current) {
        clearTimeout(timerRefRef.current);
      }

      timerRefRef.current = setTimeout(() => {
        callback();
        timerRefRef.current = null;
      }, delayMs);
    },
    [],
  );

  const cancel = useCallback(() => {
    if (timerRefRef.current) {
      clearTimeout(timerRefRef.current);
      timerRefRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRefRef.current) {
        clearTimeout(timerRefRef.current);
      }
    };
  }, []);

  return { schedule, cancel, loadingTime, setLoadingTime };
}
