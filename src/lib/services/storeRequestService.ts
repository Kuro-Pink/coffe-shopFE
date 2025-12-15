import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import { StoreRequest } from '@/types';

export interface CreateStoreRequestData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeLogo?: File; // File object
  businessLicense?: string;
  description?: string;
}

export const storeRequestService = {
  // Create store request (Host)
  createStoreRequest: async (data: CreateStoreRequestData): Promise<StoreRequest> => {
    const formData = new FormData();
    formData.append('storeName', data.storeName);
    formData.append('storeAddress', data.storeAddress);
    formData.append('storePhone', data.storePhone);
    
    if (data.storeLogo) {
      formData.append('storeLogo', data.storeLogo);
    }
    
    if (data.businessLicense) {
      formData.append('businessLicense', data.businessLicense);
    }
    
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await api.post(API_ENDPOINTS.HOST.STORE_REQUESTS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Get my store requests
  getMyStoreRequests: async (): Promise<StoreRequest[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.MY_STORE_REQUESTS);
    return response.data.data;
  },
};