import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { getCookie } from '@/utils/cookies';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // ✅ Đọc token từ cookie TRƯỚC, fallback sang localStorage
    let token = getCookie('token');
    
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      const token = getCookie('token') || localStorage.getItem('token');
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (token && !isLoginRequest) {
        // Token hết hạn -> xóa cả cookie và localStorage
        if (typeof document !== 'undefined') {
          document.cookie = 'token=; path=/; max-age=0';
        }
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;