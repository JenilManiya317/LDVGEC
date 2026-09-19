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
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
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
      isEmailVerified: backendUser.is_email_verified ?? backendUser.isEmailVerified ?? false,
    };
  };


  /**
   * Quick login with demo data — automatically authenticates with backend API to obtain JWT token for MongoDB Atlas.
   */
  const login = async (chosenRole: UserRole, email?: string, name?: string) => {
    const demoEmail = email || (chosenRole === 'farmer' ? DEMO_FARMER.email : DEMO_CUSTOMER.email);
    const demoName = name || (chosenRole === 'farmer' ? DEMO_FARMER.name : DEMO_CUSTOMER.name);
    const demoPassword = 'demo1234';

    // Set local fallback state first so UI updates immediately
    if (chosenRole === 'farmer') {
      setUser({ ...DEMO_FARMER, email: demoEmail, name: demoName, role: 'farmer' });
    } else {
      setUser({ ...DEMO_CUSTOMER, email: demoEmail, name: demoName, role: 'customer' });
    }

    // Authenticate with backend API to obtain a real JWT token for MongoDB isolation
    try {
      let res = await api.auth.login(demoEmail, demoPassword);
      if (res.error) {
        // Attempt auto-registration for demo account on backend
        const regRes = await api.auth.register({
          name: demoName,
          email: demoEmail,
          password: demoPassword,
          role: chosenRole,
          phone: chosenRole === 'farmer' ? DEMO_FARMER.phone : DEMO_CUSTOMER.phone,
          location: chosenRole === 'farmer' ? DEMO_FARMER.location : DEMO_CUSTOMER.location,
        });
        if (regRes.data?.access_token) {
          setToken(regRes.data.access_token);
          if (regRes.data.user) {
            setUser(toUserProfile(regRes.data.user, chosenRole));
          }
        }
      } else if (res.data?.access_token) {
        setToken(res.data.access_token);
        if (res.data.user) {
          setUser(toUserProfile(res.data.user, chosenRole));
        }
      }
    } catch (err) {
      console.warn('Demo backend authentication fallback:', err);
    }
  };

  /**
   * Login with email/password via the backend API.
   * Enforces strict MongoDB authentication and JWT token storage.
   */
  const loginWithCredentials = async (
    email: string,
    password: string,
    chosenRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.login(email, password);
      if (res.error) {
        return { success: false, error: res.error };
      }
      if (!res.data?.access_token) {
        return { success: false, error: 'No authentication token received from server.' };
      }
      // Store JWT token and user profile in localStorage and React state
      const { access_token, user: backendUser } = res.data;
      setToken(access_token);
      setUser(toUserProfile(backendUser, chosenRole));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to authentication server.' };
    }
  };

  const loginAsDemoFarmer = () => {
    login('farmer');
  };

  const loginAsDemoCustomer = () => {
    login('customer');
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

  const sendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.sendOtp(email);
      if (res.error) {
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP.' };
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.verifyOtp(email, otp);
      if (res.error) {
        return { success: false, error: res.error };
      }
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        setUser({ ...user, isEmailVerified: true });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed.' };
    }
  };

  const resendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.resendOtp(email);
      if (res.error) {
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend OTP.' };
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
        updateProfile,
        sendOtp,
        verifyOtp,
        resendOtp,
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
