'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use seu cliente próprio
import { ObterPerfil } from '@/data/auth/obter-perfil';
import type { Session, User } from '@supabase/supabase-js';

export interface perfil
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

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(
    null,
  );
  const [user, setUser] = useState<perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(); // Use sua função createClient

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

  return {
    session,
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
};
