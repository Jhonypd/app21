'use client';
import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { menus } from '@/constants/menus';
import { NavUser } from './nav-user';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Memoizar o componente para evitar re-renderizações desnecessárias
export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth();
  const navigate = useRouter();

  // Memoizar a função de logout para evitar recriações desnecessárias
  const handleSignOut = React.useCallback(async () => {
    const { error } = await signOut();
    if (!error) {
      toast('Logout realizado', {
        description: 'Até a próxima!',
      });
      navigate.replace('/auth');
    }
  }, [signOut, navigate]);

  // Memoizar o array de menus se for estático
  const menuItems = React.useMemo(() => menus.menuList, []);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain menus={menuItems} />
        {/* <NavProjects projects={menus.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={user}
          onLogout={handleSignOut}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

// Definir display name para melhor debugging
AppSidebar.displayName = 'AppSidebar';
