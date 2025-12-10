import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { Category, Product, Table } from '@/types';

export interface CreateOrderData {
  storeId: string;
  tableId: string;
  customerPhone: string;
  customerNote?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const publicService = {
  // Get menu (categories + products)
  getMenu: async (storeId: string): Promise<{ categories: Category[]; products: Product[] }> => {
    const response = await api.get(API_ENDPOINTS.PUBLIC.MENU(storeId));
    return response.data;
  },

  // Get table info
  getTableInfo: async (tableId: string): Promise<Table> => {
    const response = await api.get(API_ENDPOINTS.PUBLIC.TABLE_INFO(tableId));
    return response.data;
  },

  // Create order
  createOrder: async (data: CreateOrderData) => {
    const response = await api.post(API_ENDPOINTS.PUBLIC.CREATE_ORDER, data);
    return response.data;
  },
};