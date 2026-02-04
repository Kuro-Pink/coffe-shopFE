import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  Voucher,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  ApplyVoucherPayload,
  ApiResponse,
} from '@/types';
export const voucherService = {
  // LIST
  getVouchers: async (storeId: string): Promise<Voucher[]> => {
    const res = await api.get(API_ENDPOINTS.HOST.VOUCHERS.LIST(storeId));
    return res.data.data;
  },

  // CREATE
  createVoucher: async (storeId: string, payload: CreateVoucherPayload): Promise<Voucher> => {
    const res = await api.post(API_ENDPOINTS.HOST.VOUCHERS.CREATE(storeId), payload);
    return res.data.data;
  },

  // UPDATE
  updateVoucher: async (id: string, payload: UpdateVoucherPayload): Promise<Voucher> => {
    const res = await api.put(API_ENDPOINTS.HOST.VOUCHERS.DETAIL(id), payload);
    return res.data.data;
  },

  // DELETE
  deleteVoucher: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(API_ENDPOINTS.HOST.VOUCHERS.DETAIL(id));
    return res.data;
  },

  // TOGGLE ACTIVE
  toggleVoucher: async (id: string): Promise<Voucher> => {
    const res = await api.patch(API_ENDPOINTS.HOST.VOUCHERS.TOGGLE(id));
    return res.data.data;
  },

  // DETAIL
  getVoucherDetail: async (id: string): Promise<Voucher> => {
    const res = await api.get(API_ENDPOINTS.HOST.VOUCHERS.DETAIL(id));
    return res.data.data;
  },

  // APPLY
  setVoucherProducts: async (id: string, payload: { productIds: string[] }): Promise<Voucher> => {
    const res = await api.put(API_ENDPOINTS.HOST.VOUCHERS.PRODUCTS(id), payload);
    return res.data.data;
  },
};
