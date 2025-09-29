// contexts/SalaContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Participante {
  id: string;
  nome: string;
  votou: boolean;
  voto?: number;
  isAdmin: boolean;
}

interface Voto {
  id: string;
  valor: number;
  pessoa_id: string;
  pessoa_nome: string;
}

interface Historia {
  id: string;
  titulo: string;
  descricao?: string;
  votos: Voto[];
  finalizada: boolean;
}

interface SalaState {
  id: string;
  titulo: string;
  codigo: number;
  criado_por: string;
  privada: string | null;
  participantes: Participante[];
  historiaAtual?: Historia;
  votosRevelados: boolean;
  modoAnimado: boolean;
}

interface SalaContextType {
  sala: SalaState | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  usuarioAtual: Participante | null;

  // Ações
  votar: (valor: number) => void;
  revelarVotos: () => void;
  resetarVotos: () => void;
  finalizarHistoria: () => void;
  novaHistoria: (
    titulo: string,
    descricao?: string,
  ) => void;
  toggleModoAnimado: () => void;
  sairDaSala: () => void;
}

const SalaContext = createContext<
  SalaContextType | undefined
>(undefined);

export const SalaProvider: React.FC<{
  children: React.ReactNode;
  salaId: string;
}> = ({ children, salaId }) => {
  const [sala, setSala] = useState<SalaState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // CORREÇÃO: Verificar se sala e participantes existem antes de usar .find()

  const usuarioAtual = sala?.criado_por === user?.id;
  const isAdmin = user?.id === sala?.criado_por || false;

  // Buscar dados iniciais da sala
  useEffect(() => {
    const carregarSala = async () => {
      if (!salaId || !user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/salas/${salaId}/infos`,
        );

        if (!res.ok) {
          const errorData = await res.json();

          if (res.status === 401) {
            throw new Error(
              'Faça login para acessar esta sala',
            );
          } else if (res.status === 403) {
            throw new Error(
              'Você não tem permissão para acessar esta sala',
            );
          } else if (res.status === 404) {
            throw new Error('Sala não encontrada');
          } else {
            throw new Error(
              errorData.error || 'Erro ao carregar sala',
            );
          }
        }

        const data = await res.json();

        // CORREÇÃO: Garantir que participantes sempre seja um array
        const salaData: SalaState = {
          ...data.sala,
          participantes: data.sala.participantes || [], // Array vazio se for undefined
          votosRevelados: data.sala.votosRevelados || false,
          modoAnimado: data.sala.modoAnimado || false,
        };

        setSala(salaData);
      } catch (err) {
        console.error('Erro ao carregar sala:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Erro desconhecido',
        );
      } finally {
        setLoading(false);
      }
    };

    carregarSala();
  }, [salaId, user?.id]);

  // Ações (vou deixar simplificado por enquanto)
  const votar = async (valor: number) => {
    if (!sala || !usuarioAtual) return;

    // Simulação - implementar API depois
    const participantesAtualizados =
      sala.participantes?.map((p) =>
        p.id === usuarioAtual.id
          ? { ...p, votou: true, voto: valor }
          : p,
      ) || [];

    setSala((prev) =>
      prev
        ? {
            ...prev,
            participantes: participantesAtualizados,
          }
        : null,
    );

    toast.success('Voto registrado!');
  };

  const revelarVotos = async () => {
    if (!sala || !isAdmin) return;

    setSala((prev) =>
      prev
        ? {
            ...prev,
            votosRevelados: true,
          }
        : null,
    );

    toast.success('Votos revelados!');
  };

  const resetarVotos = async () => {
    if (!sala || !isAdmin) return;

    const participantesResetados =
      sala.participantes?.map((p) => ({
        ...p,
        votou: false,
        voto: undefined,
      })) || [];

    setSala((prev) =>
      prev
        ? {
            ...prev,
            participantes: participantesResetados,
            votosRevelados: false,
          }
        : null,
    );

    toast.success('Votos resetados! Nova rodada iniciada.');
  };

  const finalizarHistoria = async () => {
    if (!sala || !isAdmin) return;
    // Implementar depois
    toast.success('História finalizada!');
  };

  const novaHistoria = async (
    titulo: string,
    descricao?: string,
  ) => {
    if (!sala || !isAdmin) return;
    // Implementar depois
    toast.success('Nova história iniciada!');
  };

  const toggleModoAnimado = () => {
    if (!sala) return;
    setSala((prev) =>
      prev
        ? {
            ...prev,
            modoAnimado: !prev.modoAnimado,
          }
        : null,
    );
  };

  const sairDaSala = async () => {
    // Implementar API depois
    console.log('Saindo da sala...');
  };

  const value: SalaContextType = {
    sala,
    loading,
    error,
    isAdmin,
    usuarioAtual,
    votar,
    revelarVotos,
    resetarVotos,
    finalizarHistoria,
    novaHistoria,
    toggleModoAnimado,
    sairDaSala,
  };

  return (
    <SalaContext.Provider value={value}>
      {children}
    </SalaContext.Provider>
  );
};

export const useSala = () => {
  const context = useContext(SalaContext);
  if (context === undefined) {
    throw new Error(
      'useSala deve ser usado dentro de um SalaProvider',
    );
  }
  return context;
};
