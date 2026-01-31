import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';

export const adminHostService = {
  getHosts: async () => {
    const res = await api.get(API_ENDPOINTS.ADMIN.HOSTS);
    return res.data.data;
  },

  lockHost: async (id: string) => {
    const res = await api.patch(`${API_ENDPOINTS.ADMIN.HOSTS}/${id}/lock`);
    return res.data.data;
  },

  unlockHost: async (id: string) => {
    const res = await api.patch(`${API_ENDPOINTS.ADMIN.HOSTS}/${id}/unlock`);
    return res.data.data;
  },

  getHostDetail: async (id: string) => {
    const res = await api.get(`${API_ENDPOINTS.ADMIN.HOSTS}/${id}`);
    return res.data.data;
  },
};
