import { create } from 'zustand';
import { Order } from '@/types';
import { storeService } from '../services/storeService';

interface OrderBadgeStore {
  orders: Order[];
  loading: boolean;

  fetchOrders: (storeId: string) => Promise<void>;

  pendingCount: number;

  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;

  latestOrder: Order | null;
  setLatestOrder: (order: Order) => void;
  clearLatestOrder: () => void;
}

export const useOrderBadgeStore = create<OrderBadgeStore>((set) => ({
  orders: [],
  loading: false,
  pendingCount: 0,

  // ✅ FIX: THÊM DÒNG NÀY
  latestOrder: null,

  fetchOrders: async (storeId) => {
    set({ loading: true });

    const orders = await storeService.getOrders(storeId);
    const sorted = orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    set({
      orders: sorted,
      pendingCount: sorted.filter((o) => o.status === 'pending').length,
      loading: false,
    });
  },

  setOrders: (orders) =>
    set({
      orders,
      pendingCount: orders.filter((o) => o.status === 'pending').length,
    }),

  addOrder: (order) =>
    set((state) => {
      const orders = [order, ...state.orders];
      return {
        orders,
        pendingCount: orders.filter((o) => o.status === 'pending').length,
      };
    }),

  updateOrder: (updated) =>
    set((state) => {
      const orders = state.orders.map((o) =>
        o._id === updated._id ? updated : o
      );
      return {
        orders,
        pendingCount: orders.filter((o) => o.status === 'pending').length,
      };
    }),

  setLatestOrder: (order) => set({ latestOrder: order }),
  clearLatestOrder: () => set({ latestOrder: null }),
}));
