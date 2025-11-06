'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';

export interface Perfil {
  id?: string;
  nome?: string;
  email?: string;
}

interface AuthContextType {
  user: Perfil | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  setToken: (t: string | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store',
        });

        if (!mounted) return;

        if (res.ok) {
          const json = await res.json();
          if (json?.authenticated && json.user) {
            setUser({
              id: json.user.id as string | undefined,
              nome: json.user.nome as string | undefined,
              email: json.user.email as string | undefined,
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(
          'Erro ao obter sessão (/api/auth/me):',
          err,
        );
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

  fetchMe();

    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.authenticated && json.user) {
          setUser({
            id: json.user.id as string | undefined,
            nome: json.user.nome as string | undefined,
            email: json.user.email as string | undefined,
          });
          return;
        }
      }
      setUser(null);
    } catch (err) {
      console.error('Erro ao atualizar sessão (/api/auth/me):', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    token,
    setToken,
    refresh,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      'useAuth deve ser usado dentro de um AuthProvider',
    );
  }
  return context;
};
