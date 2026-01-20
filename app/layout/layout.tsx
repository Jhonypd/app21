'use client';
import { ReactNode } from 'react';
import LayoutContent from './layout-content';
import { Provider } from 'react-redux';
import { store } from '@/services/api/configs/store/store';
import { LoadingGlobalRedux } from '@/components/loading-global-redux';

// 🔥 REMOVIDO: Redux Persist / PersistGate - agora usamos localStorage diretamente

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Provider store={store}>
      <LoadingGlobalRedux>
        <LayoutContent>{children}</LayoutContent>
      </LoadingGlobalRedux>
    </Provider>
  );
};

export default Layout;
