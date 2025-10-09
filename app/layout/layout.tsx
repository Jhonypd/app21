'use client';
import { ReactNode } from 'react';

import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/loading';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

const HIDDEN_SIDEBAR_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/error',
  '/',
];

const Layout = ({ children }: LayoutProps) => {
  const { isMobile } = useSidebar();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Verifica se o caminho atual está na lista de caminhos proibidos
  const shouldHideSidebar =
    HIDDEN_SIDEBAR_PATHS.includes(pathname);

  if (loading) {
    return <Loading active />;
  }

  // Se estiver em uma página que não deve mostrar sidebar
  if (shouldHideSidebar) {
    return (
      <div className="bg-muted box-border flex max-w-[100vw] flex-1 overflow-x-hidden">
        <div
          className={`bg-background flex flex-1 flex-col gap-4 overflow-x-hidden px-4 pt-2 sm:px-6 ${isMobile ? 'w-screen max-w-screen' : 'max-w-full'}`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted box-border flex max-w-[100vw] flex-1 overflow-x-hidden">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumbs />
          </div>
        </header>
        <div
          className={`bg-background flex flex-1 flex-col gap-4 overflow-x-hidden px-4 pt-2 sm:px-6 ${isMobile ? 'w-screen max-w-screen' : 'max-w-full'}`}
        >
          {children}
        </div>
      </SidebarInset>
    </div>
  );
};

export default Layout;
