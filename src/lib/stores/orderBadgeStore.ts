import { create } from 'zustand';

interface OrderBadgeState {
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

export const useOrderBadgeStore = create<OrderBadgeState>((set) => ({
  pendingCount: 0,
  setPendingCount: (count) => set({ pendingCount: count }),
}));
