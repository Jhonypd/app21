import { ApiResponse } from '@/services/interfaces';

export interface ApiError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: ApiResponse<any>;
  status?: number;
}

export function isApiError(
  error: unknown,
): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).data === 'object'
  );
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (
      error.data?.Mensagem ||
      error.data?.Detalhe ||
      'Erro inesperado'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro inesperado';
}
