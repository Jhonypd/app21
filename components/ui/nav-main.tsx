'use client';

import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { MenuCategoryProps } from '@/constants/menus';
import { MdDashboard } from 'react-icons/md';
import React, { useMemo, memo } from 'react';

interface NavMainProps {
  menus: MenuCategoryProps[];
}

// Componente memoizado para o item do dashboard
const DashboardItem = memo(() => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <a href="/dashboard">
        <MdDashboard />
        <span>Dashboard</span>
      </a>
    </SidebarMenuButton>
  </SidebarMenuItem>
));

DashboardItem.displayName = 'DashboardItem';

// Componente memoizado para cada item de menu
const MenuItem = memo(
  ({ item }: { item: MenuCategoryProps }) => (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={false}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && (
              <item.icon
                className="h-5 w-5"
                size={20}
              />
            )}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.menus?.map((subItem) => (
              <SubMenuItem
                key={subItem.title}
                subItem={subItem}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  ),
);

MenuItem.displayName = 'MenuItem';

// Componente memoizado para cada subitem
const SubMenuItem = memo(
  ({
    subItem,
  }: {
    subItem: MenuCategoryProps['menus'][0];
  }) => (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuSubButton asChild>
        <a href={subItem.url}>
          {subItem.icon && (
            <subItem.icon className="!text-foreground [&>svg]:hover:!sidebar-accent-foreground mr-2 h-5 w-5 [&>svg]:size-5" />
          )}
          <span>{subItem.title}</span>
        </a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  ),
);

SubMenuItem.displayName = 'SubMenuItem';

export const NavMain = memo(function NavMain({
  menus,
}: NavMainProps) {
  // Memoizar o mapeamento dos menus para evitar recriação
  const menuItems = useMemo(
    () =>
      menus.map((item) => (
        <MenuItem
          key={item.title}
          item={item}
        />
      )),
    [menus],
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        <DashboardItem />
        {menuItems}
      </SidebarMenu>
    </SidebarGroup>
  );
});

NavMain.displayName = 'NavMain';
