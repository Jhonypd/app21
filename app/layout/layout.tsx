'use client';
import { ReactNode } from 'react';
import LayoutContent from './layout-content';
import { Provider } from 'react-redux';
import {
  persistor,
  store,
} from '@/services/api/configs/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { LoadingGlobalRedux } from '@/components/loading-global-redux';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <LoadingGlobalRedux>
          <LayoutContent>{children}</LayoutContent>
        </LoadingGlobalRedux>
      </PersistGate>
    </Provider>
  );
};

export default Layout;
