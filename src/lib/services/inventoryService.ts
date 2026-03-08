import api from '../api';
import { API_ENDPOINTS } from '@/config/api.config';
import {
  Ingredient,
  ProductRecipe,
  InventoryTransaction,
  InventorySummary,
  UsageReport,
  ProductIngredient,
} from '@/types';
export interface CreateIngredientData {
  name: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  cost: number;
}
export interface UpdateIngredientData {
  name?: string;
  unit?: string;
  minQuantity?: number;
  cost?: number;
}
export interface AdjustStockData {
  quantity: number; // positive = in, negative = out
  note?: string;
}
export interface SetRecipeData {
  ingredients: Array<{
    ingredientId: string;
    amount: number;
  }>;
}
export const inventoryService = {
  // ===== INGREDIENTS =====
  // Get all ingredients
  getIngredients: async (storeId: string, lowStock?: boolean): Promise<Ingredient[]> => {
    const url = lowStock
      ? API_ENDPOINTS.HOST.INVENTORY.INGREDIENTS.LOW_STOCK(storeId)
      : API_ENDPOINTS.HOST.INVENTORY.INGREDIENTS.LIST(storeId);
    const response = await api.get(url);
    return response.data.data;
  },
  // Get ingredient by ID
  getIngredientById: async (id: string): Promise<Ingredient> => {
    const response = await api.get(API_ENDPOINTS.HOST.INVENTORY.INGREDIENTS.DETAIL(id));
    return response.data.data;
  },
  // Create ingredient
  createIngredient: async (storeId: string, data: CreateIngredientData): Promise<Ingredient> => {
    const response = await api.post(API_ENDPOINTS.HOST.INVENTORY.INGREDIENTS.CREATE(storeId), data);
    return response.data.data;
  },
  // Update ingredient
  updateIngredient: async (id: string, data: UpdateIngredientData): Promise<Ingredient> => {
    const response = await api.put(API_ENDPOINTS.HOST.INVENTORY.INGREDIENTS.UPDATE(id), data);
    return response.data.data;
  },
  // Delete ingredient
  deleteIngredient: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.HOST.INVENTORY.INGREDIENTS.DELETE(id));
  },
  // Adjust stock (manual in/out)
  adjustStock: async (id: string, data: AdjustStockData): Promise<Ingredient> => {
    const response = await api.post(
      API_ENDPOINTS.HOST.INVENTORY.INGREDIENTS.ADJUST_STOCK(id),
      data,
    );
    return response.data.data;
  },
  // ===== PRODUCT RECIPE =====
  // Get product recipe
  getProductRecipe: async (productId: string): Promise<ProductIngredient[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.INVENTORY.PRODUCT_RECIPE(productId));
    return response.data.data;
  },
  // Set product recipe
  setProductRecipe: async (productId: string, data: SetRecipeData): Promise<ProductRecipe> => {
    const response = await api.put(API_ENDPOINTS.HOST.INVENTORY.PRODUCT_RECIPE(productId), data);
    return response.data.data;
  },
  // Check product availability (can make)
  checkProductAvailability: async (
    productId: string,
    quantity: number,
  ): Promise<{
    canMake: boolean;
    maxQuantity: number;
    missingIngredients: Array<{
      ingredientId: string;
      ingredientName: string;
      needed: number;
      available: number;
    }>;
  }> => {
    const response = await api.get(
      `${API_ENDPOINTS.HOST.INVENTORY.PRODUCT_AVAILABILITY(productId)}?quantity=${quantity}`,
    );
    return response.data.data;
  },
  // ===== REPORTS =====
  // Get inventory summary
  getInventorySummary: async (storeId: string): Promise<InventorySummary> => {
    const response = await api.get(API_ENDPOINTS.HOST.INVENTORY.INVENTORY_SUMMARY(storeId));
    return response.data.data;
  },
  // Get transaction history
  getTransactions: async (storeId: string): Promise<InventoryTransaction[]> => {
    const response = await api.get(
      API_ENDPOINTS.HOST.INVENTORY.INVENTORY_TRANSACTIONS(storeId),
      {},
    );
    return response.data.data;
  },
  // Get usage report
  getUsageReport: async (
    storeId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<UsageReport[]> => {
    const response = await api.get(API_ENDPOINTS.HOST.INVENTORY.USAGE_REPORT(storeId), { params });
    return response.data.data;
  },
};
