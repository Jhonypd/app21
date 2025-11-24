'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/api/configs/store/store';
import { logout as logoutAction } from '@/services/api/configs/store/auth-slice';
import { limparSalaToken } from '@/services/api/configs/store/sala-auth-slice';
import { useRevogarRefreshTokenMutation } from '@/services/api/auth-api';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const usuario = useSelector(
    (state: RootState) => state.auth.usuario,
  );
  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken,
  );
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken,
  );

  const [revogarRefreshToken] =
    useRevogarRefreshTokenMutation();

  const isAuthenticated = !!accessToken;

  const logout = async () => {
    // Tenta revogar o token no backend (não bloqueia se falhar)
    if (refreshToken) {
      try {
        await revogarRefreshToken({
          refreshToken,
        }).unwrap();
      } catch (error) {
        console.error(
          'Erro ao revogar token no backend:',
          error,
        );
        // Continua com o logout mesmo se falhar
      }
    }

    // Limpa o estado local e cookies
    dispatch(logoutAction());
    dispatch(limparSalaToken());

    // Redireciona para login
    router.push('/auth/login');
  };

  return {
    usuario,
    accessToken,
    refreshToken,
    isAuthenticated,
    logout,
  };
}
