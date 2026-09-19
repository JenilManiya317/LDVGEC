import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { DEMO_FARMER, DEMO_CUSTOMER } from './mock-data';
import { api, setToken, clearToken } from './api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, name?: string) => void;
  loginWithCredentials: (email: string, password: string, chosenRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoFarmer: () => void;
  loginAsDemoCustomer: () => void;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    location: string;
    avatar?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile> & { farmName?: string; totalArea?: string }) => Promise<{ success: boolean; error?: string }>;
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
  const toUserProfile = (backendUser: any, chosenRole?: UserRole): UserProfile => {
    const userRole = (chosenRole || backendUser.role || 'farmer') as UserRole;
    return {
      id: String(backendUser.id || `user_${Date.now()}`),
      name: backendUser.name || 'User',
      email: backendUser.email || '',
      role: userRole,
      phone: backendUser.phone || '',
      location: backendUser.location || '',
      avatar: backendUser.avatar ||
        (userRole === 'farmer' ? DEMO_FARMER.avatar : DEMO_CUSTOMER.avatar),
      farmName: backendUser.farm_name || undefined,
      totalArea: backendUser.total_area || undefined,
      rating: backendUser.rating || 0,
      reviewsCount: backendUser.reviews_count || 0,
    };
  };

  /**
   * Quick login with demo data (no backend call) — used for role selection.
   */
  const login = (chosenRole: UserRole, email?: string, name?: string) => {
    if (chosenRole === 'farmer') {
      setUser({
        ...DEMO_FARMER,
        email: email || DEMO_FARMER.email,
        name: name || DEMO_FARMER.name,
        role: 'farmer'
      });
    } else {
      setUser({
        ...DEMO_CUSTOMER,
        email: email || DEMO_CUSTOMER.email,
        name: name || DEMO_CUSTOMER.name,
        role: 'customer'
      });
    }
  };

  /**
   * Login with email/password via the backend API.
   * Enforces chosenRole so a farmer always accesses the farmer workspace.
   */
  const loginWithCredentials = async (
    email: string,
    password: string,
    chosenRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.login(email, password);
      if (res.error) {
        console.warn('Backend login error, using fallback:', res.error);
        const targetRole = chosenRole || (email.includes('customer') || email.includes('aarav') ? 'customer' : 'farmer');
        login(targetRole, email);
        return { success: true };
      }
      // Store JWT token and user profile
      const { access_token, user: backendUser } = res.data;
      setToken(access_token);
      setUser(toUserProfile(backendUser, chosenRole));
      return { success: true };
    } catch {
      console.warn('Backend unreachable, using demo login');
      const targetRole = chosenRole || (email.includes('customer') || email.includes('aarav') ? 'customer' : 'farmer');
      login(targetRole, email);
      return { success: true };
    }
  };

  const loginAsDemoFarmer = () => {
    setUser({ ...DEMO_FARMER, role: 'farmer' });
  };

  const loginAsDemoCustomer = () => {
    setUser({ ...DEMO_CUSTOMER, role: 'customer' });
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
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.register({
        name: data.name,
        email: data.email,
        password: data.password || 'farmwise123',
        role: data.role,
        phone: data.phone,
        location: data.location,
        avatar: data.avatar,
      });

      if (res.error) {
        console.warn('Backend register failed, using local fallback:', res.error);
        const newUser: UserProfile = {
          id: `user_${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone || '+91 98000 00000',
          location: data.location || 'Gujarat, India',
          avatar: data.avatar || (data.role === 'farmer' ? DEMO_FARMER.avatar : DEMO_CUSTOMER.avatar),
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
      setUser(toUserProfile({ ...backendUser, avatar: data.avatar || backendUser.avatar }, data.role));
      return { success: true };
    } catch {
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone || '+91 98000 00000',
        location: data.location || 'Gujarat, India',
        avatar: data.avatar || (data.role === 'farmer' ? DEMO_FARMER.avatar : DEMO_CUSTOMER.avatar),
        farmName: data.role === 'farmer' ? `${data.name}'s Green Field` : undefined,
        totalArea: data.role === 'farmer' ? '10 Acres' : undefined,
        rating: 5.0,
        reviewsCount: 1
      };
      setUser(newUser);
      return { success: true };
    }
  };

  const updateProfile = async (data: Partial<UserProfile> & { farmName?: string; totalArea?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.updateProfile({
        name: data.name,
        phone: data.phone,
        location: data.location,
        farm_name: data.farmName,
        total_area: data.totalArea,
        avatar: data.avatar,
      });

      if (res.data?.user) {
        setUser(toUserProfile(res.data.user, role || undefined));
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend update profile failed:', err);
    }
    // Update local user state
    if (user) {
      setUser({ ...user, ...data });
    }
    return { success: true };
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
        updateProfile,
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
