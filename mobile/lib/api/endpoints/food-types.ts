import { apiRequest } from '../client';
import { FoodType } from '@/types';
import { ApiResponse } from '@/types/api';

/**
 * Food Types API endpoints
 */
export const foodTypesApi = {
  /**
   * Get all active food types
   */
  async getAll(): Promise<ApiResponse<FoodType[]>> {
    return apiRequest<FoodType[]>('GET', '/food-types');
  },

  /**
   * Create a new food type (requires auth)
   */
  async create(nombre: string): Promise<ApiResponse<FoodType>> {
    return apiRequest<FoodType>('POST', '/food-types', { nombre }, true);
  },
};
