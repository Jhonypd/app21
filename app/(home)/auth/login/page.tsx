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
import { useDispatch } from 'react-redux';
import {
  logout,
  setCredentials,
  setUser,
} from '@/services/api/configs/store/auth-slice';
import { limparSalaToken } from '@/services/api/configs/store/sala-auth-slice';
import { useLazyObterDadosContaQuery } from '@/services/api/pessoas.api';
import { toastError } from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { persistor } from '@/services/api/configs/store/store';
import { setIgnoreRefreshHeaders } from '@/services/api/configs/store/baseQueryWithReauthAndInterceptor';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [contaCriada, setContaCriada] = useState(false);
  const router = useRouter();

  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [criarConta] = useCriarContaMutation();
  const [loadDadosConta] = useLazyObterDadosContaQuery();

  const handleAction = async (
    data: LoginFormValues | CadastroFormValues,
    action: 'login' | 'signup',
  ) => {
    setLoading(true);

    try {
      if (action === 'login') {
        // 1. PAUSAR Redux Persist para evitar rehydration automática
        persistor.pause();

        // 2. PURGE do persistor
        await persistor.purge();

        // 3. Limpar Redux state
        dispatch(logout());
        dispatch(limparSalaToken());

        // 4. Limpar localStorage manualmente
        if (typeof window !== 'undefined') {
          localStorage.removeItem('persist:root');
          // Limpar TODOS os items de persist
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('persist:')) {
              localStorage.removeItem(key);
            }
          });
        }

        // 5. Aguardar para garantir que tudo foi limpo
        await new Promise((resolve) =>
          setTimeout(resolve, 200),
        );

        const payload = {
          email: (data as LoginFormValues).email,
          senha: (data as LoginFormValues).senha,
        };

        const result = await login(payload).unwrap();

        if (!result?.Sucesso) {
          setLoading(false);
          return;
        }

        const access = result.Resultado?.tokenAcesso?.token;
        const refresh =
          result.Resultado?.refreshToken?.token;

        if (access && refresh) {
          // CRÍTICO: Ignorar headers X-New-* por 5 segundos após login
          setIgnoreRefreshHeaders(true);
          setTimeout(
            () => setIgnoreRefreshHeaders(false),
            5000,
          );

          dispatch(
            setCredentials({
              accessToken: access,
              refreshToken: refresh,
            }),
          );

          // CRÍTICO: Forçar flush e retomar persistor
          await persistor.flush();
          persistor.persist();

          try {
            const resp = await loadDadosConta().unwrap();

            if (resp?.Sucesso && resp?.Resultado?.pessoa) {
              dispatch(setUser(resp.Resultado.pessoa));
            } else {
              dispatch(logout());
              setLoading(false);
              return;
            }
          } catch (error) {
            dispatch(logout());
            setLoading(false);
            return;
          }

          router.push('/');
        }

        setLoading(false);
        return;
      }

      // --- SIGNUP ---
      const payload = data as CadastroFormValues;
      const res = await criarConta(payload);
      const result = res.data;

      if (result?.Sucesso && result.Resultado?.id) {
        setContaCriada(true);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);

      const mensagem = getApiErrorMessage(error);
      toastError({ description: mensagem.Mensagem });
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
