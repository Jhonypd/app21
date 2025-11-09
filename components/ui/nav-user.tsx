'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Perfil } from '@/contexts/AuthContext';
// import { perfil } from '@/hooks/useAuth';

interface NavUserProps {
  user?: Perfil | null;
  onLogout?: () => void;
}

export function NavUser({
  user = null,
  onLogout,
}: NavUserProps) {
  const { isMobile } = useSidebar();

  // Função para extrair iniciais do email ou nome
  const getUserInitials = (user: Perfil | null) => {
    if (!user?.Email) return 'U';

    // Se tiver user_metadata com nome, usa as iniciais do nome
    if (user.Usu_na) {
      return user.Usu_na.split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    // Senão, usa as duas primeiras letras do email antes do @
    return user.Email.split('@')[0]
      .slice(0, 2)
      .toUpperCase();
  };

  // Função para obter o nome de exibição
  const getDisplayName = (user: Perfil | null) => {
    if (!user) return 'Guest User';
    return (
      user.Usu_na || user.Email?.split('@')[0] || 'User'
    );
  };

  // Função para obter avatar URL
  const getAvatarUrl = (user: Perfil | null) => {
    return user?.Idp;
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {getAvatarUrl(user) && (
                  <AvatarImage
                    src={getAvatarUrl(user)}
                    alt={getDisplayName(user)}
                  />
                )}
                <AvatarFallback className="rounded-lg">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {getDisplayName(user)}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.Email || 'No email'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {getAvatarUrl(user) && (
                    <AvatarImage
                      src={getAvatarUrl(user)}
                      alt={getDisplayName(user)}
                    />
                  )}
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {getDisplayName(user)}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.Email || 'No email'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
