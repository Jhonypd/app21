import {
  createListenerMiddleware,
  isAsyncThunkAction,
} from '@reduxjs/toolkit';
import {
  startLoading,
  stopLoading,
} from './loading-slice-api';

interface WithShowLoading {
  data?: unknown;
  showLoading?: boolean;
  [key: string]: unknown;
}

const loadingMiddleware = createListenerMiddleware();

loadingMiddleware.startListening({
  matcher: isAsyncThunkAction,
  effect: async (action, listenerApi) => {
    const metaArg = action?.meta?.arg as WithShowLoading;

    if (!metaArg?.showLoading) return;

    if (action.type.endsWith('/pendente')) {
      listenerApi.dispatch(startLoading());
    } else if (
      action.type.endsWith('/cumprida') ||
      action.type.endsWith('/rejeitada')
    ) {
      listenerApi.dispatch(stopLoading());
    }
  },
});

export default loadingMiddleware;
