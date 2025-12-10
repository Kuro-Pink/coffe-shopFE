import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { User } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'host';
  phone: string;
  storeId?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    token: string;
    user: User;
  };
}


export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // Register (Admin tạo Host)
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  // Get current user
  me: async (): Promise<User> => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    useAuthStore.getState().logout();
  },
};