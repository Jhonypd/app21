'use client';

import { useEffect, useState } from 'react';
import { ModalCriarSala } from '@/components/planning-poker/modal-criar-sala';
import { ModalEntrarSala } from '@/components/planning-poker/modal-entrar-sala';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Clock,
  TrendingUp,
  Search,
  Calendar,
  MoreVertical,
  Play,
  Trophy,
  Activity,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GiCardRandom } from 'react-icons/gi';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

// Mock data - em produção viria da API
const mockRooms = [
  {
    id: '1',
    name: 'Sprint 24.1 - E-commerce',
    description:
      'Planning da primeira sprint do projeto e-commerce',
    status: 'active',
    participants: 5,
    maxParticipants: 8,
    createdAt: '2024-01-15',
    lastActivity: '2024-01-15T10:30:00',
    estimatesCompleted: 12,
    totalStories: 15,
  },
  {
    id: '2',
    name: 'API Gateway - Refactor',
    description: 'Estimativas para refatoração do gateway',
    status: 'completed',
    participants: 3,
    maxParticipants: 6,
    createdAt: '2024-01-10',
    lastActivity: '2024-01-12T16:45:00',
    estimatesCompleted: 8,
    totalStories: 8,
  },
  {
    id: '3',
    name: 'Mobile App v2.0',
    description: 'Planning para nova versão do app mobile',
    status: 'scheduled',
    participants: 0,
    maxParticipants: 10,
    createdAt: '2024-01-16',
    lastActivity: '2024-01-16T09:00:00',
    estimatesCompleted: 0,
    totalStories: 20,
  },
];

const mockStats = {
  totalRooms: 12,
  activeRooms: 3,
  completedSessions: 45,
  totalEstimates: 324,
};

const Dashboard = () => {
  const { usuario, isAuthenticated } = useAuth();
  const navigate = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] =
    useState(mockRooms);

  useEffect(() => {
    if (!usuario && !isAuthenticated) {
      navigate.replace('/auth/login');
    }
  }, [usuario, isAuthenticated, navigate]);

  useEffect(() => {
    const filtered = mockRooms.filter(
      (room) =>
        room.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        room.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
    setFilteredRooms(filtered);
  }, [searchTerm]);

  const handleJoinRoom = (roomData: {
    sala_id: string;
    nome: string;
    senha?: string;
  }) => {
    toast('Entrou na sala!', {
      description: `Bem-vindo à sala ${roomData.sala_id}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: 'Ativa',
        variant: 'default' as const,
        color: 'bg-green-500',
      },
      completed: {
        label: 'Concluída',
        variant: 'secondary' as const,
        color: 'bg-gray-500',
      },
      scheduled: {
        label: 'Agendada',
        variant: 'outline' as const,
        color: 'bg-blue-500',
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.active
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  // if (loading) {
  //   return <Loading active />;
  // }

  if (!isAuthenticated) {
    return null; // Will redirect to auth
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h2>
            <p className="text-muted-foreground">
              Bem-vindo de volta,{' '}
              {usuario?.nome.split(' ')[0]}! 👋
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModalCriarSala />
            <ModalEntrarSala EntrarSala={handleJoinRoom} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Salas
              </CardTitle>
              <GiCardRandom className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.totalRooms}
              </div>
              <p className="text-muted-foreground text-xs">
                +2 desde o mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Salas Ativas
              </CardTitle>
              <Activity className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.activeRooms}
              </div>
              <p className="text-muted-foreground text-xs">
                +1 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sessões Concluídas
              </CardTitle>
              <Trophy className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.completedSessions}
              </div>
              <p className="text-muted-foreground text-xs">
                +12 esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Estimativas
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStats.totalEstimates}
              </div>
              <p className="text-muted-foreground text-xs">
                +23% vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar salas..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-64"
            />
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const statusBadge = getStatusBadge(room.status);
            const progress =
              room.totalStories > 0
                ? (room.estimatesCompleted /
                    room.totalStories) *
                  100
                : 0;

            return (
              <Card
                key={room.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <CardTitle className="line-clamp-1 text-lg">
                        {room.name}
                      </CardTitle>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {room.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="mr-2 h-4 w-4" />
                          Entrar na sala
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge.variant}>
                      <div
                        className={`h-2 w-2 rounded-full ${statusBadge.color} mr-1`}
                      />
                      {statusBadge.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>
                        {room.estimatesCompleted}/
                        {room.totalStories} PBIs
                      </span>
                    </div>
                    <div className="bg-secondary h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Room Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span>
                        {room.participants}/
                        {room.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>
                        {formatDate(room.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      Última atividade:{' '}
                      {formatTime(room.lastActivity)}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    variant={
                      room.status === 'active'
                        ? 'default'
                        : 'outline'
                    }
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {room.status === 'active'
                      ? 'Continuar'
                      : 'Iniciar'}{' '}
                    Sessão
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GiCardRandom className="text-muted-foreground mb-4 h-16 w-16" />
            <h3 className="mb-2 text-lg font-semibold">
              {searchTerm
                ? 'Nenhuma sala encontrada'
                : 'Nenhuma sala criada ainda'}
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchTerm
                ? `Não encontramos salas com o termo "${searchTerm}"`
                : 'Comece criando sua primeira sala de Planning Poker!'}
            </p>
            {!searchTerm && <ModalCriarSala />}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
