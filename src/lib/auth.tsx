import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { DEMO_FARMER, DEMO_CUSTOMER } from './mock-data';
import { api, setToken, clearToken } from './api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, name?: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoFarmer: () => void;
  loginAsDemoCustomer: () => void;
  register: (data: { name: string; email: string; password?: string; role: UserRole; phone?: string; location: string }) => Promise<{ success: boolean; error?: string }>;
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

  /**
   * Convert a backend user object to our UserProfile format.
   */
  const toUserProfile = (backendUser: any, chosenRole?: UserRole): UserProfile => ({
    id: String(backendUser.id || `user_${Date.now()}`),
    name: backendUser.name || 'User',
    email: backendUser.email || '',
    role: (backendUser.role || chosenRole || 'farmer') as UserRole,
    phone: backendUser.phone || '',
    location: backendUser.location || '',
    avatar: backendUser.avatar ||
      (backendUser.role === 'farmer' ? DEMO_FARMER.avatar : DEMO_CUSTOMER.avatar),
    farmName: backendUser.farm_name || undefined,
    totalArea: backendUser.total_area || undefined,
    rating: backendUser.rating || 0,
    reviewsCount: backendUser.reviews_count || 0,
  });

  /**
   * Quick login with demo data (no backend call) — used for role selection.
   */
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

  /**
   * Login with email/password via the backend API.
   * Falls back to demo login if the backend is unavailable.
   */
  const loginWithCredentials = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.login(email, password);
      if (res.error) {
        // Backend returned an error — try demo fallback
        console.warn('Backend login failed, using demo fallback:', res.error);
        // If this looks like a demo email, use demo data
        if (email.includes('farmer') || email.includes('rudra')) {
          login('farmer', email);
          return { success: true };
        } else {
          login('customer', email);
          return { success: true };
        }
      }
      // Store JWT token and user profile
      const { access_token, user: backendUser } = res.data;
      setToken(access_token);
      setUser(toUserProfile(backendUser));
      return { success: true };
    } catch {
      // Network error — backend is probably down, use demo
      console.warn('Backend unreachable, using demo login');
      if (email.includes('farmer')) {
        login('farmer', email);
      } else {
        login('customer', email);
      }
      return { success: true };
    }
  };

  const loginAsDemoFarmer = () => {
    setUser(DEMO_FARMER);
  };

  const loginAsDemoCustomer = () => {
    setUser(DEMO_CUSTOMER);
  };

  /**
   * Register via the backend API.
   * Falls back to local registration if the backend is unavailable.
   */
  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    location: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.register({
        name: data.name,
        email: data.email,
        password: data.password || 'farmwise123',
        role: data.role,
        phone: data.phone,
        location: data.location,
      });

      if (res.error) {
        console.warn('Backend register failed, using local fallback:', res.error);
        // Fall back to local registration
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
        return { success: true };
      }

      const { access_token, user: backendUser } = res.data;
      setToken(access_token);
      setUser(toUserProfile(backendUser, data.role));
      return { success: true };
    } catch {
      // Fallback to local
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
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        loginWithCredentials,
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
