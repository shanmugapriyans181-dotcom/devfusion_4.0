import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../services/auth.api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('hireai_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hireai_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('hireai_user', JSON.stringify(res.data));
          }
        } catch (e) {
          localStorage.removeItem('hireai_token');
          localStorage.removeItem('hireai_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload): Promise<User> => {
    const res = await authApi.login(payload);
    const { user: userData, accessToken } = res.data;
    setUser(userData);
    localStorage.setItem('hireai_token', accessToken);
    localStorage.setItem('hireai_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    await authApi.register(payload);
    // Registration successful, but do NOT automatically log in.
    // Flow requires user to explicitly log in.
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout backend network errors
    } finally {
      setUser(null);
      localStorage.removeItem('hireai_token');
      localStorage.removeItem('hireai_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
