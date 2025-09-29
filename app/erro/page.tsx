'use client';
import { useSearchParams } from 'next/navigation';

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Erro
        </h1>
        <p>{message || 'Ocorreu um erro inesperado'}</p>
        <a
          href="/auth/login"
          className="mt-4 inline-block text-blue-500 underline"
        >
          Voltar para o login
        </a>
      </div>
    </div>
  );
};

export default ErrorPage;
