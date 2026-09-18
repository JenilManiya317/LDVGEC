import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { DEMO_FARMER, DEMO_CUSTOMER } from './mock-data';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, name?: string) => void;
  loginAsDemoFarmer: () => void;
  loginAsDemoCustomer: () => void;
  register: (data: { name: string; email: string; role: UserRole; phone?: string; location: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'agrisetu_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const isAuthenticated = !!user;
  const role = user ? user.role : null;

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = (chosenRole: UserRole, email?: string, name?: string) => {
    if (chosenRole === 'farmer') {
      setUser({
        ...DEMO_FARMER,
        email: email || DEMO_FARMER.email,
        name: name || DEMO_FARMER.name
      });
    } else {
      setUser({
        ...DEMO_CUSTOMER,
        email: email || DEMO_CUSTOMER.email,
        name: name || DEMO_CUSTOMER.name
      });
    }
  };

  const loginAsDemoFarmer = () => {
    setUser(DEMO_FARMER);
  };

  const loginAsDemoCustomer = () => {
    setUser(DEMO_CUSTOMER);
  };

  const register = (data: { name: string; email: string; role: UserRole; phone?: string; location: string }) => {
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone || '+91 98000 00000',
      location: data.location || 'Gujarat, India',
      avatar: data.role === 'farmer' ? DEMO_FARMER.avatar : DEMO_CUSTOMER.avatar,
      farmName: data.role === 'farmer' ? `${data.name}'s Green Field` : undefined,
      totalArea: data.role === 'farmer' ? '10 Acres' : undefined,
      rating: 5.0,
      reviewsCount: 1
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        loginAsDemoFarmer,
        loginAsDemoCustomer,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
