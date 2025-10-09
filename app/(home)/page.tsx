'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Target,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GiCardRandom } from 'react-icons/gi';
import { TbCardsFilled } from 'react-icons/tb';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            {/* User Welcome (if logged in) */}
            {isAuthenticated && user && (
              <div className="mb-8 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/20 dark:to-purple-950/20">
                <p className="text-muted-foreground text-sm">
                  Bem-vindo de volta,
                </p>
                <p className="text-foreground font-medium">
                  {user.nome}
                </p>
              </div>
            )}

            {/* Hero Section */}
            <div className="space-y-6">
              <div className="mb-8 flex items-center justify-center">
                <div className="shadow-glow rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
                  <GiCardRandom className="h-16 w-16 text-white" />
                </div>
              </div>

              <h1 className="text-foreground mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
                Planning Poker
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {' '}
                  Ágil
                </span>
              </h1>

              <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
                Estimativas colaborativas para suas sprints
                seguindo a metodologia Scrum. Crie salas,
                convide sua equipe e vote nos PBIs de forma
                eficiente.
              </p>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                onClick={handleAuthAction}
                size="lg"
                className="flex items-center gap-2 px-8 py-6 text-lg"
              >
                {isAuthenticated ? (
                  <>
                    Ir para Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Começar Agora
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              {!isAuthenticated && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/auth')}
                  className="flex items-center gap-2 px-8 py-6 text-lg"
                >
                  <LogIn className="h-5 w-5" />
                  Já tenho conta
                </Button>
              )}
            </div>

            {/* Features */}
            <div className="mt-20 grid gap-6 md:grid-cols-3">
              <Card className="bg-gradient-card border-border shadow-card p-6 transition-shadow hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-800 to-indigo-900">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground text-lg">
                    Colaboração em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">
                    Trabalhe junto com sua equipe para
                    estimar PBIs de forma síncrona e
                    eficiente.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card p-6 transition-shadow hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground text-lg">
                    Metodologia Scrum
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">
                    Seguindo as melhores práticas ágeis com
                    sequência Fibonacci para estimativas
                    precisas.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card p-6 transition-shadow hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-violet-800 to-purple-700">
                    <TbCardsFilled className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-foreground text-lg">
                    Simples e Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">
                    Interface intuitiva que permite focar no
                    que importa: as estimativas da sua
                    sprint.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border bg-background/95 border-t backdrop-blur">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Planning Poker Ágil. Desenvolvido com
              ❤️ para equipes ágeis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
