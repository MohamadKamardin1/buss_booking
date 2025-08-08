import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'types';
import { apiService } from '../services/api'; // Adjust path to your apiService

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role: 'conductor' | 'passenger') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount, check localStorage for user info saved by apiService.login()
    const storedUsername = localStorage.getItem('username');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedUsername && storedUserRole) {
      // Construct minimal User object to keep context consistent with your User type
      setUser({
        username: storedUsername,
        role: storedUserRole,
        // add other User fields here if you have them stored or fetch user profile from API later
      } as User);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(username, password);
      if (response.success && response.data) {
        // Set user with returned info
        setUser({
          username: response.data.username,
          role: response.data.role,
          // add other User fields if available
        } as User);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    password: string,
    role: 'conductor' | 'passenger'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.register(username, password, role);
      if (response.success) {
        // Optionally auto-login the user after registration,
        // or require user to login manually
        // Here, just return true on success
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
