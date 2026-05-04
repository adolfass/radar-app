import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isOrganizer: boolean;
  balance: number;
  photoUrl?: string;
}

interface Subscription {
  plan: 'free' | 'premium';
  isActive: boolean;
  expiresAt: string | null;
  trialEnd: string | null;
}

interface AuthState {
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null,
  subscription: null,
  initAuth: async (initData: string) => {
    if (!initData || initData.trim() === '') {
      set({ error: 'Нет данных от Telegram. Перезапустите бота.', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/validate', { initData: initData.trim() });
      const { user, token } = response.data;

      localStorage.setItem('auth_token', token);

      set({ user, token, loading: false });

      await get().loadSubscription();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Ошибка авторизации';
      set({ error: errorMsg, loading: false, user: null, token: null });
      localStorage.removeItem('auth_token');
    }
  },
  validateToken: async () => {
    const token = get().token;
    if (!token) {
      return false;
    }

    set({ loading: true });
    try {
      const response = await api.post('/auth/verify', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { user } = response.data;
      set({ user, loading: false });
      return true;
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, loading: false });
      return false;
    }
  },
  loadSubscription: async () => {
    try {
      const res = await api.get('/subscription');
      set({ subscription: res.data });
    } catch {
      set({ subscription: { plan: 'free', isActive: true, expiresAt: null, trialEnd: null } });
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, error: null, subscription: null });
  },
  clearError: () => {
    set({ error: null });
  },
}));
