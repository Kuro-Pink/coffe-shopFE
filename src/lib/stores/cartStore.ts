import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  tableId: string | null;
  storeId: string | null;
  
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setTable: (tableId: string, storeId: string) => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      storeId: null,
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId),
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      })),
      
      clearCart: () => set({ items: [], tableId: null, storeId: null }),
      
      setTable: (tableId, storeId) => set({ tableId, storeId }),
      
      getTotalAmount: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);