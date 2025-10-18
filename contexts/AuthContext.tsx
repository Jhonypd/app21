'use client';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { createClient } from '@/utils/supabase/client';
import { ObterPerfil } from '@/data/auth/obter-perfil';
import type { Session, User } from '@supabase/supabase-js';

export interface Perfil
  extends Pick<
    User,
    | 'email'
    | 'id'
    | 'aud'
    | 'action_link'
    | 'phone'
    | 'user_metadata'
  > {
  nome: string;
}

interface AuthContextType {
  session: Session | null;
  user: Perfil | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<{ error: any }>;
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
  const [session, setSession] = useState<Session | null>(
    null,
  );
  const [user, setUser] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const perfil = await ObterPerfil({
          user_id: session.user.id,
        });
        setUser({
          ...session.user,
          nome: perfil?.nome ?? '',
        });
      }

      setLoading(false);
    };

    init();

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          setSession(newSession);

          if (newSession) {
            const perfil = await ObterPerfil({
              user_id: newSession.user.id,
            });
            setUser({
              ...newSession.user,
              nome: perfil?.nome ?? '',
            });
          } else {
            setUser(null);
          }

          setLoading(false);
        },
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return { error };
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    isAuthenticated: !!user,
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
