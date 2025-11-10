'use client';
import { toastInfo } from '@/components/custom-toast';
import { EmailInput } from '@/components/inputs/input-email';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useNovoCodigoMutation } from '@/services/api/auth-api';
import Link from 'next/link';
import { useState } from 'react';
import { MdEmail } from 'react-icons/md';

const ConfirmacaoEmail = () => {
  const [email, setEmail] = useState('');

  const [novoEmail, { isLoading }] =
    useNovoCodigoMutation();

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    const novoCodigo = await novoEmail({ email });

    toastInfo({
      description: `${novoCodigo.data?.Mensagem}`,
    });
  };

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
