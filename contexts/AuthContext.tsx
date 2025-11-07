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
  console.log({ user });
  // inicializa token a partir do localStorage (client-side)
  const [token, setTokenState] = useState<string | null>(
    () => {
      try {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('access_token');
        }
      } catch {
        // ignore
      }
      return null;
    },
  );

  // functor para setar token e persistir em localStorage
  const setToken = (t: string | null) => {
    try {
      if (typeof window !== 'undefined') {
        if (t) {
          localStorage.setItem('access_token', t);
        } else {
          localStorage.removeItem('access_token');
        }
      }
    } catch {
      // ignore storage errors
    }
    setTokenState(t);
  };

  // Helper: decodifica payload de JWT (sem verificar assinatura)
  const decodeJwt = (jwt: string | null) => {
    if (!jwt) return null;
    try {
      const parts = jwt.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      // add padding se necessário
      const pad = payload.length % 4;
      const padded =
        pad === 0 ? payload : payload + '='.repeat(4 - pad);
      const decoded = atob(
        padded.replace(/-/g, '+').replace(/_/g, '/'),
      );
      return JSON.parse(
        decodeURIComponent(
          decoded
            .split('')
            .map(function (c) {
              return (
                '%' +
                ('00' + c.charCodeAt(0).toString(16)).slice(
                  -2,
                )
              );
            })
            .join(''),
        ),
      );
    } catch {
      console.error('Erro ao decodificar JWT:');
      return null;
    }
  };

  // Ao montar, se houver token no storage, popula user a partir do token
  useEffect(() => {
    const init = async () => {
      try {
        if (token) {
          const payload = decodeJwt(token);
          if (payload) {
            setUser({
              id:
                (payload['Usu_Id'] as string) ||
                (payload.sub as string) ||
                (payload.id as string) ||
                undefined,
              nome:
                (payload['Usu_na'] as string) ||
                (payload.name as string) ||
                (payload.nome as string) ||
                undefined,
              email: (payload.email as string) || undefined,
            });
            return;
          }
          setUser(null);
          return;
        }

        // se não tem token local, tenta obter sessão do servidor via cookie HttpOnly
        try {
          const res = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          });
          if (res.ok) {
            const json = await res.json();
            // ApiResponse wrapper
            if (json?.Sucesso && json?.Resultado) {
              setUser({
                id: json.Resultado.id || undefined,
                nome: json.Resultado.nome || undefined,
                email: json.Resultado.email || undefined,
              });
              return;
            }
          }
          setUser(null);
        } catch (err) {
          console.error(
            'Erro ao obter sessão via /api/auth/session:',
            err,
          );
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh agora deriva do token (se existir). Caso queira implementar refresh token
  // no backend, adapte aqui para chamar o endpoint apropriado e atualizar o token.
  const refresh = async () => {
    try {
      setLoading(true);
      if (token) {
        const payload = decodeJwt(token);
        if (payload) {
          setUser({
            id:
              (payload['Usu_Id'] as string) ||
              (payload.sub as string) ||
              (payload.id as string) ||
              undefined,
            nome:
              (payload['Usu_na'] as string) ||
              (payload.name as string) ||
              (payload.nome as string) ||
              undefined,
            email: (payload.email as string) || undefined,
          });
          return;
        }
        setUser(null);
        return;
      }

      // se não tem token local, tenta obter sessão do servidor via cookie HttpOnly
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.Sucesso && json?.Resultado) {
            setUser({
              id: json.Resultado.id || undefined,
              nome: json.Resultado.nome || undefined,
              email: json.Resultado.email || undefined,
            });
            return;
          }
        }
        setUser(null);
        return;
      } catch (err) {
        console.error(
          'Erro ao atualizar sessão via /api/auth/session:',
          err,
        );
        setUser(null);
        return;
      }
    } catch (err) {
      console.error(
        'Erro ao atualizar sessão via token:',
        err,
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // opcional: informar backend sobre logout se existir endpoint
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // ignore erro se rota não existir
      }
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    } finally {
      // limpa token e usuário localmente
      setToken(null);
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
