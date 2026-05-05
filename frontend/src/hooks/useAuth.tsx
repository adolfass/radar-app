import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface User {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  isOrganizer: boolean;
  balance: number;
  photoUrl: string | null;
}

interface Subscription {
  plan: 'free' | 'premium';
  isActive: boolean;
  expiresAt: string | null;
  trialEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  subscription: Subscription | null;
  initAuth: (initData: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadSubscription: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, loading, error, subscription, initAuth, logout, clearError, loadSubscription, validateToken } = useAuthStore();

  return (
    <AuthContext.Provider value={{ user, token, loading, error, subscription, initAuth, logout, clearError, loadSubscription, validateToken }}>
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
