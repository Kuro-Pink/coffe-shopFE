import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

// Helper functions để làm việc với cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const maxAge = days * 24 * 60 * 60; // Convert to seconds
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
  
  return value || null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

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
        // ✅ Lưu token vào cookie (để middleware có thể đọc)
        setCookie('token', token, 7);
        
        // Lưu vào zustand state
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        // ✅ Xóa cookie
        deleteCookie('token');
        
        // Xóa localStorage
        localStorage.removeItem('token');
        
        // Reset state
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (user) => set({ user }),
      
      // ✅ Initialize auth từ cookie khi app load
      initAuth: () => {
        const token = getCookie('token');
        const storedUser = localStorage.getItem('auth-storage');
        
        if (token && storedUser) {
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
        } else if (!token) {
          // Không có token -> logout
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
      // Chỉ persist user info, không persist token (vì token ở cookie)
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);