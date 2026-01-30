import { create } from 'zustand';
import { Store } from '@/types';
import { storeService } from '@/lib/services/storeService';

interface StoreState {
  store: Store | null;
  setStore: (store: Store | null) => void;
  clearStore: () => void;
  refreshStore: (storeId: string) => Promise<void>;
}

export const useStoreStore = create<StoreState>((set) => ({
  store: null,

  setStore: (store) => set({ store }),

  clearStore: () => set({ store: null }),

  refreshStore: async (storeId: string) => {
    const fresh = await storeService.getStoreInfo(storeId);
    set({ store: fresh });
  },
}));
