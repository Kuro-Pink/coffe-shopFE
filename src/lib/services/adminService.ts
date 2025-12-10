import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { Store } from '@/types';

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
  // Get all stores
  getStores: async (): Promise<Store[]> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.STORES);
    return response.data;
  },

  // Get store by ID
  getStore: async (id: string): Promise<Store> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.STORE_DETAIL(id));
    return response.data;
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
};