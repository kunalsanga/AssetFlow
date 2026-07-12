import { createContext, FC, ReactNode, useState, useEffect, useContext } from 'react';
import { User } from '../types';
import * as authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const mockAdminUser: User = {
    id: 1,
    email: 'admin@assetflow.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true
  };

  const [user, setUser] = useState<User | null>(mockAdminUser);
  const [loading] = useState(false);

  useEffect(() => {
    // Authentication temporarily bypassed for development
    // const initAuth = async () => { ... }
    // initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const logout = () => {
    authService.logout();
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
