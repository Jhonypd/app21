import {
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import salaAuthReducer from './sala-auth-slice';
import { apiSlice } from '../api-slice';
import storage from 'redux-persist/lib/storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

const rootReducer = combineReducers({
  auth: authReducer,
  salaAuth: salaAuthReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'salaAuth'],
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
