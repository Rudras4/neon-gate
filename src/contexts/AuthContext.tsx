import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
  message: string;
}

interface ProfileResponse {
  user: {
    id: number;
    email: string;
    name: string;
    createdAt: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  getProfile: () => Promise<any>;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        try {
          // Validate token with backend
          const data = await authAPI.getProfile() as ProfileResponse;
          setUser({
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.name
          });
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await authAPI.login(email, password) as AuthResponse;

      const user: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.name
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await authAPI.register(name, email, password) as AuthResponse;

      const user: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.name
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
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

  const getProfile = async () => {
    try {
      const data = await authAPI.getProfile() as ProfileResponse;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    getProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
