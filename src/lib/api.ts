import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';

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
    const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      // Nếu có token (đã login) và không phải login request
      if (token && !isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // ✅ Emit event thay vì window.location
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;