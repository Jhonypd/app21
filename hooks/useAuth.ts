'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/api/configs/store/store';
import { logout as logoutAction } from '@/services/api/configs/store/auth-slice';
import { useRevogarRefreshTokenMutation } from '@/services/api/auth-api';
import { useRouter } from 'next/navigation';

export function useAuth() {
   const dispatch = useDispatch();
   const router = useRouter();
   const usuario = useSelector((state: RootState) => state.auth.usuario);

   const [revogarRefreshToken, { isLoading: isLogoutLoading }] =
      useRevogarRefreshTokenMutation();

   const isAuthenticated = !!usuario;

   const logout = async () => {
      if (isLogoutLoading) {
         return;
      }

      // Tenta revogar a sessão no backend (refresh token vem do cookie)
      try {
         await revogarRefreshToken().unwrap();
      } catch {
         // Continua com o logout mesmo se falhar
      }

      // Limpar Redux
      dispatch(logoutAction());

      router.push('/auth/login');
   };

   return {
      usuario,
      isAuthenticated,
      isLogoutLoading,
      logout,
   };
}
