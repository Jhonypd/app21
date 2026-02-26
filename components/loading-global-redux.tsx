'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/services/api/configs/store/store';
import { useLazyObterDadosContaQuery } from '@/services/api/pessoas.api';
import {
   setUser,
   logout,
   getCsrfTokenFromStorage,
} from '@/services/api/configs/store/auth-slice';
import Loading from './loading';

export function LoadingGlobalRedux({ children }: { children: ReactNode }) {
   const dispatch = useDispatch();
   const usuario = useSelector((state: RootState) => state.auth.usuario);
   // CSRF token presente = há sessão ativa (setado no login, limpo no logout)
   const hasSessao = !!getCsrfTokenFromStorage();
   const [loadUser] = useLazyObterDadosContaQuery();

   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function init() {
         // Nenhuma sessão ativa → libera a UI
         if (!hasSessao) {
            setLoading(false);
            return;
         }

         // Já temos o usuário no Redux → libera
         if (usuario) {
            setLoading(false);
            return;
         }

         // Temos token mas não temos user → carregar
         try {
            const resposta = await loadUser().unwrap();

            if (resposta?.Sucesso && resposta?.Resultado?.pessoa) {
               dispatch(setUser(resposta.Resultado.pessoa));
            } else {
               dispatch(logout());
            }
         } catch (err) {
            dispatch(logout());
         }

         setLoading(false);
      }

      init();
   }, [hasSessao]);

   if (loading) {
      return (
         <Loading
            active
            type="default"
         />
      );
   }

   return <>{children}</>;
}
