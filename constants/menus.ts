import {
  MdMeetingRoom,
  MdAdd,
  MdLogin,
  MdHistory,
  MdSettings,
  MdAnalytics,
  MdPerson,
  MdNotifications,
  MdHelp,
  MdBugReport,
  MdFeedback,
  MdWork,
  MdFolder,
  MdList,
} from 'react-icons/md';
import {
  FaChartBar,
  FaCog,
  FaLaptopCode,
  FaUsers,
  FaUsersCog,
} from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { RiBarChartGroupedFill } from 'react-icons/ri';
import { IconType } from 'react-icons';
import { LuFolderCode } from 'react-icons/lu';

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
    // Gerenciamento de Salas
    {
      order: 100,
      title: 'Salas',
      description:
        'Gerenciamento de salas de Planning Poker',
      icon: MdMeetingRoom,
      menus: [
        {
          order: 101,
          title: 'Todas as Salas',
          description: 'Minhas salas e salas participando',
          icon: MdMeetingRoom,
          url: '/salas',
        },
        {
          order: 102,
          title: 'Nova Sala',
          description:
            'Criar uma nova sala de Planning Poker',
          icon: MdAdd,
          url: '/salas/criar',
        },
        {
          order: 103,
          title: 'Entrar com Código',
          description: 'Entrar em uma sala existente',
          icon: MdLogin,
          url: '/salas/entrar',
        },
      ],
    },

    // Gerenciamento de Projetos
    {
      order: 200,
      title: 'Projetos',
      description: 'Gerenciamento de projetos e backlog',
      icon: FaLaptopCode,
      menus: [
        {
          order: 201,
          title: 'Meus Projetos',
          description: 'Lista de projetos ativos',
          icon: MdFolder,
          url: '/projetos',
        },
        {
          order: 202,
          title: 'Backlog',
          description: 'Histórias e tarefas a estimar',
          icon: MdList,
          url: '/projetos/backlog',
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
          title: 'Atividades Recentes',
          description: 'Últimas estimativas e atividades',
          icon: MdHistory,
          url: '/relatorios/atividades',
        },
        {
          order: 302,
          title: 'Dashboard Analytics',
          description: 'Métricas e gráficos das sessões',
          icon: FaChartBar,
          url: '/relatorios/analytics',
        },
        {
          order: 303,
          title: 'Histórico de Sessões',
          description: 'Histórico completo das sessões',
          icon: MdHistory,
          url: '/relatorios/sessoes',
        },
        {
          order: 304,
          title: 'Exportar Dados',
          description:
            'Exportar relatórios em diferentes formatos',
          icon: HiOutlineDocumentReport,
          url: '/relatorios/exportar',
        },
      ],
    },

    // Gerenciamento de Times
    {
      order: 400,
      title: 'Times',
      description: 'Gerenciamento de equipes',
      icon: FaUsersCog,
      menus: [
        {
          order: 401,
          title: 'Minhas Equipes',
          description: 'Gerenciar equipes de trabalho',
          icon: FaUsers,
          url: '/times/minhas-equipes',
        },
        {
          order: 402,
          title: 'Relatórios de Time',
          description:
            'Performance e participação dos membros',
          icon: RiBarChartGroupedFill,
          url: '/times/relatorios',
        },
      ],
    },

    // Configurações Pessoais
    {
      order: 500,
      title: 'Configurações',
      description: 'Configurações pessoais',
      icon: MdSettings,
      menus: [
        {
          order: 501,
          title: 'Meu Perfil',
          description: 'Gerenciar informações pessoais',
          icon: MdPerson,
          url: '/configuracoes/perfil',
        },
        {
          order: 502,
          title: 'Preferências',
          description: 'Configurações de estimativas',
          icon: FaCog,
          url: '/configuracoes/preferencias',
        },
        {
          order: 503,
          title: 'Notificações',
          description: 'Configurar alertas e lembretes',
          icon: MdNotifications,
          url: '/configuracoes/notificacoes',
        },
      ],
    },

    // Suporte e Ajuda
    {
      order: 600,
      title: 'Suporte',
      description: 'Ajuda e suporte técnico',
      icon: MdHelp,
      menus: [
        {
          order: 601,
          title: 'Central de Ajuda',
          description: 'Documentação e guias de uso',
          icon: MdHelp,
          url: '/suporte/ajuda',
        },
        {
          order: 602,
          title: 'Reportar Bug',
          description: 'Relatar problemas técnicos',
          icon: MdBugReport,
          url: '/suporte/bug',
        },
        {
          order: 603,
          title: 'Enviar Feedback',
          description: 'Sugestões e melhorias',
          icon: MdFeedback,
          url: '/suporte/feedback',
        },
      ],
    },
  ],
};
