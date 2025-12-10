import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { setCookie, getCookie, deleteCookie } from '@/utils/cookies';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
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
        // ✅ Xóa cả cookie và localStorage
        deleteCookie('token');
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (user) => set({ user }),
      
      // ✅ Initialize auth từ cookie
      initAuth: () => {
        const token = getCookie('token');
        
        if (token) {
          // Sync token vào localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
          
          // Load user từ storage
          const storedUser = typeof window !== 'undefined' 
            ? localStorage.getItem('auth-storage') 
            : null;
          
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              if (parsed.state?.user) {
                set({ 
                  user: parsed.state.user, 
                  token, 
                  isAuthenticated: true 
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
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);