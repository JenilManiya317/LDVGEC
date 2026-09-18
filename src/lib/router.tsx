import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';

interface RouterContextType {
  path: string;
  params: Record<string, string>;
  navigate: (to: string, params?: Record<string, string>) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Normalize path from hash or pathname
const getInitialPath = (): string => {
  if (typeof window === 'undefined') return '/';
  if (window.location.hash) {
    const hashPath = window.location.hash.replace(/^#/, '');
    return hashPath || '/';
  }
  return window.location.pathname || '/';
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(getInitialPath);
  const [params, setParams] = useState<Record<string, string>>({});
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const newPath = getInitialPath();
      setPath(newPath);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navigate = (to: string, newParams?: Record<string, string>) => {
    if (newParams) setParams(newParams);
    setPath(to);
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Protection Guard
  useEffect(() => {
    const isFarmerRoute = path.startsWith('/farmer/') && path !== '/farmer/login' && path !== '/farmer/register';
    const isCustomerRoute = path.startsWith('/customer/') && path !== '/customer/login' && path !== '/customer/register';

    if (isFarmerRoute) {
      if (!isAuthenticated) {
        navigate('/choose-user');
        return;
      }
      if (role !== 'farmer') {
        navigate('/customer/dashboard');
        return;
      }
    }

    if (isCustomerRoute) {
      if (!isAuthenticated) {
        navigate('/choose-user');
        return;
      }
      if (role !== 'customer') {
        navigate('/farmer/dashboard');
        return;
      }
    }
  }, [path, isAuthenticated, role]);

  return (
    <RouterContext.Provider value={{ path, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
