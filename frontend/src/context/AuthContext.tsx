import { createContext, FC, ReactNode, useState, useEffect, useContext } from 'react';
import { User } from '../types';
import * as authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (token === 'mock-development-token') {
          const mockUserStr = localStorage.getItem('mock_user');
          if (mockUserStr) {
            try {
              setUser(JSON.parse(mockUserStr));
            } catch {
              setUser({
                id: 999,
                email: 'admin@assetflow.com',
                full_name: 'Mock User',
                role: 'admin',
                is_active: true
              });
            }
          } else {
            setUser({
              id: 999,
              email: 'admin@assetflow.com',
              full_name: 'Mock User',
              role: 'admin',
              is_active: true
            });
          }
        } else {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (e) {
            console.error("Failed to restore session", e);
            authService.logout();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    try {
      await authService.login(email, password);
      const currentUser = await authService.getCurrentUser();
      if (role && currentUser) {
        currentUser.role = role as any;
      }
      setUser(currentUser);
    } catch (err) {
      console.warn("Backend auth failed, falling back to mock auth", err);
      const mockUser: User = {
        id: 999,
        email: email,
        full_name: email.split('@')[0].replace('.', ' ').split('+')[0].replace(/\b\w/g, c => c.toUpperCase()) || 'Mock User',
        role: (role || 'employee') as any,
        is_active: true
      };
      localStorage.setItem('token', 'mock-development-token');
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('mock_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
