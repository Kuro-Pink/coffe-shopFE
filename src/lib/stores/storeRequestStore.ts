'use client';

import { create } from 'zustand';
import { adminService } from '@/lib/services/adminService';
import type { StoreRequest } from '@/types';

interface StoreRequestStore {
  requests: StoreRequest[];
  pendingCount: number;
  loading: boolean;
  fetchRequests: () => Promise<void>;
}

export const useStoreRequestStore = create<StoreRequestStore>((set) => ({
  requests: [],
  pendingCount: 0,
  loading: false,

  fetchRequests: async () => {
    set({ loading: true });
    try {
      const requests: StoreRequest[] =
        await adminService.getStoreRequests();

      const pending = requests.filter(
        (r) => r.status === 'pending'
      ).length;

      set({
        requests,
        pendingCount: pending,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },
}));
