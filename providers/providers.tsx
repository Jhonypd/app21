'use client';

import { Provider } from 'react-redux';
import { store } from '@/services/api/configs/store/store';
import { useEffect } from 'react';
import { hydrateFromStorage } from '@/services/api/configs/store/auth-slice';

// 🔥 Limpar qualquer resquício de persist:root no carregamento
function cleanupLegacyStorage() {
  if (typeof window === 'undefined') return;

  // Remover persist:root legado
  const persistRoot = localStorage.getItem('persist:root');
  if (persistRoot) {
    console.warn(
      '[PROVIDERS] Removendo persist:root legado...',
    );
    localStorage.removeItem('persist:root');
  }

  // Remover qualquer item com prefixo persist:
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('persist:')) {
      console.warn(
        `[PROVIDERS] Removendo item legado: ${key}`,
      );
      localStorage.removeItem(key);
    }
  });
}

function AuthHydration() {
  useEffect(() => {
    // Limpar storage legado
    cleanupLegacyStorage();

    // Hidratar Redux state com tokens do localStorage
    store.dispatch(hydrateFromStorage());
  }, []);

  return null;
}

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthHydration />
      {children}
    </Provider>
  );
}
