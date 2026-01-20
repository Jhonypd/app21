import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { DadosContaPessoa as Usuario } from '../../pessoas.api';

// 🔥 STORAGE KEY para tokens (independente do Redux Persist)
const AUTH_STORAGE_KEY = 'app21_auth_tokens';

// 🔥 Funções para salvar/ler tokens DIRETAMENTE do localStorage
export const saveTokensToStorage = (
  accessToken: string,
  refreshToken: string,
) => {
  if (typeof window !== 'undefined') {
    const data = {
      accessToken,
      refreshToken,
      savedAt: Date.now(),
    };
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(data),
    );
  }
};

export const getTokensFromStorage = (): {
  accessToken: string | null;
  refreshToken: string | null;
} => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw)
      return { accessToken: null, refreshToken: null };

    const data = JSON.parse(raw);

    return {
      accessToken: data.accessToken || null,
      refreshToken: data.refreshToken || null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
};

export const clearTokensFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // 🔥 Também limpar persist:root legado
    localStorage.removeItem('persist:root');
  }
};

// 🔥 Função para limpar TUDO e forçar logout completo
export const forceCleanAllStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('persist:root');
    // Limpar qualquer outro item de persist
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('persist:')) {
        localStorage.removeItem(key);
      }
    });
  }
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: Usuario | null;
}

// 🔥 Inicializar com tokens do localStorage (se existirem)
const storedTokens =
  typeof window !== 'undefined'
    ? getTokensFromStorage()
    : { accessToken: null, refreshToken: null };

const initialState: AuthState = {
  accessToken: storedTokens.accessToken,
  refreshToken: storedTokens.refreshToken,
  usuario: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;

      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }

      // 🔥 CRÍTICO: Salvar DIRETAMENTE no localStorage (não depender do Redux Persist)
      saveTokensToStorage(
        action.payload.accessToken,
        action.payload.refreshToken ||
          state.refreshToken ||
          '',
      );
    },
    setUser: (
      state,
      action: PayloadAction<Usuario | null>,
    ) => {
      state.usuario = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.usuario = null;

      clearTokensFromStorage();
    },
  },
});

export const { setCredentials, setUser, logout } =
  authSlice.actions;
export default authSlice.reducer;
