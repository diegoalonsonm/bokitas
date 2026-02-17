import { apiRequest } from '../client';
import { Restaurant, Review, RestaurantFilterParams } from '@/types';
import { ApiResponse, PaginationMeta } from '@/types/api';
import { mapRestaurant, mapReview, RawRestaurant, RawReview } from '@/lib/utils/mappers';

/**
 * Build query string from params object
 */
function buildQueryString(params: Record<string, unknown>): string {
  return new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)])
  ).toString();
}

/**
 * Convert filter params to API-compatible format
 */
function toQueryParams(params: RestaurantFilterParams): Record<string, unknown> {
  return {
    limit: params.limit,
    offset: params.offset,
    query: params.query,
    foodTypes: params.foodTypes?.join(','),
    minRating: params.minRating,
    latitude: params.latitude,
    longitude: params.longitude,
    radius: params.radius,
    sortBy: params.sortBy,
  };
}

/**
 * Restaurants API endpoints
 */
export const restaurantsApi = {
  /**
   * List restaurants with filters (from local database)
   */
  async getAll(
    params: RestaurantFilterParams = {}
  ): Promise<ApiResponse<Restaurant[]> & { meta?: PaginationMeta }> {
    const queryString = buildQueryString(toQueryParams(params));
    const response = await apiRequest<RawRestaurant[]>('GET', `/restaurants?${queryString}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapRestaurant),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Search restaurants via Foursquare API
   */
  async search(params: RestaurantFilterParams): Promise<ApiResponse<Restaurant[]>> {
    const queryString = buildQueryString(toQueryParams(params));
    const response = await apiRequest<RawRestaurant[]>('GET', `/restaurants/search?${queryString}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapRestaurant),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get top-rated restaurants
   */
  async getTop(limit: number = 10): Promise<ApiResponse<Restaurant[]>> {
    const queryString = buildQueryString({ limit });
    const response = await apiRequest<RawRestaurant[]>('GET', `/restaurants/top?${queryString}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapRestaurant),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get or create restaurant by Foursquare ID
   */
  async getByFoursquareId(fsqId: string): Promise<ApiResponse<Restaurant>> {
    const response = await apiRequest<RawRestaurant>('GET', `/restaurants/foursquare/${fsqId}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapRestaurant(response.data),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get restaurant by local database ID
   */
  async getById(id: string): Promise<ApiResponse<Restaurant>> {
    const response = await apiRequest<RawRestaurant>('GET', `/restaurants/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapRestaurant(response.data),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get reviews for a restaurant (paginated)
   */
  async getReviews(
    id: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<ApiResponse<Review[]> & { meta?: PaginationMeta }> {
    const queryString = buildQueryString(params);
    const response = await apiRequest<RawReview[]>('GET', `/restaurants/${id}/reviews?${queryString}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapReview),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Update restaurant information (requires auth)
   */
  async update(
    id: string,
    data: Partial<Restaurant>
  ): Promise<ApiResponse<void>> {
    return apiRequest<void>('PUT', `/restaurants/${id}`, data, true);
  },
};
