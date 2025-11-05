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
import { Mail, Lock } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Separator } from '@/components/ui/separator';
import { GiCardRandom } from 'react-icons/gi';
import { login, signup } from '@/app/actions/login';
import { toastError } from '@/components/custom-toast';
import Loading from '@/components/loading';
import { TabsCustom } from '@/components/tabs';
import AuthForm from '@/modules/auth/components/auth-form';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setEmail('majebi4327@bllibl.com');
      setPassword('123456');
    }
  }, []);

  const handleAction = async (
    formData: FormData,
    action: 'login' | 'signup',
  ) => {
    setLoading(true);

    try {
      if (action === 'login') {
        await login(formData);
      } else {
        await signup(formData);
      }
      // O redirect acontece nas Server Actions, então não precisamos fazer nada aqui
    } catch (error: unknown) {
      console.error('Auth error:', error);
      if (error instanceof Error) {
        toastError({
          description:
            error.message || 'Tente novamente mais tarde.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    <Loading
      active
      type="transaction"
    />;
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
                      isLoading={false}
                      isValidated={() => true}
                      onDataChange={() => {}}
                      onSubmit={() => {}}
                    />
                  ),
                },
                {
                  value: 'signup',
                  content: (
                    <AuthForm
                      authType="cadastro"
                      isLoading={false}
                      isValidated={() => true}
                      onDataChange={() => {}}
                      onSubmit={() => {}}
                    />
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
