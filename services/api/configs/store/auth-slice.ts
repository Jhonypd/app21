import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { DadosContaPessoa as Usuario } from '../../pessoas.api';
import { deleteCookie, setCookie } from 'cookies-next';

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
      state.accessToken = action.payload.accessToken;
      setCookie(
        'access_token',
        action.payload.accessToken,
        {
          path: '/',
          maxAge: 15 * 60,
        },
      );
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        setCookie(
          'refresh_token',
          action.payload.refreshToken,
          {
            path: '/',
            maxAge: 60 * 60 * 24 * 3,
          },
        );
      }
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

      deleteCookie('access_token');
      deleteCookie('refresh_token');
    },
  },
});

export const { setCredentials, setUser, logout } =
  authSlice.actions;
export default authSlice.reducer;
