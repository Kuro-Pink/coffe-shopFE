import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { Category, Product, Table, Order } from '@/types';

export const storeService = {
  // ===== CATEGORIES =====
  getCategories: async (storeId: string): Promise<Category[]> => {
    const response = await api.get(API_ENDPOINTS.STORES.CATEGORIES(storeId));
    return response.data.data;
  },

  createCategory: async (storeId: string, data: { name: string; order: number }): Promise<Category> => {
    const response = await api.post(API_ENDPOINTS.STORES.CATEGORIES(storeId), data);
    return response.data;
  },

  updateCategory: async (id: string, data: { name: string; order: number }): Promise<Category> => {
    const response = await api.put(API_ENDPOINTS.STORES.CATEGORY_DETAIL(id), data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.STORES.CATEGORY_DETAIL(id));
  },

  // ===== PRODUCTS =====
  getProducts: async (storeId: string): Promise<Product[]> => {
    const response = await api.get(API_ENDPOINTS.STORES.PRODUCTS(storeId));
    return response.data.data;
  },

  createProduct: async (storeId: string, data: FormData): Promise<Product> => {
    const response = await api.post(API_ENDPOINTS.STORES.PRODUCTS(storeId), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: string, data: FormData): Promise<Product> => {
    const response = await api.put(API_ENDPOINTS.STORES.PRODUCT_DETAIL(id), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.STORES.PRODUCT_DETAIL(id));
  },

  toggleProductAvailability: async (id: string): Promise<Product> => {
    const response = await api.patch(API_ENDPOINTS.STORES.PRODUCT_TOGGLE(id));
    return response.data;
  },

  // ===== TABLES =====
  getTables: async (storeId: string): Promise<Table[]> => {
    const response = await api.get(API_ENDPOINTS.STORES.TABLES(storeId));
    return response.data;
  },

  createTable: async (storeId: string, data: { tableNumber: string; area: string }): Promise<Table> => {
    const response = await api.post(API_ENDPOINTS.STORES.TABLES(storeId), data);
    return response.data;
  },

  updateTable: async (id: string, data: { tableNumber: string; area: string }): Promise<Table> => {
    const response = await api.put(API_ENDPOINTS.STORES.TABLE_DETAIL(id), data);
    return response.data;
  },

  deleteTable: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.STORES.TABLE_DETAIL(id));
  },

  // ===== ORDERS =====
  getOrders: async (storeId: string): Promise<Order[]> => {
    const response = await api.get(API_ENDPOINTS.STORES.ORDERS(storeId));
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(API_ENDPOINTS.STORES.ORDER_DETAIL(id));
    return response.data;
  },

  updateOrderStatus: async (id: string, status: 'completed' | 'cancelled'): Promise<Order> => {
    const response = await api.patch(API_ENDPOINTS.STORES.ORDER_STATUS(id), { status });
    return response.data;
  },

  // ===== STATS =====
  getStats: async (storeId: string, params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get(API_ENDPOINTS.STORES.STATS(storeId), { params });
    return response.data;
  },
};