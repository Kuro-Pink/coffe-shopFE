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
    STORE_REQUESTS: '/admin/store-requests',
    STORE_REQUESTS_STATS: '/admin/store-requests/stats',
    STORE_REQUEST_DETAIL: (id: string) => `/admin/store-requests/${id}`,
    APPROVE_REQUEST: (id: string) => `/admin/store-requests/${id}/approve`,
    REJECT_REQUEST: (id: string) => `/admin/store-requests/${id}/reject`,
  },

  // Store/Host endpoints
  HOST: {
    MY_STORE: '/host/my-store',

    // ✅Store Requests (Host side)
    STORE_REQUESTS: '/host/store-requests',
    MY_STORE_REQUESTS: '/host/store-requests/my-requests',

    // ✅Categories
    CATEGORIES: (storeId: string) => `/host/stores/${storeId}/categories`,
    CATEGORY_DETAIL: (id: string) => `/host/categories/${id}`,
    
    // ✅Products
    PRODUCTS: (storeId: string) => `/host/stores/${storeId}/products`,
    PRODUCT_DETAIL: (id: string) => `/host/products/${id}`,
    PRODUCT_TOGGLE: (id: string) => `/host/products/${id}/toggle-availability`,
    
    // ✅Tables with status management
    TABLES: (storeId: string) => `/host/stores/${storeId}/tables`,
    TABLE_DETAIL: (id: string) => `/host/tables/${id}`,
    TABLE_STATUS: (id: string) => `/host/tables/${id}/status`,
    TABLE_SESSION: (id: string) => `/host/tables/${id}/session`,
    TABLE_PERFORMANCE: (storeId: string) => `/host/stores/${storeId}/tables/performance`,
     
    // ✅Orders
    ORDERS: (storeId: string) => `/host/stores/${storeId}/orders`,
    ORDER_DETAIL: (id: string) => `/host/orders/${id}`,
    ORDER_STATUS: (id: string) => `/host/orders/${id}/status`,

    // ✅Bills/Invoices
    BILLS: (storeId: string) => `/host/stores/${storeId}/bills`,
    BILL_DETAIL: (id: string) => `/host/bills/${id}`,
    CREATE_BILL: (storeId: string) => `/host/stores/${storeId}/bills`,
    BILL_PAYMENT: (id: string) => `/host/bills/${id}/payment`,
    
    // ✅ Analytics endpoints - 7 APIs riêng biệt
    ANALYTICS: {
      DASHBOARD: (storeId: string) => `/host/stores/${storeId}/analytics/dashboard`,
      ORDERS_TODAY: (storeId: string) => `/host/stores/${storeId}/orders/today`,
      REVENUE_TRENDS: (storeId: string) => `/host/stores/${storeId}/analytics/revenue-trends`,
      PEAK_HOURS: (storeId: string) => `/host/stores/${storeId}/analytics/peak-hours`,
      BEST_SELLERS: (storeId: string) => `/host/stores/${storeId}/analytics/best-sellers`,
      CUSTOMERS: (storeId: string) => `/host/stores/${storeId}/analytics/customers`,
      CATEGORIES: (storeId: string) => `/host/stores/${storeId}/analytics/categories`,
      TABLES: (storeId: string) => `/host/stores/${storeId}/analytics/tables`,
    },
  },

  // ✅Public/Customer endpoints
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