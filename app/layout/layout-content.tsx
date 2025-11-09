'use client';
import { ReactNode, memo, useMemo } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { usePathname } from 'next/navigation';
import {
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface LayoutContentProps {
  children: ReactNode;
}

// Array de paths que devem esconder a sidebar - memoizado
const HIDDEN_SIDEBAR_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/error',
  '/',
  '/confirmacao-email',
] as const;

// Componente para o layout sem sidebar
const NoSidebarLayout = memo(
  ({
    children,
    isMobile,
  }: {
    children: ReactNode;
    isMobile: boolean;
  }) => (
    <div className="bg-muted box-border flex max-w-[100vw] flex-1 overflow-x-hidden">
      <div
        className={`bg-background flex flex-1 flex-col gap-4 overflow-x-hidden px-4 pt-2 sm:px-6 ${
          isMobile ? 'w-screen max-w-screen' : 'max-w-full'
        }`}
      >
        {children}
      </div>
    </div>
  ),
);

NoSidebarLayout.displayName = 'NoSidebarLayout';

// Componente para o header com sidebar
const HeaderWithSidebar = memo(() => (
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
));

HeaderWithSidebar.displayName = 'HeaderWithSidebar';

// Componente para o layout com sidebar
const WithSidebarLayout = memo(
  ({
    children,
    isMobile,
  }: {
    children: ReactNode;
    isMobile: boolean;
  }) => (
    <div className="bg-muted box-border flex max-w-[100vw] flex-1 overflow-x-hidden">
      <AppSidebar />
      <SidebarInset>
        <HeaderWithSidebar />
        <div
          className={`bg-background flex flex-1 flex-col gap-4 overflow-x-hidden px-4 pt-2 sm:px-6 ${
            isMobile
              ? 'w-screen max-w-screen'
              : 'max-w-full'
          }`}
        >
          {children}
        </div>
      </SidebarInset>
    </div>
  ),
);

WithSidebarLayout.displayName = 'WithSidebarLayout';

const LayoutContent = memo(
  ({ children }: LayoutContentProps) => {
    const { isMobile } = useSidebar();
    const pathname = usePathname();

    // Memoizar a verificação do path para evitar recálculos
    const shouldHideSidebar = useMemo(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        HIDDEN_SIDEBAR_PATHS.includes(pathname as any),
      [pathname],
    );

    // Memoizar o conteúdo baseado na condição
    const content = useMemo(() => {
      if (shouldHideSidebar) {
        return (
          <NoSidebarLayout isMobile={isMobile}>
            {children}
          </NoSidebarLayout>
        );
      }

      return (
        <WithSidebarLayout isMobile={isMobile}>
          {children}
        </WithSidebarLayout>
      );
    }, [shouldHideSidebar, isMobile, children]);

    return content;
  },
);

LayoutContent.displayName = 'LayoutContent';

export default LayoutContent;
