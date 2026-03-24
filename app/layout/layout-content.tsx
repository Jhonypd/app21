'use client';
import { ReactNode, memo, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navegacao } from '@/components/navegacao';
import { Header } from '@/components/header';
import { Greeting } from '@/components/greeting';
import { useAuth } from '@/hooks/useAuth';

interface LayoutContentProps {
   children: ReactNode;
}

const HIDDEN_HEADER_PREFIXES = [
   '/auth',
   '/error',
   '/confirmacao-email',
   '/salas',
] as const;

const HIDDEN_SIDEBAR_PREFIXES = [
   '/auth',
   '/error',
   '/confirmacao-email',
] as const;

// Componente para o layout sem sidebar
const NoSidebarLayout = memo(({ children }: { children: ReactNode }) => (
   <div className="container min-h-screen bg-slate-950 pb-24 text-white">
      <div
         className={`container flex max-w-screen flex-1 flex-col gap-4 pt-2 sm:px-6`}
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
));

NoSidebarLayout.displayName = 'NoSidebarLayout';

const LayoutContent = memo(({ children }: LayoutContentProps) => {
   const [abaAtiva, setAbaAtiva] = useState('/');
   const pathname = usePathname();
   const { usuario, logout } = useAuth();

   // Memorizar a verificação do path para evitar recálculos
   const shouldHideSidebar = useMemo(() => {
      // Verifica se está em uma sala específica (ex: /salas/DDRBHA)
      const isInSpecificRoom = /^\/salas\/.+/.test(pathname);

      return (
         HIDDEN_SIDEBAR_PREFIXES.some((prefix) =>
            pathname.startsWith(prefix),
         ) || isInSpecificRoom
      );
   }, [pathname]);

   const shouldHideHeader = useMemo(() => {
      return HIDDEN_HEADER_PREFIXES.some((prefix) =>
         pathname.startsWith(prefix),
      );
   }, [pathname]);

   useEffect(() => {
      const path = pathname.split('/')[1];
      // Atualiza a aba ativa com base no pathname
      setAbaAtiva(path.length > 0 ? `${path}` : '/');
   }, [pathname]);

   // Memorizar o conteúdo baseado na condição
   const content = useMemo(() => {
      return (
         <NoSidebarLayout>
            {!shouldHideHeader && (
               <Header
                  usuario={usuario}
                  logout={logout}
               />
            )}
            {pathname === '/' && !shouldHideHeader && (
               <Greeting nome={usuario?.nome.split(' ')[0] as string} />
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
      shouldHideHeader,
      shouldHideSidebar,
      children,
      abaAtiva,
      usuario,
      pathname,
   ]);

   return content;
});

LayoutContent.displayName = 'LayoutContent';

export default LayoutContent;
