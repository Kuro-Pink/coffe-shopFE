import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { Store, StoreRequest } from '@/types';

export interface CreateStoreData {
  name: string;
  address: string;
  phone: string;
  logo?: string;
  ownerId: string;
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
  isActive?: boolean;
}

export const adminService = {
  // Get all stores data to dashboard
  getDashboardStats: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
    return response.data.data;
  },
  getRevenueChart: async (days: number) => {
    const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD_REVENUE(days));
    return response.data.data;
  },
  getRecentActivities: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD_ACTIVITIES);
    return response.data.data;
  },
  // Get all stores
  getStores: async (): Promise<Store[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.STORES);
    return response.data.data;
  },

  // Get store by ID
  getStore: async (id: string): Promise<Store> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.STORE_DETAIL(id));
    return response.data.data;
  },

  // Create store
  createStore: async (data: CreateStoreData): Promise<Store> => {
    const response = await api.post(API_ENDPOINTS.ADMIN.STORES, data);
    return response.data;
  },

  // Update store
  updateStore: async (id: string, data: UpdateStoreData): Promise<Store> => {
    const response = await api.put(API_ENDPOINTS.ADMIN.STORE_DETAIL(id), data);
    return response.data;
  },

  // Delete store
  deleteStore: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN.STORE_DETAIL(id));
  },

  // Get stats
  getStats: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN.STATS);
    return response.data;
  },

  // Store Requests Management
  getStoreRequests: async (): Promise<StoreRequest[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.STORE_REQUESTS.LIST);
    return response.data.data;
  },

  approveStoreRequest: async (requestId: string): Promise<void> => {
    const response = await api.post(API_ENDPOINTS.ADMIN.STORE_REQUESTS.APPROVE(requestId));
    return response.data;
  },

  rejectStoreRequest: async (requestId: string, reason: string): Promise<void> => {
    const response = await api.post(API_ENDPOINTS.ADMIN.STORE_REQUESTS.REJECT(requestId), {
      rejectionReason: reason,
    });
    return response.data;
  },

  deleteStoreRequest: async (requestId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.ADMIN.STORE_REQUESTS.DETAIL(requestId));
  },
};
