import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
  initAuth: (initData: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, loading, error, initAuth, logout, clearError } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, token, loading, error, initAuth, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
