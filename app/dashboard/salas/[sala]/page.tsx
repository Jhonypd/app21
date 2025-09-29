// app/dashboard/salas/[sala]/page.tsx
'use client';

import {
  SalaProvider,
  useSala,
} from '@/contexts/SalaContext';
import { EstimationTable } from '@/components/planning-poker/EstimationTable';
import { ResultsSummary } from '@/components/planning-poker/ResultsSummary';
import { VotingDeck } from '@/components/planning-poker/VotingDeck';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SalaHeader } from '@/components/planning-poker/sala-header';

// Componente interno que consome o contexto
const SalaContent = () => {
  const {
    sala,
    loading,
    error,
    isAdmin,
    usuarioAtual,
    votar,
    revelarVotos,
    resetarVotos,
    toggleModoAnimado,
  } = useSala();
  const router = useRouter();

  const handleLeaveRoom = () => {
    router.push('/dashboard/salas');
  };

  const handleCopyRoomId = () => {
    if (sala) {
      navigator.clipboard.writeText(sala.id);
      toast('ID copiado!', {
        description:
          'ID da sala copiado para a área de transferência',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">
            Entrando na sala...
          </p>
        </div>
      </div>
    );
  }

  if (error || !sala || !usuarioAtual) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-md p-6 text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="mb-4 text-red-600">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-xl font-semibold text-red-800">
              {error?.includes('não tem permissão')
                ? 'Acesso Negado'
                : error?.includes('não encontrada')
                  ? 'Sala Não Encontrada'
                  : 'Erro ao Carregar Sala'}
            </h2>

            <p className="mb-4 text-red-700">{error}</p>

            {error?.includes('não tem permissão') && (
              <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Solução:</strong> Peça ao
                  administrador da sala para adicionar você
                  como participante.
                </p>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button
                onClick={handleLeaveRoom}
                variant="outline"
              >
                Voltar para Salas
              </Button>

              {error?.includes('não tem permissão') && (
                <Button
                  onClick={() =>
                    router.push('/dashboard/salas')
                  }
                >
                  Ver Minhas Salas
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen space-y-6 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleLeaveRoom}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Sair da Sala
          </Button>
        </div>

        {/* Passando dados como props - SEM usar contexto nos filhos */}
        <SalaHeader
          titulo={sala.titulo}
          codigo={sala.codigo}
          senha={sala.senha}
          totalParticipantes={sala.participantes.length}
          isAdmin={isAdmin}
          isAnimatedMode={sala.modoAnimado}
          onCopyRoomId={handleCopyRoomId}
          onToggleAnimatedMode={toggleModoAnimado}
        />

        {/* <EstimationTable
          currentStory={
            sala.historiaAtual?.titulo ||
            'Nenhuma história ativa'
          }
          participants={sala.participantes}
          areVotesRevealed={sala.votosRevelados}
          isAdmin={isAdmin}
          onRevealVotes={revelarVotos}
          onResetVotes={resetarVotos}
        /> */}

        {/* {sala.votosRevelados && sala.historiaAtual && (
          <ResultsSummary
            participants={sala.participantes}
            isAnimatedMode={sala.modoAnimado}
          />
        )} */}

        <VotingDeck
          selectedValue={
            usuarioAtual.voto
              ? usuarioAtual.voto.toString()
              : undefined
          }
          onVoteSelect={(valor) =>
            votar(parseInt(valor as string))
          }
          isDisabled={
            sala.votosRevelados || !sala.historiaAtual
          }
          isAnimatedMode={sala.modoAnimado}
        />
      </div>
    </div>
  );
};

// Componente principal que fornece o contexto
const PageSala = () => {
  const params = useParams();
  const salaId = params.sala as string;
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SalaProvider salaId={salaId}>
      <SalaContent />
    </SalaProvider>
  );
};

export default PageSala;
