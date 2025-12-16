import { create } from 'zustand';
import { Order } from '@/types';

interface OrderNotifyStore {
  open: boolean;
  order: Order | null;
  show: (order: Order) => void;
  close: () => void;
}

export const useOrderNotifyStore = create<OrderNotifyStore>((set) => ({
  open: false,
  order: null,
  show: (order) => set({ open: true, order }),
  close: () => set({ open: false, order: null }),
}));
