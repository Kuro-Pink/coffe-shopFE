import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { Category, Product, Table, Order } from '@/types';
export interface DashboardStats {
  today: {
    orders: number;
    revenue: number;
    growth: number;
  };
  yesterday: {
    orders: number;
    revenue: number;
  };
  thisMonth: {
    orders: number;
    revenue: number;
    growth: number;
  };
  lastMonth: {
    revenue: number;
  };
  pendingOrders: number;
}

export interface OrdersTodayStats {
  totalOrders: number;
  ordersByStatus: {
    pending: number;
    completed: number;
    cancelled: number;
  };
  totalRevenue: number;
  topProducts: Array<{
    _id: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
}

export interface PeakHour {
  hour: number;
  hourLabel: string;
  orders: number;
  revenue: number;
}

export interface BestSeller {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  ordersCount: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  averageOrderValue: number;
  topCustomers: Array<{
    _id: string; // phone number
    orderCount: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
  }>;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalRevenue: number;
  ordersCount: number;
  [key: string]: string | number;
}

export interface TablePerformance {
  _id: string;
  tableName: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

export const storeService = {
  // ===== CATEGORIES =====
  getCategories: async (storeId: string): Promise<Category[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.CATEGORIES(storeId));
    return response.data.data;
  },

  createCategory: async (storeId: string, data: { name: string; order: number }): Promise<Category> => {
    const response = await api.post(API_ENDPOINTS.HOST.CATEGORIES(storeId), data);
    return response.data;
  },

  updateCategory: async (id: string, data: { name: string; order: number }): Promise<Category> => {
    const response = await api.put(API_ENDPOINTS.HOST.CATEGORY_DETAIL(id), data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.HOST.CATEGORY_DETAIL(id));
  },

  // ===== PRODUCTS =====
  getProducts: async (storeId: string): Promise<Product[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.PRODUCTS(storeId));
    return response.data.data;
  },

  createProduct: async (storeId: string, data: FormData): Promise<Product> => {
    const response = await api.post(API_ENDPOINTS.HOST.PRODUCTS(storeId), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: string, data: FormData): Promise<Product> => {
    const response = await api.put(API_ENDPOINTS.HOST.PRODUCT_DETAIL(id), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.HOST.PRODUCT_DETAIL(id));
  },

  toggleProductAvailability: async (id: string): Promise<Product> => {
    const response = await api.patch(API_ENDPOINTS.HOST.PRODUCT_TOGGLE(id));
    return response.data;
  },

  // ===== TABLES =====
  getTables: async (storeId: string): Promise<Table[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.TABLES(storeId));
    return response.data.data;
  },

  createTable: async (storeId: string, data: { tableNumber: string; area: string }): Promise<Table> => {
    const response = await api.post(API_ENDPOINTS.HOST.TABLES(storeId), data);
    return response.data;
  },

  updateTable: async (id: string, data: { tableNumber: string; area: string }): Promise<Table> => {
    const response = await api.put(API_ENDPOINTS.HOST.TABLE_DETAIL(id), data);
    return response.data;
  },

  deleteTable: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.HOST.TABLE_DETAIL(id));
  },

  // ===== ORDERS =====
  getOrders: async (storeId: string): Promise<Order[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.ORDERS(storeId));
    return response.data.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(API_ENDPOINTS.HOST.ORDER_DETAIL(id));
    return response.data;
  },

  updateOrderStatus: async (id: string, status: 'completed' | 'cancelled'): Promise<Order> => {
    const response = await api.patch(API_ENDPOINTS.HOST.ORDER_STATUS(id), { status });
    return response.data;
  },

  // ✅ Analytics Methods
  getDashboardStats: async (storeId: string): Promise<DashboardStats> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.DASHBOARD(storeId));
    return response.data.data; // Backend trả về { success, message, data, statusCode }
  },

  getOrdersToday: async (storeId: string, params?: { startDate?: string; endDate?: string }): Promise<OrdersTodayStats> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.ORDERS_TODAY(storeId), { params });
    return response.data.data;
  },

  getRevenueTrends: async (storeId: string): Promise<RevenueTrend[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.REVENUE_TRENDS(storeId));
    return response.data.data;
  },

  getPeakHours: async (storeId: string): Promise<PeakHour[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.PEAK_HOURS(storeId));
    return response.data.data;
  },

  getBestSellers: async (storeId: string): Promise<BestSeller[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.BEST_SELLERS(storeId));
    return response.data.data;
  },

  getCustomerInsights: async (storeId: string): Promise<CustomerInsights> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.CUSTOMERS(storeId));
    return response.data.data;
  },

  getCategoryPerformance: async (storeId: string): Promise<CategoryPerformance[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.CATEGORIES(storeId));
    return response.data.data;
  },

  getTablePerformance: async (storeId: string): Promise<TablePerformance[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.ANALYTICS.TABLES(storeId));
    return response.data.data;
  },
};