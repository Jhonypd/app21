import { ApiResponse } from '@/services/interfaces';

export interface ApiError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: ApiResponse<any>;
  status?: number;
}

export interface ApiErroFormatado {
  Mensagem: string;
  Detalhe: string;
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

export function getApiErrorMessage(
  error: unknown,
): ApiErroFormatado {
  // Caso seja o erro padrão da API
  if (isApiError(error)) {
    return {
      Mensagem: error.data?.Mensagem || 'Erro inesperado',
      Detalhe: error.data?.Detalhe || 'Erro inesperado',
    };
  }

  // Caso seja um erro nativo JS
  if (error instanceof Error) {
    return {
      Mensagem: error.message,
      Detalhe: error.message,
    };
  }

  // Fallback para qualquer outra coisa
  return {
    Mensagem: 'Erro inesperado',
    Detalhe: 'Erro inesperado',
  };
}
