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
import { NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth();
  const navigate = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast('Logout realizado', {
        description: 'Até a próxima!',
      });
      navigate.replace('/auth');
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain menus={menus.menuList} />
        <NavProjects projects={menus.projects} />
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
}
