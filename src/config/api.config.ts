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
    STORES: '/admin/stores',
    STORE_DETAIL: (id: string) => `/admin/stores/${id}`,
    STATS: '/admin/stats',
  },

  // Store/Host endpoints
  STORES: {
    CATEGORIES: (storeId: string) => `/host/stores/${storeId}/categories`,
    CATEGORY_DETAIL: (id: string) => `/host/categories/${id}`,
    
    PRODUCTS: (storeId: string) => `/host/stores/${storeId}/products`,
    PRODUCT_DETAIL: (id: string) => `/host/products/${id}`,
    PRODUCT_TOGGLE: (id: string) => `/host/products/${id}/toggle-availability`,
    
    TABLES: (storeId: string) => `/host/stores/${storeId}/tables`,
    TABLE_DETAIL: (id: string) => `/host/tables/${id}`,
    
    ORDERS: (storeId: string) => `/host/stores/${storeId}/orders`,
    ORDER_DETAIL: (id: string) => `/host/orders/${id}`,
    ORDER_STATUS: (id: string) => `/host/orders/${id}/status`,
    
    STATS: (storeId: string) => `/stores/${storeId}/stats`,
  },

  // Public/Customer endpoints
  PUBLIC: {
    MENU: (storeId: string) => `/public/stores/${storeId}/menu`,
    TABLE_INFO: (tableId: string) => `/public/tables/${tableId}`,
    CREATE_ORDER: '/public/orders',
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