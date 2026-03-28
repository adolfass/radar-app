import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://vizitka.zazvezdu.online/api';

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
  token: localStorage.getItem('vizitka_token'),
  loading: false,
  error: null,
  initAuth: async (initData: string) => {
    console.log('[Auth] initAuth called with initData length:', initData?.length);
    console.log('[Auth] initData preview:', initData?.substring(0, 50) + '...');
    
    // Если уже есть пользователь, не делаем запрос
    if (get().user) {
      console.log('[Auth] User already logged in');
      return;
    }
    
    // Если initData пустой
    if (!initData || initData.trim() === '') {
      console.error('[Auth] Empty initData');
      set({ 
        error: 'Нет данных от Telegram. Перезапустите бота.', 
        loading: false 
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('[Auth] Sending auth request...');
      const response = await axios.post(`${API_URL}/auth/validate`, { 
        initData: initData.trim() 
      });
      
      console.log('[Auth] Response:', response.status, response.data);
      const { user, token } = response.data;
      
      localStorage.setItem('vizitka_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ user, token, loading: false });
      console.log('[Auth] Success! User:', user.firstName);
    } catch (error: any) {
      console.error('[Auth] Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Ошибка авторизации';
      set({ error: errorMsg, loading: false });
    }
  },
  logout: () => {
    localStorage.removeItem('vizitka_token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null, error: null });
  },
  clearError: () => {
    set({ error: null });
  },
}));

// Set initial token if exists
const token = localStorage.getItem('vizitka_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('[Auth] Restored token from localStorage');
}
