'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/api/configs/store/store';
import { logout as logoutAction } from '@/services/api/configs/store/auth-slice';

export function useAuth() {
  const dispatch = useDispatch();
  const usuario = useSelector(
    (state: RootState) => state.auth.usuario,
  );
  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken,
  );
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken,
  );

  const isAuthenticated = !!accessToken;

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    usuario,
    accessToken,
    refreshToken,
    isAuthenticated,
    logout,
  };
}
