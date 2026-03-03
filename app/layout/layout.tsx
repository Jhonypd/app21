'use client';
import { ReactNode } from 'react';
import LayoutContent from './layout-content';
import { Provider } from 'react-redux';
import { store } from '@/services/api/configs/store/store';
import { LoadingGlobalRedux } from '@/components/loading-global-redux';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/loading';

interface LayoutProps {
   children: ReactNode;
}

const LayoutWithAuth = ({ children }: LayoutProps) => {
   const { isLogoutLoading } = useAuth();

   return (
      <LoadingGlobalRedux>
         <LayoutContent>
            <>
               {isLogoutLoading && (
                  <Loading
                     active
                     type="page-transition"
                  />
               )}
               {children}
            </>
         </LayoutContent>
      </LoadingGlobalRedux>
   );
};

const Layout = ({ children }: LayoutProps) => {
   return (
      <Provider store={store}>
         <LayoutWithAuth>{children}</LayoutWithAuth>
      </Provider>
   );
};

export default Layout;
