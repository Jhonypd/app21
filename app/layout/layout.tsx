'use client';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/loading';
import LayoutContent from './layout-content';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading active />;
  }

  return <LayoutContent>{children}</LayoutContent>;
};

export default Layout;
