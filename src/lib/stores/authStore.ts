import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { setCookie, getCookie, deleteCookie } from '@/utils/cookies';
import { disconnectSocket } from '@/lib/socket';
import { useStoreStore } from '@/lib/stores/storeStore';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        // ✅ Lưu token vào cookie
        setCookie('token', token, 7);

        // ✅ QUAN TRỌNG: Cũng lưu vào localStorage để Axios đọc được
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }

        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        disconnectSocket();
        useStoreStore.getState().clearStore();
        // ✅ Xóa cả cookie và localStorage
        deleteCookie('token');

        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }

        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),
      refreshUser: async () => {
        const freshUser = await authService.getMe();
        set({ user: freshUser, isAuthenticated: true });
      },

      // ✅ Initialize auth từ cookie
      initAuth: () => {
        const token = getCookie('token');

        if (token) {
          // Sync token vào localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }

          // Load user từ storage
          const storedUser =
            typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;

          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              if (parsed.state?.user) {
                set({
                  user: parsed.state.user,
                  token,
                  isAuthenticated: true,
                });
              }
            } catch (error) {
              console.error('Failed to parse stored user:', error);
              get().logout();
            }
          }
        } else {
          // Không có token -> logout
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
