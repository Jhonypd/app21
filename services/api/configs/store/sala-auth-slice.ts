import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SessaoAtiva {
   salaId: string;
   sessaoId: string;
   timestamp: number;
}

interface SalaAuthState {
   tokenSala: string | null;
   expiracao?: string | null;
   sala: {
      id: string;
      codigo: string;
      titulo: string;
      sessaoAtiva: boolean;
      sessaoId: string;
   } | null;
   sessoesAtivas: SessaoAtiva[];
}

const SESSION_EXPIRY = 24 * 60 * 60 * 1000;
export const SALA_AUTH_STORAGE_KEY = 'app21_sala_auth_state';
export const SALA_AUTH_UPDATE_EVENT = 'app21:sala-auth-updated';

const createEmptySalaState = (): SalaAuthState => ({
   tokenSala: null,
   expiracao: null,
   sala: null,
   sessoesAtivas: [],
});

const initialState: SalaAuthState = createEmptySalaState();

const serializeSalaState = (state: SalaAuthState) => ({
   tokenSala: state.tokenSala ?? null,
});

const emitSalaAuthUpdate = () => {
   if (typeof window === 'undefined') return;
   window.dispatchEvent(new Event(SALA_AUTH_UPDATE_EVENT));
};

const persistSalaState = (state: SalaAuthState) => {
   if (typeof window === 'undefined') return;
   try {
      localStorage.setItem(
         SALA_AUTH_STORAGE_KEY,
         JSON.stringify(serializeSalaState(state)),
      );
      emitSalaAuthUpdate();
   } catch (error) {
      if (process.env.NODE_ENV === 'development') {
         console.warn('[salaAuth] Falha ao persistir estado:', error);
      }
   }
};

export const getPersistedSalaState = (): SalaAuthState => {
   if (typeof window === 'undefined') {
      return createEmptySalaState();
   }

   try {
      const raw = localStorage.getItem(SALA_AUTH_STORAGE_KEY);
      if (!raw) {
         return createEmptySalaState();
      }

      const data = JSON.parse(raw);
      return {
         tokenSala: data.tokenSala ?? null,
         expiracao: null,
         sala: null,
         sessoesAtivas: [],
      };
   } catch (error) {
      if (process.env.NODE_ENV === 'development') {
         console.warn('[salaAuth] Falha ao ler estado persistido:', error);
      }
      return createEmptySalaState();
   }
};

const salaAuthSlice = createSlice({
   name: 'salaAuth',
   initialState,
   reducers: {
      setSalaToken: (
         state,
         action: PayloadAction<{
            tokenSala: string;
            expiracao?: string;
         }>,
      ) => {
         state.tokenSala = action.payload.tokenSala;
         state.expiracao = action.payload.expiracao ?? null;

         // NOTA: Token é setado automaticamente via cookie httpOnly pelo backend
         // Não é necessário gerenciar manualmente via document.cookie
         // Redux mantém referência apenas para saber se usuário está em sala

         persistSalaState(state);
      },
      limparSalaToken: (state) => {
         state.tokenSala = null;
         state.expiracao = null;

         // NOTA: Cookie é limpo automaticamente pelo backend ao sair da sala
         // Não é necessário gerenciar manualmente via document.cookie

         persistSalaState(state);
      },

      // Gerenciamento de sessões ativas
      iniciarSessao: (
         state,
         action: PayloadAction<{
            salaId: string;
            sessaoId: string;
         }>,
      ) => {
         // Garantir que sessoesAtivas existe (para compatibilidade com estados antigos)
         if (!state.sessoesAtivas) {
            state.sessoesAtivas = [];
         }

         // Remove sessão anterior da mesma sala
         state.sessoesAtivas = state.sessoesAtivas.filter(
            (s) => s.salaId !== action.payload.salaId,
         );

         // Adiciona nova sessão
         state.sessoesAtivas.push({
            salaId: action.payload.salaId,
            sessaoId: action.payload.sessaoId,
            timestamp: Date.now(),
         });

         persistSalaState(state);
      },

      encerrarSessao: (state, action: PayloadAction<string>) => {
         state.sessoesAtivas = state.sessoesAtivas.filter(
            (s) => s.salaId !== action.payload,
         );

         persistSalaState(state);
      },

      limparSessoesExpiradas: (state) => {
         const now = Date.now();
         state.sessoesAtivas = state.sessoesAtivas.filter(
            (s) => now - s.timestamp < SESSION_EXPIRY,
         );

         persistSalaState(state);
      },

      limparTodasSessoes: (state) => {
         state.sessoesAtivas = [];

         persistSalaState(state);
      },

      hydrateSalaStateFromStorage: (state) => {
         if (typeof window === 'undefined') return;

         const persisted = getPersistedSalaState();
         state.tokenSala = persisted.tokenSala;
         // Resto permanece vazio (não persiste)
      },
   },
});

export const {
   setSalaToken,
   limparSalaToken,
   iniciarSessao,
   encerrarSessao,
   limparSessoesExpiradas,
   limparTodasSessoes,
   hydrateSalaStateFromStorage,
} = salaAuthSlice.actions;

export default salaAuthSlice.reducer;
