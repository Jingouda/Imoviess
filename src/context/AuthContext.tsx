import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types/cinema';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  loginWithGoogle: (data: { name: string; email: string; avatar?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth
  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem('imovies_token');
        if (token) {
          // If token belongs to old demo user Alex Vance, purge it immediately
          if (token.includes('user_demo') || token.includes('alex@cinephile.com')) {
            localStorage.removeItem('imovies_token');
            setUser(null);
          } else {
            const res = await api.getMe();
            if (res.user && res.user.email !== 'alex@cinephile.com') {
              setUser(res.user);
            } else {
              localStorage.removeItem('imovies_token');
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('imovies_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('imovies_token', res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      const res = await api.register(data);
      localStorage.setItem('imovies_token', res.token);
      setUser(res.user);
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (data: { name: string; email: string; avatar?: string }) => {
      const res = await api.loginWithGoogle(data);
      localStorage.setItem('imovies_token', res.token);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('imovies_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
