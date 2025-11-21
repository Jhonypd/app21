import { Crown, Shield, User } from 'lucide-react';

export interface RoleInfo {
  icon: typeof Crown | typeof Shield | typeof User;
  label: string;
  color: string;
  badgeClass: string;
}

/**
 * Retorna informações visuais sobre um role
 * @param role - 0=Dono, 1=Admin, 2=Membro
 */
export function getRoleInfo(role: number): RoleInfo {
  switch (role) {
    case 0:
      return {
        icon: Crown,
        label: 'Dono',
        color: 'text-yellow-500',
        badgeClass:
          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      };
    case 1:
      return {
        icon: Shield,
        label: 'Admin',
        color: 'text-blue-500',
        badgeClass:
          'bg-blue-500/10 text-blue-500 border-blue-500/20',
      };
    case 2:
    default:
      return {
        icon: User,
        label: 'Membro',
        color: 'text-gray-400',
        badgeClass:
          'bg-gray-500/10 text-gray-400 border-gray-500/20',
      };
  }
}
