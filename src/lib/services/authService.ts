import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { User } from '@/types';
import { ApiResponse } from '@/types';
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

  // Register
  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      ...data,
      role: 'host',
    });
    return response.data;
  },

  // ✅ Get current user
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // ✅ Update profile (multipart)
  updateMe: async (data: FormData): Promise<User> => {
    const response = await api.patch(API_ENDPOINTS.AUTH.ME, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // backend trả ApiResponse.success(user)
    return response.data.data;
  },

  // ✅ Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    const response = await api.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  },

  logout: () => {
    useAuthStore.getState().logout();
  },
};
