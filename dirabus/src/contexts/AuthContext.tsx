import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, password: string, role: 'conductor' | 'passenger') => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user and tokens from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUsername = localStorage.getItem('username');
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId'); // Store user id if you add it

    if (storedToken && storedRefreshToken && storedUsername && storedUserRole) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser({
        id: storedUserId ? Number(storedUserId) : undefined,
        username: storedUsername,
        role: storedUserRole,
      } as User);
    }
    setIsLoading(false);
  }, []);

  // Provide a function to refresh access token using refresh token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await apiService.refreshToken(refreshToken);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.access);
        setToken(response.data.access);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      console.error('Failed to refresh token', err);
      logout();
      return false;
    }
  }, [refreshToken]);

  // Adjust login method to return detailed status and store userId if available
  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(username, password);
      if (response.success && response.data) {
        const { access, refresh, role, username: returnedUsername, user_id } = response.data as any; // Replace with your response shape if different

        // Store tokens and user info, including user id if available
        localStorage.setItem('token', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('username', returnedUsername);
        localStorage.setItem('userRole', role);
        if (user_id) localStorage.setItem('userId', String(user_id));

        setUser({
          id: user_id ? Number(user_id) : undefined,
          username: returnedUsername,
          role,
        } as User);
        setToken(access);
        setRefreshToken(refresh);

        return { success: true };
      } else {
        const message = response.message || 'Login failed';
        setError(message);
        return { success: false, message };
      }
    } catch (err: any) {
      const message = err?.message || 'Network error';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, password: string, role: 'conductor' | 'passenger'): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.register(username, password, role);
      if (response.success) {
        return { success: true };
      } else {
        const message = response.message || 'Registration failed';
        setError(message);
        return { success: false, message };
      }
    } catch (err: any) {
      const message = err?.message || 'Network error';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setError(null);
  }, []);

  // Memoize context value to avoid unnecessary renders
  const contextValue = useMemo(
    () => ({
      user,
      token,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshAccessToken,
    }),
    [user, token, isLoading, error, login, register, logout, refreshAccessToken]
  );

  // Optionally, add a timer here or an effect to refresh token before expiry if desired, e.g. with setTimeout.

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
