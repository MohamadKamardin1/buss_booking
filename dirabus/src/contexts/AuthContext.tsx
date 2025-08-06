import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
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
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Try to connect to the real API first
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.data.user);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('token', data.data.token);
            return true;
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock authentication');
      }

      // Fallback to mock authentication for development
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+255123456789',
          role: 'user' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'conductor-1',
          email: 'conductor@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+255987654321',
          role: 'conductor' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'admin-1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+255555555555',
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      // Simple mock authentication - check if user exists
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser && password.length > 0) {
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token-' + Date.now());
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

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Try to connect to the real API first
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.data.user);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('token', data.data.token);
            return true;
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock registration');
      }

      // Fallback to mock registration for development
      const mockUser: User = {
        id: 'mock-user-' + Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'user',
        createdAt: new Date().toISOString(),
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token-' + Date.now());
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};