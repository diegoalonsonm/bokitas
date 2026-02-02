import { apiRequest, uploadFile } from '../client';
import { Review } from '@/types';
import { ApiResponse } from '@/types/api';
import { mapReview, RawReview } from '@/lib/utils/mappers';

/**
 * Data for creating a new review
 * Uses English field names - API layer will convert to Spanish
 */
export interface CreateReviewData {
  restaurantId: string;
  rating: number;
  comment?: string;
}

/**
 * Data for updating a review
 */
export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

/**
 * Reviews API endpoints
 */
export const reviewsApi = {
  /**
   * Get review by ID
   */
  async getById(id: string): Promise<ApiResponse<Review>> {
    const response = await apiRequest<RawReview>('GET', `/reviews/${id}`);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapReview(response.data),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Create a new review
   */
  async create(data: CreateReviewData): Promise<ApiResponse<Review>> {
    // Convert to Spanish field names for API
    const apiData = {
      restaurantId: data.restaurantId,
      puntuacion: data.rating,
      comentario: data.comment,
    };
    
    const response = await apiRequest<RawReview>('POST', '/reviews', apiData, true);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapReview(response.data),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Update a review (owner only)
   */
  async update(id: string, data: UpdateReviewData): Promise<ApiResponse<Review>> {
    // Convert to Spanish field names for API
    const apiData: Record<string, unknown> = {};
    if (data.rating !== undefined) apiData.puntuacion = data.rating;
    if (data.comment !== undefined) apiData.comentario = data.comment;
    
    const response = await apiRequest<RawReview>('PUT', `/reviews/${id}`, apiData, true);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: mapReview(response.data),
      };
    }
    
    return { ...response, data: undefined };
  },

  /**
   * Delete a review (soft delete, owner only)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>('DELETE', `/reviews/${id}`, undefined, true);
  },

  /**
   * Upload photo for a review (owner only)
   */
  async uploadPhoto(
    reviewId: string,
    imageUri: string
  ): Promise<ApiResponse<{ photoUrl: string }>> {
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const response = await uploadFile<{ urlFotoReview: string }>(
      `/reviews/${reviewId}/photo`,
      { uri: imageUri, name: filename, type },
      'photo'
    );
    
    // Map Spanish field to English
    if (response.success && response.data) {
      return {
        ...response,
        data: { photoUrl: response.data.urlFotoReview },
      };
    }
    
    return { ...response, data: undefined };
  },
};
