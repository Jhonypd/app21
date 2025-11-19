import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

interface SalaAuthState {
  tokenSala: string | null;
  expiracao?: string | null;
}

const initialState: SalaAuthState = {
  tokenSala: null,
  expiracao: null,
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
    },
    clearSalaToken: (state) => {
      state.tokenSala = null;
      state.expiracao = null;
    },
  },
});

export const { setSalaToken, clearSalaToken } =
  salaAuthSlice.actions;
export default salaAuthSlice.reducer;
