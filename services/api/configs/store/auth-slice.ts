import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { DadosContaPessoa as Usuario } from '../../pessoas.api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: Usuario | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
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
      console.log(
        '💾 [auth-slice] setCredentials chamado:',
        {
          hasAccessToken: !!action.payload.accessToken,
          hasRefreshToken: !!action.payload.refreshToken,
          accessTokenPreview: action.payload.accessToken
            ? `${action.payload.accessToken.substring(0, 20)}...`
            : 'undefined',
          refreshTokenPreview: action.payload.refreshToken
            ? `${action.payload.refreshToken.substring(0, 20)}...`
            : 'undefined',
        },
      );

      // ✅ Apenas atualizar o Redux state
      // Redux Persist salvará automaticamente no localStorage
      state.accessToken = action.payload.accessToken;

      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    setUser: (
      state,
      action: PayloadAction<Usuario | null>,
    ) => {
      state.usuario = action.payload;
    },
    logout: (state) => {
      // ✅ Apenas limpar o Redux state
      // Redux Persist limpará automaticamente o localStorage
      state.accessToken = null;
      state.refreshToken = null;
      state.usuario = null;
    },
  },
});

export const { setCredentials, setUser, logout } =
  authSlice.actions;
export default authSlice.reducer;
