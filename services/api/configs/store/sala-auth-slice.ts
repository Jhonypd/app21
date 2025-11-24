import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

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

const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

const initialState: SalaAuthState = {
  tokenSala: null,
  expiracao: null,
  sala: null,
  sessoesAtivas: [],
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

      // Salvar token nos cookies para o middleware poder acessar
      if (typeof document !== 'undefined') {
        const expiracao = action.payload.expiracao
          ? new Date(action.payload.expiracao).toUTCString()
          : new Date(
              Date.now() + 6 * 60 * 60 * 1000,
            ).toUTCString(); // 6h padrão

        document.cookie = `token_sala=${action.payload.tokenSala}; expires=${expiracao}; path=/; SameSite=Strict`;
      }
    },
    limparSalaToken: (state) => {
      state.tokenSala = null;
      state.expiracao = null;

      // Remover token dos cookies
      if (typeof document !== 'undefined') {
        document.cookie =
          'token_sala=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
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
    },

    encerrarSessao: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.sessoesAtivas = state.sessoesAtivas.filter(
        (s) => s.salaId !== action.payload,
      );
    },

    refreshSession: (
      state,
      action: PayloadAction<string>,
    ) => {
      const session = state.sessoesAtivas.find(
        (s) => s.salaId === action.payload,
      );
      if (session) {
        session.timestamp = Date.now();
      }
    },

    limparSessoesExpiradas: (state) => {
      const now = Date.now();
      state.sessoesAtivas = state.sessoesAtivas.filter(
        (s) => now - s.timestamp < SESSION_EXPIRY,
      );
    },

    limparTodasSessoes: (state) => {
      state.sessoesAtivas = [];
    },
  },
});

export const {
  setSalaToken,
  limparSalaToken,
  iniciarSessao,
  encerrarSessao,
  refreshSession,
  limparSessoesExpiradas,
  limparTodasSessoes,
} = salaAuthSlice.actions;

export default salaAuthSlice.reducer;
