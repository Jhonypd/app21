'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { SalasGrid } from '@/components/planning-poker/sala-grid';
import Loading from '@/components/loading';
import { useAuth } from '@/contexts/AuthContext';

interface Sala {
  id: string;
  codigo: number;
  titulo: string;
  criado_por: string;
  inativo: boolean;
  protegida: boolean;
  data_criacao: string;
  data_alteracao: string;
  totalParticipantes: number;
  totalVotos: number;
  nomeDono: string;
}

const PageSalas = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSalas = async () => {
      try {
        const res = await fetch('/api/salas');
        if (!res.ok) {
          throw new Error('Falha ao carregar as salas');
        }
        const data = await res.json();
        setSalas(data.salas || []);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Erro desconhecido';
        setError(message);
        toast.error('Erro ao carregar salas', {
          description: 'Tente novamente mais tarde.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalas();
  }, []);

  const handleEntrarSala = (salaId: string) => {
    toast.success('Entrando na sala...');
    // Navegar para a sala
    window.location.href = `/dashboard/salas/${salaId}`;
  };

  const handleCopiarLink = (salaId: string) => {
    const link = `/dashboard/salas/${salaId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!', {
      description:
        'Compartilhe o link com os participantes.',
    });
  };

  if (loading) {
    return (
      <Loading
        active
        type="transaction"
      />
    );
  }

  if (error) {
    return (
      <div className="container mx-auto w-full">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="max-w-md">
            <h2 className="text-destructive mb-4 text-xl font-semibold">
              Erro ao carregar salas
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Salas de Planning Poker
            </h1>
            <p className="text-gray-500">
              Gerencie e participe das sessões de estimativa
            </p>
          </div>

          <Link href="/salas/criar">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={16} />
              Nova Sala
            </Button>
          </Link>
        </div>
      </div>

      {salas.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-4 text-center">
          <div className="max-w-md">
            <h2 className="mb-2 text-xl font-semibold">
              Nenhuma sala encontrada
            </h2>
            <p className="text-muted-foreground">
              Você ainda não criou nenhuma sala. Crie uma
              agora para começar a colaborar!
            </p>
          </div>
          <Link
            href="/salas/criar"
            className="mt-2"
          >
            <Button className="gap-2">
              <Plus size={16} />
              Criar primeira sala
            </Button>
          </Link>
        </div>
      ) : (
        <SalasGrid
          salas={salas}
          currentUserId={user?.Usu_Id}
          onEntrarSala={handleEntrarSala}
          onCopiarLink={handleCopiarLink}
        />
      )}
    </div>
  );
};

export default PageSalas;
