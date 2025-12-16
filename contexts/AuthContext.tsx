
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

// Helper to decode JWT. In a real app, use a library like jwt-decode.
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  handleAuthSuccess: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decodedUser = parseJwt(storedToken);
      if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
        setUser({
          id: decodedUser.id,
          name: decodedUser.name,
          email: decodedUser.email,
          role: decodedUser.role,
        });
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        // Token expired or invalid
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decodedUser = parseJwt(newToken);
    setUser({
      id: decodedUser.id,
      name: decodedUser.name,
      email: decodedUser.email,
      role: decodedUser.role,
    });
    setToken(newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    handleAuthSuccess(response.token);
  };
  
  const signup = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    handleAuthSuccess(response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    handleAuthSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
