export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH_TOKEN: '/auth/refresh-token',
  },

  // Admin endpoints
  ADMIN: {
    STATS: '/admin/stats',
    STORES: '/admin/stores',
    STORE_DETAIL: (id: string) => `/admin/stores/${id}`,

    // Store Requests
    STORE_REQUESTS: {
      LIST: '/admin/store-requests',
      STATS: '/admin/store-requests/stats',
      DETAIL: (id: string) => `/admin/store-requests/${id}`,
      APPROVE: (id: string) => `/admin/store-requests/${id}/approve`,
      REJECT: (id: string) => `/admin/store-requests/${id}/reject`,
    },
  },

  // Store/Host endpoints
  HOST: {
    MY_STORE: '/host/my-store',
    STORE_REQUESTS: '/host/store-requests',
    MY_STORE_REQUESTS: '/host/store-requests/my-requests',
    CATEGORY: {
      LIST: (storeId: string) => `/host/stores/${storeId}/categories`,
      DETAIL: (id: string) => `/host/categories/${id}`,
    },
    PRODUCTS: {
      LIST: (storeId: string) => `/host/stores/${storeId}/products`,
      DETAIL: (id: string) => `/host/products/${id}`,
      TOGGLE: (id: string) => `/host/products/${id}/toggle-availability`,
    },
    TABLES: {
      LIST: (storeId: string) => `/host/stores/${storeId}/tables`,
      DETAIL: (id: string) => `/host/tables/${id}`,
      STATUS: (id: string) => `/host/tables/${id}/status`,
      SESSION: (id: string) => `/host/tables/${id}/session`,
      PERFORMANCE: (storeId: string) => `/host/stores/${storeId}/tables/performance`,
      UNPAID_ORDERS: (tableId: string) => `/host/tables/${tableId}/unpaid-orders`,
    },
    ORDERS: {
      LIST: (storeId: string) => `/host/stores/${storeId}/orders`,
      DETAIL: (id: string) => `/host/orders/${id}`,
      STATUS: (id: string) => `/host/orders/${id}/status`,
    },
    BILLS: {
      LIST: (storeId: string) => `/host/stores/${storeId}/bills`,
      DETAIL: (id: string) => `/host/bills/${id}`,
      PAYMENT: (id: string) => `/host/bills/${id}/payment`,
    },
    STAFF: {
      LIST: (storeId: string) => `/host/stores/${storeId}/staff`,
      DETAIL: (id: string) => `/host/staff/${id}`,
      CREATE: (storeId: string) => `/host/stores/${storeId}/staff`,
      UPDATE: (id: string) => `/host/staff/${id}`,
      DELETE: (id: string) => `/host/staff/${id}`,
      TOGGLE_STATUS: (id: string) => `/host/staff/${id}/toggle-status`,
      STATS: (storeId: string) => `/host/stores/${storeId}/staff/stats`,
      PERFORMANCE: (storeId: string) => `/host/stores/${storeId}/reports/staff-performance`,
    },
    SHIFTS: {
      ALL: (storeId: string) => `/host/stores/${storeId}/shifts`,
      ACTIVE: (storeId: string) => `/host/stores/${storeId}/shifts/active`,
      STATS: (storeId: string) => `/host/stores/${storeId}/shifts/stats`,
      REPORT: (shiftId: string) => `/host/shifts/${shiftId}/report`,
      STAFF_HISTORY: (staffId: string) => `/host/staff/${staffId}/shifts`,
    },
    INVENTORY: {
      // Ingredients
      INGREDIENTS: {
        LIST: (storeId: string) => `/host/stores/${storeId}/ingredients`,
        DETAIL: (id: string) => `/host/ingredients/${id}`,
        CREATE: (storeId: string) => `/host/stores/${storeId}/ingredients`,
        UPDATE: (id: string) => `/host/ingredients/${id}`,
        DELETE: (id: string) => `/host/ingredients/${id}`,
        ADJUST_STOCK: (id: string) => `/host/ingredients/${id}/adjust-stock`,
        LOW_STOCK: (storeId: string) => `/host/stores/${storeId}/ingredients?lowStock=true`,
      },
      // Product Recipe
      PRODUCT_RECIPE: (productId: string) => `/host/products/${productId}/recipe`,
      PRODUCT_AVAILABILITY: (productId: string) => `/host/products/${productId}/availability`,

      // Reports
      INVENTORY_SUMMARY: (storeId: string) => `/host/stores/${storeId}/inventory/summary`,
      INVENTORY_TRANSACTIONS: (storeId: string) => `/host/stores/${storeId}/inventory/transactions`,
      USAGE_REPORT: (storeId: string) => `/host/stores/${storeId}/inventory/usage-report`,
    },
    ANALYTICS: {
      DASHBOARD: (storeId: string) => `/host/stores/${storeId}/analytics/dashboard`,
      ORDERS_TODAY: (storeId: string) => `/host/stores/${storeId}/orders/today`,
      REVENUE_TRENDS: (storeId: string) => `/host/stores/${storeId}/analytics/revenue-trends`,
      PEAK_HOURS: (storeId: string) => `/host/stores/${storeId}/analytics/peak-hours`,
      BEST_SELLERS: (storeId: string) => `/host/stores/${storeId}/analytics/best-sellers`,
      CUSTOMERS: (storeId: string) => `/host/stores/${storeId}/analytics/customers`,
      BY_CATEGORY: (storeId: string) => `/host/stores/${storeId}/analytics/categories`,
      TABLES: (storeId: string) => `/host/stores/${storeId}/analytics/tables`,
    },
  },
  STAFF: {
    MY_SHIFT: {
      CURRENT: '/staff/my-shift/current',
      CHECK_IN: '/staff/my-shift/check-in',
      CHECK_OUT: '/staff/my-shift/check-out',
      HISTORY: '/staff/my-shifts', // ?startDate=...&endDate=...
      STATS: '/staff/my-shifts/stats', // ?startDate=...&endDate=...
    },
  },
  PUBLIC: {
    MENU: (storeId: string) => `/public/stores/${storeId}/menu`,
    CREATE_ORDER: '/public/orders',
    TABLE_INFO: (tableId: string) => `/public/tables/${tableId}`,
    TABLE_CART: (tableId: string) => `/public/tables/${tableId}/cart`,
  },
  AI: {
    CHAT: '/ai/chat',
    RCM_PRODUCTS: '/ai/recommend',
    COMBO: '/ai/combo',
    SUGGEST_ORDERS: '/ai/suggest-order',
    CUSTOMER: '/ai/customer-profile',
  },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
