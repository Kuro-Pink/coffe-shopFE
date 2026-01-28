import api from '@/lib/api';
import { API_ENDPOINTS } from '@/config/api.config';

export interface AIChatRequest {
  storeId: string;
  phone?: string;
  message?: string;
  action?:
    | 'SMART_RECOMMEND'
    | 'SHOW_COFFEE'
    | 'SHOW_MILK_TEA'
    | 'SHOW_TEA'
    | 'SHOW_JUICE'
    | 'SHOW_SMOOTHIE'
    | 'SHOW_YOGURT'
    | 'SHOW_MATCHA'
    | 'SHOW_ICE_BLENDED'
    | 'SHOW_SNACK'
    | 'SHOW_CAKE'
    | 'SHOW_COFFEE_PAIRING'
    | 'AFTER_ADD_TO_CART'; // 🆕 dùng cho upsell
}

export interface AIChatResponse {
  reply: string;
  action?: 'CONFIRM_LAST_ORDER' | 'ASK_ADD_MORE' | null; // 🆕 flow tiếp
  phone?: string;

  products?: {
    productId: string;
    name: string;
    price: number;
    image?: string;
  }[];

  lastOrder?: {
    items: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }[];
    note?: string;
  };
}

/* =========================
   2️⃣ RECOMMEND PRODUCTS
========================= */
export interface RecommendProductsResponse {
  products: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    score?: number;
  }[];
}

/* =========================
   3️⃣ RECOMMEND COMBO (AI combo theo món trong giỏ)
========================= */
export interface RecommendComboRequest {
  storeId: string;
  productIds: string[];
}

export interface RecommendComboResponse {
  combo: {
    baseProductId: string;
    recommended: {
      _id: string;
      name: string;
      price: number;
      image?: string;
      score?: number;
    }[];
  }[];
}

/* =========================
   4️⃣ SUGGEST ORDER (Upsell toàn giỏ)
========================= */
export interface SuggestOrderResponse {
  suggestions: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    reason?: string;
  }[];
}

/* =========================
   5️⃣ CUSTOMER ANALYSIS
========================= */
export interface CustomerProfileResponse {
  customerType: 'NEW' | 'LOYAL' | 'VIP' | 'RISK';
  favoriteCategories: string[];
  averageSpend: number;
  lastVisit?: string;
  recommendedProducts?: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  }[];
}
/* =========================
   🚀 AI SERVICE
========================= */
export const aiService = {
  // 💬 Chat với AI
  chat: async (data: AIChatRequest): Promise<AIChatResponse> => {
    const res = await api.post(API_ENDPOINTS.AI.CHAT, data);
    return res.data;
  },

  // 🍽️ Gợi ý combo theo các món đang có
  recommendCombo: async (storeId: string, productId: string, signal?: AbortSignal) => {
    try {
      const res = await api.get(API_ENDPOINTS.AI.COMBO, {
        params: { storeId, productId },
        timeout: 4000,
        signal, // 👈 QUAN TRỌNG
      });

      if (!res.data?.combo) return null;
      return res.data;
    } catch {
      return null;
    }
  },

  // 🎯 Gợi ý món riêng lẻ
  recommendProducts: async (storeId: string) => {
    const res = await api.get<RecommendProductsResponse>(
      `${API_ENDPOINTS.AI.RCM_PRODUCTS}?storeId=${storeId}`,
    );
    return res.data;
  },

  // 🧠 Upsell toàn bộ giỏ hàng
  suggestOrder: async (storeId: string, productId: string[]) => {
    const res = await api.post<SuggestOrderResponse>(API_ENDPOINTS.AI.SUGGEST_ORDERS, {
      storeId,
      productId,
    });
    return res.data;
  },

  // 👤 Phân tích khách hàng
  analyzeCustomer: async (storeId: string, phone: string) => {
    const res = await api.post<CustomerProfileResponse>(API_ENDPOINTS.AI.CUSTOMER, {
      storeId,
      phone,
    });
    return res.data;
  },
};
