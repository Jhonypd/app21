'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { GiCardRandom } from 'react-icons/gi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LoginFormValues,
  CadastroFormValues,
} from '@/modules/auth/schema';
import Loading from '@/components/loading';
import { TabsCustom } from '@/components/tabs';
import AuthForm from '@/modules/auth/components/auth-form';
import { Separator } from '@/components/ui/separator';
import {
  useCriarContaMutation,
  useLoginMutation,
} from '@/services/api/auth-api';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const [login] = useLoginMutation();
  const [criarConta] = useCriarContaMutation();

  const handleAction = async (
    data: LoginFormValues | CadastroFormValues,
    action: 'login' | 'signup',
  ) => {
    setLoading(true);

    try {
      if (action === 'login') {
        const payload = {
          email: (data as LoginFormValues).email,
          senha: (data as LoginFormValues).senha,
        };

        const res = await login(payload);
        const result = res.data;

        // Se o interceptor já tratou o erro, apenas encerra
        if (!result?.Sucesso) {
          setLoading(false);
          return;
        }

        if (result.Resultado?.token) {
          console.log('Token recebido no login');

          // Aguarda o token ser salvo no cookie
          const setTokenResponse = await fetch(
            '/api/auth/set-token',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                token: result.Resultado.token,
              }),
            },
          );

          if (!setTokenResponse.ok) {
            console.error('Erro ao salvar token');
            setLoading(false);
            return;
          }

          console.log(
            'Token salvo no cookie, atualizando sessão...',
          );

          // Pequeno delay para garantir que o cookie foi setado
          await new Promise((resolve) =>
            setTimeout(resolve, 100),
          );

          // Atualiza a sessão para pegar os dados do usuário do cookie
          await refresh();

          console.log(
            'Sessão atualizada, redirecionando...',
          );

          // Redireciona para o dashboard
          router.push('/dashboard');
        }
      } else {
        const payload = data as CadastroFormValues;
        const res = await criarConta(payload);
        const result = res.data;

        if (!result?.Sucesso) {
          setLoading(false);
          return;
        }

        if (result?.Resultado?.id) {
          router.push('/confirmacao-email');
        }
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <Loading
          active
          type="transaction"
        />
      )}
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col space-y-4 text-center">
            <div className="flex items-center justify-center">
              <div className="shadow-glow rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
                <GiCardRandom className="text-muted h-12 w-12" />
              </div>
            </div>
            <h1 className="text-foreground text-center text-3xl font-bold">
              Planning Poker
              <span className="ml-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Ágil
              </span>
            </h1>
            <p className="text-muted-foreground">
              Faça login ou crie sua conta para começar
            </p>
          </div>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground text-center">
                Acesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TabsCustom
                defaultValue="login"
                tabsTrigger={[
                  { label: 'login', value: 'login' },
                  { label: 'signup', value: 'signup' },
                ]}
                tabsContent={[
                  {
                    value: 'login',
                    content: (
                      <AuthForm
                        isLoading={loading}
                        isValidated={() => true}
                        onDataChange={() => {}}
                        onSubmit={(data) =>
                          handleAction(data, 'login')
                        }
                      />
                    ),
                  },
                  {
                    value: 'signup',
                    content: (
                      <AuthForm
                        authType="cadastro"
                        isLoading={loading}
                        isValidated={() => true}
                        onDataChange={() => {}}
                        onSubmit={(data) =>
                          handleAction(data, 'signup')
                        }
                      />
                    ),
                  },
                ]}
              />

              <div className="mt-4 grid w-full grid-cols-3 items-center justify-between overflow-hidden">
                <Separator />
                <span className="text-card-foreground mx-auto">
                  Ou
                </span>
                <Separator />
              </div>

              <Button
                variant="outline"
                className="bg-background text-foreground hover:bg-accent hover:text-foreground mt-4 w-full justify-center"
                disabled // implementar login via Google depois
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                Continue com o Google
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;
