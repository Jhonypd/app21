'use client';
import {
  ReactNode,
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { Navegacao } from '@/components/navegacao';
import { Header } from '@/components/header';
import { Greeting } from '@/components/greeting';
import { useAuth } from '@/hooks/useAuth';

interface LayoutContentProps {
  children: ReactNode;
}

// Array de paths que devem esconder a sidebar - memoizado
const HIDDEN_SIDEBAR_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/error',
  '/confirmacao-email',
  '/salas/[sala]',
  '/salas',
] as const;

// Componente para o layout sem sidebar
const NoSidebarLayout = memo(
  ({ children }: { children: ReactNode }) => (
    <div className="container min-h-screen bg-slate-950 pb-24 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/20 blur-3xl"></div>
        <div
          className="absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-pink-500/20 blur-3xl"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div
        className={`container flex max-w-screen flex-1 flex-col gap-4 px-4 pt-2 sm:px-6`}
      >
        {children}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  ),
);

NoSidebarLayout.displayName = 'NoSidebarLayout';

const LayoutContent = memo(
  ({ children }: LayoutContentProps) => {
    const [abaAtiva, setAbaAtiva] = useState('/');
    const pathname = usePathname();
    const { usuario } = useAuth();

    // Memoizar a verificação do path para evitar recálculos
    const shouldHideSidebar = useMemo(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        HIDDEN_SIDEBAR_PATHS.includes(pathname as any),
      [pathname],
    );

    useEffect(() => {
      const path = pathname.split('/')[1];
      // Atualiza a aba ativa com base no pathname
      setAbaAtiva(path.length > 0 ? `${path}` : '/');
    }, [pathname]);

    // Memoizar o conteúdo baseado na condição
    const content = useMemo(() => {
      return (
        <NoSidebarLayout>
          {!shouldHideSidebar && (
            <Header userNome={usuario?.nome} />
          )}
          {pathname === '/' && !shouldHideSidebar && (
            <Greeting
              nome={usuario?.nome.split(' ')[0] as string}
            />
          )}
          {children}
          {!shouldHideSidebar && (
            <Navegacao
              abaAtiva={abaAtiva}
              aoMudarAba={setAbaAtiva}
            />
          )}
        </NoSidebarLayout>
      );
    }, [
      shouldHideSidebar,
      children,
      abaAtiva,
      usuario,
      pathname,
    ]);

    return content;
  },
);

LayoutContent.displayName = 'LayoutContent';

export default LayoutContent;
