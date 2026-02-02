import { apiRequest, uploadFile } from '../client';
import { User, UserPublic, Review, ReviewWithRestaurant, EatlistEntry, EatlistEntryWithRestaurant, Restaurant } from '@/types';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '@/types/api';
import { mapUser, mapReview, mapRestaurant, RawUser, RawReview, RawRestaurant } from '@/lib/utils/mappers';

/**
 * Users API endpoints
 */
export const usersApi = {
  /**
   * Get user's public profile by ID
   */
  async getById(id: string): Promise<ApiResponse<UserPublic>> {
    const response = await apiRequest<RawUser>('GET', `/users/${id}`);
    
    if (response.success && response.data) {
      const user = mapUser(response.data);
      return {
        ...response,
        data: {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          photoUrl: user.photoUrl,
          createdAt: user.createdAt,
        },
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Update user profile (own profile only)
   */
  async update(
    id: string,
    data: {
      nombre?: string;
      primerapellido?: string;
      segundoapellido?: string | null;
      urlfotoperfil?: string;
    }
  ): Promise<ApiResponse<void>> {
    return apiRequest<void>('PUT', `/users/${id}`, data, true);
  },

  /**
   * Deactivate account (soft delete)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>('DELETE', `/users/${id}`, undefined, true);
  },

  /**
   * Upload profile photo
   */
  async uploadPhoto(
    id: string,
    imageUri: string
  ): Promise<ApiResponse<{ photoUrl: string }>> {
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const response = await uploadFile<{ urlFotoPerfil: string }>(
      `/users/${id}/photo`,
      { uri: imageUri, name: filename, type },
      'photo'
    );
    
    // Map Spanish field to English
    if (response.success && response.data) {
      return {
        ...response,
        data: { photoUrl: response.data.urlFotoPerfil },
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get user's reviews (paginated)
   */
  async getReviews(
    id: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<Review[]> & { meta?: PaginationMeta }> {
    const { page = 1, limit = 20 } = params;
    const response = await apiRequest<RawReview[]>('GET', `/users/${id}/reviews`, {
      page,
      limit,
    });
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapReview),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get user's eatlist
   */
  async getEatlist(id: string): Promise<ApiResponse<EatlistEntryWithRestaurant[]>> {
    interface RawEatlistEntry {
      id: string;
      idusuario: string;
      idrestaurante: string;
      hasbeenflag: boolean;
      active: boolean;
      createdat: string;
      updatedat: string;
      restaurante: RawRestaurant;
    }
    
    const response = await apiRequest<RawEatlistEntry[]>('GET', `/users/${id}/eatlist`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map((entry) => ({
          id: entry.id,
          userId: entry.idusuario,
          restaurantId: entry.idrestaurante,
          hasBeenFlag: entry.hasbeenflag,
          active: entry.active,
          createdAt: entry.createdat,
          updatedAt: entry.updatedat,
          restaurant: mapRestaurant(entry.restaurante),
        })),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Get user's top 4 rated restaurants
   */
  async getTop4(id: string): Promise<ApiResponse<Restaurant[]>> {
    const response = await apiRequest<RawRestaurant[]>('GET', `/users/${id}/top4`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.map(mapRestaurant),
      };
    }
    
    return { ...response, data: undefined };
  },
};
