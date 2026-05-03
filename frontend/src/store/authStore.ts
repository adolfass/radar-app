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
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initAuth: (initData: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null,
  initAuth: async (initData: string) => {
    if (get().user) return;
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
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Ошибка авторизации';
      set({ error: errorMsg, loading: false });
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, error: null });
  },
  clearError: () => {
    set({ error: null });
  },
}));
