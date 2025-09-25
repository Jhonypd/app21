'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Zap, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { FcGoogle } from 'react-icons/fc';
import { Separator } from '@/components/ui/separator';
import { GiCardRandom } from 'react-icons/gi';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setEmail('yalali6338@dawhe.com');
      setPassword('123456');
    }
  }, []);

  useEffect(() => {
    // Check for existing session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          navigate.replace('/');
        }
        setSession(session);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          navigate.replace('/');
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast('Erro no cadastro', {
          description: error.message,
        });
      } else {
        toast('Cadastro realizado!', {
          description:
            'Verifique seu email para confirmar a conta.',
        });
      }
    } catch (error) {
      toast('Erro inesperado', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        toast('Erro no login', {
          description: error.message,
        });
      } else {
        toast('Login realizado!', {
          description: 'Bem-vindo de volta!',
        });
      }
    } catch (error) {
      toast('Erro inesperado', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return null; // Will redirect
  }

  return (
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
            <Tabs
              defaultValue="login"
              className="w-full"
            >
              <TabsList className="bg-background grid h-fit w-full grid-cols-2 items-center border p-2">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-primary"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-primary"
                >
                  Cadastro
                </TabsTrigger>
              </TabsList>
              <div className="w-full">
                <Button
                  type="button"
                  variant={'outline'}
                  className="w-full cursor-pointer"
                >
                  <FcGoogle />
                </Button>
              </div>

              <div className="text-primary-foreground flex w-full flex-row items-center justify-between gap-2 font-semibold">
                <Separator className="max-w-36" />
                <span>ou</span>
                <Separator className="max-w-36" />
              </div>

              <TabsContent
                value="login"
                className="space-y-4"
              >
                <form
                  onSubmit={handleSignIn}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={
                      loading || !email || !password
                    }
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent
                value="signup"
                className="space-y-4"
              >
                <form
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                    />
                  </div>
                  {/* <div className="space-y-2">
										<Label htmlFor="name" className="flex items-center gap-2">
											<Mail className="w-4 h-4" />
											Nome
										</Label>
										<Input
											id="name"
											type="text"
											placeholder="Seu nome"
											value={name}
											onChange={(e) => setName(e.target.value)}
											required
										/>
									</div> */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={
                      loading || !email || !password
                    }
                  >
                    {loading
                      ? 'Criando conta...'
                      : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
