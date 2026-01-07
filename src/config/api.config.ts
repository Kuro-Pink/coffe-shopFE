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
    }

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
    ORDERS: (storeId: string) => `/staff/store/${storeId}/orders`,
    ORDER_DETAIL: (id: string) => `/staff/orders/${id}`,
    ORDER_STATUS: (id: string) => `/staff/orders/${id}/status`,
  },
  PUBLIC: {
    MENU: (storeId: string) => `/public/stores/${storeId}/menu`,
    CREATE_ORDER: '/public/orders',
    TABLE_INFO: (tableId: string) => `/public/tables/${tableId}`,
    TABLE_CART: (tableId: string) => `/public/tables/${tableId}/cart`,
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