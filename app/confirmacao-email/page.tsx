'use client';

import {
  toastError,
  toastInfo,
  toastSuccess,
} from '@/components/custom-toast';
import { EmailInput } from '@/components/inputs/input-email';
import Loading from '@/components/loading';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useNovoCodigoMutation,
  useValidaCodigoEmailMutation,
} from '@/services/api/auth-api';
import Link from 'next/link';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useEffect, useState } from 'react';
import { MdEmail } from 'react-icons/md';

const ConfirmacaoEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const codigo = searchParams.get('codigo');
  const confirmarConta = searchParams.get('confirmarConta');

  const [email, setEmail] = useState('');

  const [novoCodigo, { isLoading }] =
    useNovoCodigoMutation();
  const [validarCodigoEmail, { isLoading: isValidating }] =
    useValidaCodigoEmailMutation();

  /**
   * Valida automaticamente o código quando existe.
   * Chamado apenas uma vez.
   */
  useEffect(() => {
    const confirmar = async () => {
      if (!codigo) return;

      try {
        const result = await validarCodigoEmail({
          codigo,
          confirmarConta: confirmarConta === 'true',
        }).unwrap();

        if (result?.Sucesso) {
          toastSuccess({
            description:
              'Email confirmado com sucesso! Você já pode fazer login.',
          });

          // Redireciona para o login após 1 segundo
          setTimeout(
            () => router.push('/auth/login'),
            1200,
          );
          return;
        }

        toastError({
          description:
            result?.Mensagem ?? 'Falha ao confirmar email.',
        });
      } catch (err: any) {
        toastError({
          description:
            err?.data?.Mensagem ??
            'Erro inesperado ao validar o código.',
        });
      }
    };

    confirmar();
  }, [codigo, confirmarConta, validarCodigoEmail, router]);

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    try {
      const result = await novoCodigo({ email }).unwrap();
      toastInfo({
        description:
          result?.Mensagem ?? 'Código reenviado.',
      });
    } catch (err: any) {
      toastError({
        description:
          err?.data?.Mensagem ??
          'Erro ao tentar reenviar o código.',
      });
    }
  };

  // Enquanto valida o código da URL
  if (isValidating && codigo) {
    return (
      <Loading
        active
        type="transaction"
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <MdEmail className="h-8 w-8 text-blue-600" />
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Verifique seu email
          </h1>

          <p className="text-gray-600">
            Enviamos um link de confirmação para seu email.
            Clique no link para ativar sua conta.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              Reenviar código
            </CardTitle>
            <CardDescription>
              Não recebeu o email? Digite seu endereço
              abaixo para reenviar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <EmailInput
                onChange={handleEmailChange}
                value={email}
                label="Email"
                placeholder="seu@email.com"
                disabled={isLoading}
              />

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full"
              >
                {isLoading
                  ? 'Enviando...'
                  : 'Reenviar código'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/auth/login">
            <Button
              variant="link"
              className="text-gray-600 hover:text-gray-900"
            >
              Voltar para o login
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Não esqueça de verificar sua pasta de spam se não
          encontrar o email.
        </p>
      </div>
    </div>
  );
};

export default ConfirmacaoEmail;
