import { apiRequest } from '../client';
import { EatlistEntry, EatlistEntryWithRestaurant, Restaurant } from '@/types';
import { ApiResponse } from '@/types/api';
import { mapRestaurant, RawRestaurant } from '@/lib/utils/mappers';

/**
 * Raw eatlist entry from API
 */
interface RawEatlistEntry {
  id: string;
  idusuario: string;
  idrestaurante: string;
  hasbeenflag: boolean;
  active: boolean;
  createdat: string;
  updatedat: string;
  restaurante?: RawRestaurant;
}

/**
 * Map raw eatlist entry to internal type
 */
function mapEatlistEntry(raw: RawEatlistEntry): EatlistEntry {
  return {
    id: raw.id,
    userId: raw.idusuario,
    restaurantId: raw.idrestaurante,
    hasBeenFlag: raw.hasbeenflag,
    active: raw.active,
    createdAt: raw.createdat,
    updatedAt: raw.updatedat,
    restaurant: raw.restaurante ? mapRestaurant(raw.restaurante) : undefined,
  };
}

/**
 * Map raw eatlist entry with restaurant to internal type
 */
function mapEatlistEntryWithRestaurant(raw: RawEatlistEntry & { restaurante: RawRestaurant }): EatlistEntryWithRestaurant {
  return {
    id: raw.id,
    userId: raw.idusuario,
    restaurantId: raw.idrestaurante,
    hasBeenFlag: raw.hasbeenflag,
    active: raw.active,
    createdAt: raw.createdat,
    updatedAt: raw.updatedat,
    restaurant: mapRestaurant(raw.restaurante),
  };
}

/**
 * Eatlist API endpoints
 */
export const eatlistApi = {
  /**
   * Get current user's eatlist
   */
  async getAll(visited?: boolean): Promise<ApiResponse<EatlistEntryWithRestaurant[]>> {
    let endpoint = '/eatlist';
    if (visited !== undefined) {
      endpoint += `?visited=${visited}`;
    }
    
    const response = await apiRequest<(RawEatlistEntry & { restaurante: RawRestaurant })[]>(
      'GET',
      endpoint,
      undefined,
      true
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapEatlistEntryWithRestaurant),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get "want to visit" list
   */
  async getWantToVisit(): Promise<ApiResponse<EatlistEntryWithRestaurant[]>> {
    return this.getAll(false);
  },

  /**
   * Get "visited" list
   */
  async getVisited(): Promise<ApiResponse<EatlistEntryWithRestaurant[]>> {
    return this.getAll(true);
  },

  /**
   * Add restaurant to eatlist
   */
  async add(
    restaurantId: string,
    visited: boolean = false
  ): Promise<ApiResponse<EatlistEntry>> {
    const response = await apiRequest<RawEatlistEntry>(
      'POST',
      '/eatlist',
      { restaurantId, flag: visited },
      true
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapEatlistEntry(response.data),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Update eatlist entry (mark visited/unvisited)
   */
  async updateFlag(
    restaurantId: string,
    visited: boolean
  ): Promise<ApiResponse<EatlistEntry>> {
    const response = await apiRequest<RawEatlistEntry>(
      'PUT',
      `/eatlist/${restaurantId}`,
      { flag: visited },
      true
    );
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapEatlistEntry(response.data),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Mark restaurant as visited
   */
  async markAsVisited(restaurantId: string): Promise<ApiResponse<EatlistEntry>> {
    return this.updateFlag(restaurantId, true);
  },

  /**
   * Mark restaurant as "want to visit"
   */
  async markAsWantToVisit(restaurantId: string): Promise<ApiResponse<EatlistEntry>> {
    return this.updateFlag(restaurantId, false);
  },

  /**
   * Remove from eatlist (soft delete)
   */
  async remove(restaurantId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>('DELETE', `/eatlist/${restaurantId}`, undefined, true);
  },
};
