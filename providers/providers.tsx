'use client';

import { Provider } from 'react-redux';
import { store } from '@/services/api/configs/store/store';
import { useEffect } from 'react';
import { hydrateFromStorage } from '@/services/api/configs/store/auth-slice';

function AuthHydration() {
   useEffect(() => {
      store.dispatch(hydrateFromStorage());
   }, []);

   return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
   return (
      <Provider store={store}>
         <AuthHydration />
         {children}
      </Provider>
   );
}
