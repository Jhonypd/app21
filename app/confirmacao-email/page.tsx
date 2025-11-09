'use client';
import { EmailInput } from '@/components/inputs/input-email';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNovoCodigoMutation } from '@/services/api/auth-api';
import { Link } from 'lucide-react';
import { useState } from 'react';

const ConfirmacaoEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [novoEmail] = useNovoCodigoMutation();
  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await novoEmail({ email });
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">
          Verifique seu email
        </h1>
        <p>
          Enviamos um link de confirmação para seu email.
          Clique no link para ativar sua conta.
        </p>

        <Card>
          <CardContent>
            <EmailInput
              onChange={handleEmailChange}
              value={email}
              label="Email"
              placeholder="seu@email.com"
              disabled={isLoading || !email}
            />
            <Button
              disabled={isLoading || !email}
              onClick={handleSubmit}
            >
              Enviar
            </Button>
          </CardContent>
        </Card>
        <Link href="/auth/login">
          <Button
            variant="link"
            className="mt-4"
          >
            Voltar para o login
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConfirmacaoEmail;
