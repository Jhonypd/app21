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
import { useAuth } from '@/hooks/useAuth';

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { usuario, logout } = useAuth();
  const user = React.useMemo(() => usuario, [usuario]);

  const signOut = React.useCallback(() => {
    logout();
  }, [logout]);
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
          onLogout={signOut}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

// Definir display name para melhor debugging
AppSidebar.displayName = 'AppSidebar';
