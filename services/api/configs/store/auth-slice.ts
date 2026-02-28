import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DadosContaPessoa as Usuario } from '../../../types';

const CSRF_STORAGE_KEY = 'app21_csrf_token';

export const saveCsrfTokenToStorage = (csrfToken: string) => {
   if (typeof window !== 'undefined') {
      localStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
   }
};

export const getCsrfTokenFromStorage = (): string | null => {
   if (typeof window === 'undefined') return null;
   return localStorage.getItem(CSRF_STORAGE_KEY);
};

export const clearCsrfTokenFromStorage = () => {
   if (typeof window !== 'undefined') {
      localStorage.removeItem(CSRF_STORAGE_KEY);
   }
};

interface AuthState {
   csrfToken: string | null;
   usuario: Usuario | null;
}

const initialState: AuthState = {
   csrfToken: null,
   usuario: null,
};

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      setCsrfToken: (state, action: PayloadAction<string>) => {
         state.csrfToken = action.payload;
         saveCsrfTokenToStorage(action.payload);
      },
      hydrateFromStorage: (state) => {
         if (typeof window === 'undefined') return;
         state.csrfToken = getCsrfTokenFromStorage();
      },
      setUser: (state, action: PayloadAction<Usuario | null>) => {
         state.usuario = action.payload;
      },
      logout: (state) => {
         state.csrfToken = null;
         state.usuario = null;
         clearCsrfTokenFromStorage();

         // Limpar todo localStorage relacionado a autenticação
         if (typeof window !== 'undefined') {
            try {
               localStorage.removeItem('app21_sala_auth_state');
            } catch (e) {
               console.warn('Erro ao limpar localStorage:', e);
            }
         }
      },
   },
});

export const { setCsrfToken, setUser, logout, hydrateFromStorage } =
   authSlice.actions;
export default authSlice.reducer;
