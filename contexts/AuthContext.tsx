'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';

export interface Perfil {
  Usu_Id: string;
  Usu_na: string;
  Email: string;
  Dt_Ex: Date;
  Idp: string;
}

interface AuthContextType {
  user: Perfil | null;
  loading: boolean;
  isAuthenticated: boolean;
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

  // Ao montar, tenta obter sessão do servidor via cookie HttpOnly
  useEffect(() => {
    const init = async () => {
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
              Usu_Id: json.Resultado.id,
              Usu_na: json.Resultado.nome,
              Email: json.Resultado.email,
              Idp: json.Resultado.idp,
              Dt_Ex: new Date(json.Resultado.dt_ex),
            });
          }
        }
      } catch (err) {
        console.error(
          'Erro ao obter sessão via /api/auth/session:',
          err,
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Refresh: atualiza sessão do servidor via cookie HttpOnly
  const refresh = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.Sucesso && json?.Resultado) {
          setUser({
            Usu_Id: json.Resultado.id,
            Usu_na: json.Resultado.nome,
            Email: json.Resultado.email,
            Idp: json.Resultado.idp,
            Dt_Ex: new Date(json.Resultado.dt_ex),
          });
          return;
        }
      }
      setUser(null);
    } catch (err) {
      console.error(
        'Erro ao atualizar sessão via /api/auth/session:',
        err,
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Chama endpoint de logout para limpar cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    } finally {
      // Limpa usuário localmente
      setUser(null);
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
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
