// Create: src/lib/services/shiftService.ts

import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { Shift, ShiftReport, UnpaidBill, StaffShiftStats, HostShiftStats } from '@/types';
import type { AxiosError } from 'axios';

export interface CheckInData {
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export interface CheckOutData {
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export const shiftService = {
  // ===== SHIFT MANAGEMENT (STAFF) =====

  // Get current active shift (Staff)
  getCurrentShift: async (): Promise<Shift | null> => {
    try {
      const response = await api.get(API_ENDPOINTS.STAFF.MY_SHIFT.CURRENT);
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;

      if (axiosError.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  // Check-in (Start shift) - Staff
  checkIn: async (data: CheckInData): Promise<Shift> => {
    const response = await api.post(API_ENDPOINTS.STAFF.MY_SHIFT.CHECK_IN, data);
    return response.data.data;
  },

  // Check-out (End shift) - Staff
  checkOut: async (data: CheckOutData): Promise<Shift> => {
    const response = await api.post(API_ENDPOINTS.STAFF.MY_SHIFT.CHECK_OUT, data);
    return response.data.data;
  },

  // Get shift history (Staff)
  getShiftHistory: async (params?: { startDate?: string; endDate?: string }): Promise<Shift[]> => {
    const response = await api.get(API_ENDPOINTS.STAFF.MY_SHIFT.HISTORY, { params });
    return response.data.data;
  },

  // Get shift stats (Staff)
  getShiftStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<StaffShiftStats> => {
    const response = await api.get(API_ENDPOINTS.STAFF.MY_SHIFT.STATS, { params });
    return response.data.data;
  },

  // ===== HOST SHIFT MANAGEMENT =====

  // Get all shifts (Host only)
  getAllShifts: async (
    storeId: string,
    params?: { startDate?: string; endDate?: string; staffId?: string },
  ): Promise<Shift[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.SHIFTS.ALL(storeId), { params });
    return response.data.data;
  },

  // Get active shifts (Host only)
  getActiveShifts: async (storeId: string): Promise<Shift[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.SHIFTS.ACTIVE(storeId));
    return response.data.data;
  },

  // Get shift stats (Host only)
  getShiftStatsForHost: async (
    storeId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<HostShiftStats> => {
    const response = await api.get(API_ENDPOINTS.HOST.SHIFTS.STATS(storeId), { params });
    return response.data.data;
  },

  // Get shift report (Host only)
  getShiftReport: async (shiftId: string): Promise<ShiftReport> => {
    const response = await api.get(API_ENDPOINTS.HOST.SHIFTS.REPORT(shiftId));
    return response.data.data;
  },

  // Get staff shift history (Host only)
  getStaffShiftHistory: async (
    staffId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<Shift[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.SHIFTS.STAFF_HISTORY(staffId), { params });
    return response.data.data;
  },
};
