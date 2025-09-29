import {
  MdMeetingRoom,
  MdDashboard,
  MdAdd,
  MdGroup,
  MdHistory,
  MdSettings,
  MdAnalytics,
  MdSchedule,
  MdPerson,
  MdNotifications,
  MdHelp,
  MdBugReport,
  MdFeedback,
} from 'react-icons/md';
import { FaUsers, FaChartBar, FaCog } from 'react-icons/fa';
import {
  HiOutlineDocumentReport,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { IconType } from 'react-icons';

export interface MenuProps {
  order: number;
  title: string;
  description: string | null;
  icon: IconType | null;
  url: string;
}

export interface MenuCategoryProps {
  order: number;
  title: string;
  description: string;
  icon: IconType | null;
  menus: MenuProps[];
}

export interface MenuList {
  menuList: MenuCategoryProps[];
}

export const menus: MenuList = {
  menuList: [
    // Dashboard Principal
    {
      order: 100,
      title: 'Dashboard',
      description: 'Visão geral e métricas principais',
      icon: MdDashboard,
      menus: [
        {
          order: 101,
          title: 'Início',
          description:
            'Painel principal com estatísticas e salas ativas',
          icon: MdDashboard,
          url: '/dashboard',
        },
        {
          order: 102,
          title: 'Atividades Recentes',
          description:
            'Últimas estimativas e atividades realizadas',
          icon: MdHistory,
          url: '/dashboard/activity',
        },
      ],
    },

    // Gerenciamento de Salas
    {
      order: 200,
      title: 'Salas',
      description:
        'Gerenciamento completo das salas de Planning Poker',
      icon: MdMeetingRoom,
      menus: [
        {
          order: 201,
          title: 'Minhas Salas',
          description:
            'Lista de todas as salas que você criou',
          icon: MdMeetingRoom,
          url: 'dashboard/salas',
        },
        {
          order: 202,
          title: 'Criar Nova Sala',
          description:
            'Criar uma nova sala de Planning Poker',
          icon: MdAdd,
          url: '/rooms/create',
        },
        {
          order: 203,
          title: 'Salas Participando',
          description: 'Salas onde você é participante',
          icon: FaUsers,
          url: '/rooms/participating',
        },
        {
          order: 204,
          title: 'Entrar em Sala',
          description:
            'Entrar em uma sala existente com código',
          icon: MdGroup,
          url: '/rooms/join',
        },
        {
          order: 205,
          title: 'Salas Agendadas',
          description:
            'Salas programadas para sessões futuras',
          icon: MdSchedule,
          url: '/rooms/scheduled',
        },
      ],
    },

    // Relatórios e Analytics
    {
      order: 300,
      title: 'Relatórios',
      description: 'Análises e relatórios das estimativas',
      icon: MdAnalytics,
      menus: [
        {
          order: 301,
          title: 'Dashboard Analytics',
          description: 'Métricas e gráficos das sessões',
          icon: FaChartBar,
          url: '/reports/analytics',
        },
        {
          order: 302,
          title: 'Histórico de Sessões',
          description:
            'Histórico completo das sessões realizadas',
          icon: MdHistory,
          url: '/reports/sessions',
        },
        {
          order: 303,
          title: 'Relatórios de Time',
          description:
            'Performance e participação dos membros',
          icon: HiOutlineUserGroup,
          url: '/reports/team',
        },
        {
          order: 304,
          title: 'Exportar Dados',
          description:
            'Exportar relatórios em diferentes formatos',
          icon: HiOutlineDocumentReport,
          url: '/reports/export',
        },
      ],
    },

    // Configurações e Perfil
    {
      order: 400,
      title: 'Configurações',
      description: 'Configurações pessoais e do sistema',
      icon: MdSettings,
      menus: [
        {
          order: 401,
          title: 'Meu Perfil',
          description:
            'Gerenciar informações pessoais e avatar',
          icon: MdPerson,
          url: '/configuracoes/perfil',
        },
        {
          order: 402,
          title: 'Preferências',
          description:
            'Configurações de estimativas e notificações',
          icon: FaCog,
          url: '/configuracoes/preferences',
        },
        {
          order: 403,
          title: 'Gerenciar Times',
          description:
            'Criar e gerenciar equipes de trabalho',
          icon: HiOutlineUserGroup,
          url: '/configuracoes/equipes',
        },
        {
          order: 404,
          title: 'Notificações',
          description: 'Configurar alertas e lembretes',
          icon: MdNotifications,
          url: '/configuracoes/notifications',
        },
      ],
    },

    // Suporte e Ajuda
    {
      order: 500,
      title: 'Suporte',
      description: 'Ajuda, documentação e suporte técnico',
      icon: MdHelp,
      menus: [
        {
          order: 501,
          title: 'Central de Ajuda',
          description: 'Documentação e guias de uso',
          icon: MdHelp,
          url: '/help/docs',
        },
        {
          order: 502,
          title: 'Reportar Bug',
          description: 'Relatar problemas técnicos',
          icon: MdBugReport,
          url: '/help/bug-report',
        },
        {
          order: 503,
          title: 'Enviar Feedback',
          description: 'Sugestões e melhorias',
          icon: MdFeedback,
          url: '/help/feedback',
        },
      ],
    },
  ],
};
