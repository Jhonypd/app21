'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Erro
        </h1>
        <p>{message || 'Ocorreu um erro inesperado'}</p>

        <Link
          href={'/auth/login'}
          className="mt-4"
        >
          <Button>Voltar para o login</Button>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
