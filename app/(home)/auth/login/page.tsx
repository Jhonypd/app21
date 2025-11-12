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
import Link from 'next/link';
import ConfirmacaoEmailConta from '@/components/pages/confirmacao-email-conta';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [contaCriada, setContaCriada] = useState(false);
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

        if (!result?.Sucesso) {
          setLoading(false);
          return;
        }

        if (result.Resultado?.token) {
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

          await new Promise((resolve) =>
            setTimeout(resolve, 100),
          );
          await refresh();
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
          setContaCriada(true);
          setLoading(false);
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

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        <div className="w-full max-w-md space-y-8">
          {!contaCriada ? (
            <>
              {/* Header */}
              <div className="flex flex-col space-y-6 text-center">
                <div className="flex items-center justify-center">
                  <div className="bg-primary shadow-primary/20 rounded-2xl p-4 shadow-lg">
                    <GiCardRandom className="text-primary-foreground h-12 w-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-bold">
                    Planning Poker{' '}
                    <span className="text-primary">
                      Ágil
                    </span>
                  </h1>
                </div>

                <p className="text-muted-foreground text-lg">
                  Faça login ou crie sua conta para começar
                </p>
              </div>

              {/* Card de Login/Cadastro */}
              <Card className="border-primary/20 shadow-primary/5 border-2 shadow-xl">
                <CardHeader className="from-primary/5 to-primary/10 bg-gradient-to-r">
                  <CardTitle className="text-center text-2xl">
                    Acesso
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <TabsCustom
                    defaultValue="login"
                    tabsTrigger={[
                      { label: 'Login', value: 'login' },
                      {
                        label: 'Cadastro',
                        value: 'signup',
                      },
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

                  <div className="mt-6 grid w-full grid-cols-3 items-center gap-4">
                    <Separator className="bg-border" />
                    <span className="text-muted-foreground text-center text-sm">
                      Ou
                    </span>
                    <Separator className="bg-border" />
                  </div>

                  <Button
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 mt-6 w-full justify-center transition-colors"
                    disabled
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Continue com o Google
                  </Button>

                  <p className="text-muted-foreground mt-6 text-center text-sm">
                    Ao continuar, você concorda com nossos{' '}
                    <Link
                      href="/termos"
                      className="text-primary hover:text-primary/80 transition-colors hover:underline"
                    >
                      Termos de Uso
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <ConfirmacaoEmailConta
              setContaCriada={setContaCriada}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Auth;
