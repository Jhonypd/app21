'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/api/configs/store/store';
import { logout as logoutAction } from '@/services/api/configs/store/auth-slice';
import {
   limparSalaToken,
   iniciarSessao,
   encerrarSessao,
   limparSessoesExpiradas,
   limparTodasSessoes,
   getPersistedSalaState,
   SALA_AUTH_STORAGE_KEY,
   SALA_AUTH_UPDATE_EVENT,
} from '@/services/api/configs/store/sala-auth-slice';
import { useRevogarRefreshTokenMutation } from '@/services/api/auth-api';
import { useRouter } from 'next/navigation';

const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

export function useSalaAuth() {
   const dispatch = useDispatch();
   const router = useRouter();
   const [salaStorage, setSalaStorage] = useState(getPersistedSalaState);

   const [revogarRefreshToken] = useRevogarRefreshTokenMutation();

   const syncSalaState = useCallback(() => {
      setSalaStorage(getPersistedSalaState());
   }, []);

   useEffect(() => {
      if (typeof window === 'undefined') return;

      const handleStorage = (event: StorageEvent) => {
         if (!event.key || event.key !== SALA_AUTH_STORAGE_KEY) {
            return;
         }
         syncSalaState();
      };

      const handleCustomUpdate = (_event: Event) => {
         syncSalaState();
      };

      // Hidratar imediatamente ao montar
      syncSalaState();

      window.addEventListener('storage', handleStorage);
      window.addEventListener(SALA_AUTH_UPDATE_EVENT, handleCustomUpdate);

      return () => {
         window.removeEventListener('storage', handleStorage);
         window.removeEventListener(SALA_AUTH_UPDATE_EVENT, handleCustomUpdate);
      };
   }, [syncSalaState]);

   const sessoesAtivas = salaStorage.sessoesAtivas ?? [];
   const sala = salaStorage.tokenSala;

   const isAuthenticated = !!useSelector(
      (state: RootState) => state.auth.usuario,
   );

   const logout = async () => {
      // Tenta revogar a sessão no backend (refresh token vem do cookie)
      try {
         await revogarRefreshToken().unwrap();
      } catch {
         // Continua com o logout mesmo se falhar
      }

      dispatch(logoutAction());
      dispatch(limparSalaToken());
      syncSalaState();

      router.push('/auth/login');
   };

   // Gerenciamento de sessões ativas
   const iniciarSessaoAtiva = (salaId: string, sessaoId: string) => {
      dispatch(iniciarSessao({ salaId, sessaoId }));
      syncSalaState();
   };

   const encerrarSessaoAtiva = (salaId: string) => {
      dispatch(encerrarSessao(salaId));
      syncSalaState();
   };

   const obterSessaoAtiva = (salaId: string): string | null => {
      if (!sessoesAtivas || !Array.isArray(sessoesAtivas)) {
         return null;
      }

      const sessao = sessoesAtivas.find((s) => s.salaId === salaId);

      if (!sessao) return null;

      // Verificar se ainda é válida
      const now = Date.now();
      if (now - sessao.timestamp > SESSION_EXPIRY) {
         encerrarSessaoAtiva(salaId);
         return null;
      }

      return sessao.sessaoId;
   };

   const limparSessoesAntigas = () => {
      dispatch(limparSessoesExpiradas());
      syncSalaState();
   };

   const limparSessoes = () => {
      dispatch(limparTodasSessoes());
      syncSalaState();
   };

   const limparTokenSala = () => {
      dispatch(limparSalaToken());
      syncSalaState();
   };

   return {
      // Dados da sala
      sala,
      isAuthenticated,
      logout,

      // Gerenciamento de sessões ativas
      sessoesAtivas,
      iniciarSessaoAtiva,
      encerrarSessaoAtiva,
      obterSessaoAtiva,
      limparSessoesAntigas,
      limparSessoes,
      limparTokenSala,
   };
}
