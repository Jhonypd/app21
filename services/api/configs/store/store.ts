import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import { apiSlice } from '../api-slice';

const rootReducer = combineReducers({
   auth: authReducer,
   [apiSlice.reducerPath]: apiSlice.reducer,
});

export const store = configureStore({
   reducer: rootReducer,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false,
      }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
