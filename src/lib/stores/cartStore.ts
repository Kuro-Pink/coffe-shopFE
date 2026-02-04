import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  storeId: string;
  name: string;

  // SNAPSHOT PRICE (LOCK)
  price: number;
  originalPrice: number;
  finalPrice: number;

  quantity: number;
  image?: string;

  discountAmount?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
}

// ✅ NEW: Structure to store carts by tableId
interface TableCart {
  tableId: string;
  storeId: string;
  items: CartItem[];
  updatedAt: string;
}

interface CartState {
  // ✅ CHANGED: Store multiple carts indexed by tableId
  carts: Record<string, TableCart>;
  currentTableId: string | null;
  currentStoreId: string | null;

  // Cart operations
  setTable: (tableId: string, storeId: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearTableCart: (tableId: string) => void; // ✅ NEW: Clear specific table
  getTotalItems: () => number;
  getCurrentItems: () => CartItem[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      currentTableId: null,
      currentStoreId: null,

      // ✅ Set current table
      setTable: (tableId, storeId) => {
        set({ currentTableId: tableId, currentStoreId: storeId });

        // Initialize cart for this table if not exists
        const carts = get().carts;
        if (!carts[tableId]) {
          set({
            carts: {
              ...carts,
              [tableId]: {
                tableId,
                storeId,
                items: [],
                updatedAt: new Date().toISOString(),
              },
            },
          });
        }
      },

      // ✅ Add item to CURRENT table's cart
      addItem: (item) => {
        const { currentTableId, carts } = get();
        if (!currentTableId) {
          console.error('❌ No table selected');
          return;
        }

        const currentCart = carts[currentTableId] || {
          tableId: currentTableId,
          storeId: get().currentStoreId || '',
          items: [],
          updatedAt: new Date().toISOString(),
        };
        const existingItem = currentCart.items.find((i) => i.productId === item.productId);

        const updatedItems = existingItem
          ? currentCart.items.map((i) =>
              i.productId === item.productId
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,

                    // 👇 SNAPSHOT LẠI GIÁ
                    originalPrice: item.originalPrice,
                    finalPrice: item.finalPrice,
                    discountAmount: item.discountAmount,
                    discountPercent: item.discountPercent,
                    hasDiscount: item.hasDiscount,
                  }
                : i,
            )
          : [...currentCart.items, item];

        set({
          carts: {
            ...carts,
            [currentTableId]: {
              ...currentCart,
              items: updatedItems,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ✅ Remove item from CURRENT table's cart
      removeItem: (productId) => {
        const { currentTableId, carts } = get();
        if (!currentTableId) return;

        const currentCart = carts[currentTableId];
        if (!currentCart) return;

        set({
          carts: {
            ...carts,
            [currentTableId]: {
              ...currentCart,
              items: currentCart.items.filter((i) => i.productId !== productId),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ✅ Update quantity in CURRENT table's cart
      updateQuantity: (productId, quantity) => {
        const { currentTableId, carts } = get();
        if (!currentTableId) return;

        const currentCart = carts[currentTableId];
        if (!currentCart) return;

        set({
          carts: {
            ...carts,
            [currentTableId]: {
              ...currentCart,
              items: currentCart.items.map((i) =>
                i.productId === productId ? { ...i, quantity } : i,
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // ✅ Clear CURRENT table's cart
      clearCart: () => {
        const { currentTableId, carts } = get();
        if (!currentTableId) return;

        const updatedCarts = { ...carts };
        delete updatedCarts[currentTableId];

        set({ carts: updatedCarts });
      },

      // ✅ NEW: Clear specific table's cart (for payment)
      clearTableCart: (tableId: string) => {
        const carts = get().carts;
        const updatedCarts = { ...carts };
        delete updatedCarts[tableId];

        set({ carts: updatedCarts });
      },

      // ✅ Get total items count for CURRENT table
      getTotalItems: () => {
        const { currentTableId, carts } = get();
        if (!currentTableId || !carts[currentTableId]) return 0;

        return carts[currentTableId].items.reduce((total, item) => total + item.quantity, 0);
      },

      // ✅ NEW: Get current table's items
      getCurrentItems: () => {
        const { currentTableId, carts } = get();
        if (!currentTableId || !carts[currentTableId]) return [];

        return carts[currentTableId].items;
      },
      getSubtotal: () => {
        const { currentTableId, carts } = get();
        if (!currentTableId || !carts[currentTableId]) return 0;

        return carts[currentTableId].items.reduce(
          (t, i) => t + Number(i.originalPrice) * i.quantity,
          0,
        );
      },
      getFinalTotal: () => {
        const { currentTableId, carts } = get();
        if (!currentTableId || !carts[currentTableId]) return 0;

        return carts[currentTableId].items.reduce(
          (t, i) => t + Number(i.finalPrice) * i.quantity,
          0,
        );
      },
      getSaving: () => {
        const { currentTableId, carts } = get();
        if (!currentTableId || !carts[currentTableId]) return 0;

        return carts[currentTableId].items.reduce(
          (t, i) => t + (Number(i.originalPrice) - Number(i.finalPrice)) * i.quantity,
          0,
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      // ✅ IMPORTANT: Only persist carts, not current table
      partialize: (state) => ({ carts: state.carts }),
    },
  ),
);
