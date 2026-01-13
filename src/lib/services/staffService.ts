import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { Staff, StaffStats, StaffPerformance, StaffType, Order, Table } from '@/types';

export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  phone: string;
  staffType: StaffType;
}

export interface UpdateStaffData {
  name?: string;
  phone?: string;
  password?: string;
  staffType?: StaffType;
  isActive?: boolean;
}

export const staffService = {
  // Get all staff
  getStaff: async (storeId: string): Promise<Staff[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.STAFF.LIST(storeId));
    return response.data.data;
  },
  // Get staff by ID
  getStaffById: async (id: string): Promise<Staff> => {
    const response = await api.get(API_ENDPOINTS.HOST.STAFF.DETAIL(id));
    return response.data.data;
  },
  // Create staff
  createStaff: async (storeId: string, data: CreateStaffData): Promise<Staff> => {
    const response = await api.post(API_ENDPOINTS.HOST.STAFF.CREATE(storeId), data);
    return response.data.data;
  },
  // Update staff
  updateStaff: async (id: string, data: UpdateStaffData): Promise<Staff> => {
    const response = await api.put(API_ENDPOINTS.HOST.STAFF.UPDATE(id), data);
    return response.data.data;
  },
  // Delete staff
  deleteStaff: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.HOST.STAFF.DELETE(id));
  },
  // Toggle staff status
  toggleStatus: async (id: string): Promise<Staff> => {
    const response = await api.patch(API_ENDPOINTS.HOST.STAFF.TOGGLE_STATUS(id));
    return response.data.data;
  },
  // Get staff stats
  getStats: async (storeId: string): Promise<StaffStats> => {
    const response = await api.get(API_ENDPOINTS.HOST.STAFF.STATS(storeId));
    return response.data.data;
  },
  // Get staff performance
  getPerformance: async (
    storeId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<StaffPerformance[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.STAFF.PERFORMANCE(storeId), { params });
    return response.data.data;
  },
};
// ✅ Staff-side service (for staff role)
export const staffOrderService = {
  getTables: async (storeId: string): Promise<Table[]> => {
    const response = await api.get(API_ENDPOINTS.STAFF.TABLES.LIST(storeId));
    return response.data.data;
  },
  updateTableStatus: async (
    id: string,
    status: 'available' | 'occupied' | 'needs_cleaning',
  ): Promise<Table> => {
    const response = await api.patch(API_ENDPOINTS.STAFF.TABLES.STATUS(id), { status });
    return response.data;
  },
  // Get orders (staff only sees their store)
  getOrders: async (storeId: string): Promise<Order[]> => {
    const response = await api.get(API_ENDPOINTS.STAFF.ORDERS.LIST(storeId));
    return response.data.data;
  },
  // Get order detail
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(API_ENDPOINTS.STAFF.ORDERS.DETAIL(id));
    return response.data.data;
  },
  // Update order status (auto-track staff)
  updateOrderStatus: async (
    id: string,
    status: Extract<Order['status'], 'completed' | 'cancelled'>,
  ): Promise<Order> => {
    console.log('Updated order status response:', id);
    const response = await api.patch(API_ENDPOINTS.STAFF.ORDERS.STATUS(id), { status });
    return response.data.data;
  },
};
