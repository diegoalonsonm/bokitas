import { supabase } from './supabase/client.js'
import { ESTADO } from '../Utils/constants.js'
import { RestaurantModel } from './restaurantModel.js'
import { UserModel } from './userModel.js'
import type {
  Review,
  ReviewWithUser,
  CreateReviewParams,
  UpdateReviewParams,
  DeleteReviewParams,
  GetReviewParams,
  UploadReviewPhotoParams
} from '../types/entities/review.types.js'
import type { OperationResult } from '../types/index.js'
import { randomUUID } from 'crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class ReviewModel {
  /**
   * Resolve restaurant ID from UUID or Foursquare ID
   */
  static async resolveRestaurantId(restaurantId: string): Promise<string> {
    if (UUID_REGEX.test(restaurantId)) {
      const restaurant = await RestaurantModel.getById({ id: restaurantId })
      if (!restaurant) {
        throw new Error('Restaurant not found')
      }
      return restaurantId
    }

    const restaurant = await RestaurantModel.getOrCreateByFoursquareId(restaurantId)
    return restaurant.id
  }

  /**
   * Create a new review
   */
  static async create({ restaurantId, userId, puntuacion, comentario }: CreateReviewParams): Promise<Review> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        throw new Error('User not found')
      }

      const idrestaurante = await this.resolveRestaurantId(restaurantId)
      const now = new Date().toISOString()
      const id = randomUUID()

      const { data, error } = await supabase
        .from('review')
        .insert({
          id,
          comentario: comentario ?? null,
          puntuacion,
          urlfotoreview: null,
          idrestaurante,
          idusuario: dbUserId,
          idestado: ESTADO.ACTIVO,
          active: true,
          createdat: now,
          updatedat: now
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      await RestaurantModel.updateRating(idrestaurante)

      return data as Review
    } catch (err) {
      console.error('Error creating review:', err)
      throw err
    }
  }

  /**
   * Get review by ID with user info
   */
  static async getById({ id }: GetReviewParams): Promise<ReviewWithUser | null> {
    try {
      const { data, error } = await supabase
        .from('review')
        .select('id, comentario, puntuacion, urlfotoreview, idrestaurante, idusuario, idestado, active, createdat, updatedat, usuario:idusuario(id, nombre, primerapellido, urlfotoperfil)')
        .eq('id', id)
        .eq('active', true)
        .single()

      if (error || !data) {
        return null
      }

      const raw = data as unknown as ReviewWithUser & { usuario?: ReviewWithUser['usuario'] | ReviewWithUser['usuario'][] }
      const usuario = Array.isArray(raw.usuario) ? raw.usuario[0] : raw.usuario

      return {
        ...raw,
        usuario: usuario as ReviewWithUser['usuario']
      }
    } catch (err) {
      console.error('Error getting review by ID:', err)
      throw err
    }
  }

  /**
   * Update a review (owner only)
   */
  static async update({ id, userId, puntuacion, comentario }: UpdateReviewParams): Promise<Review | null> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        return null
      }

      const updates: Record<string, unknown> = {}

      if (puntuacion !== undefined) updates.puntuacion = puntuacion
      if (comentario !== undefined) updates.comentario = comentario

      if (Object.keys(updates).length === 0) {
        return null
      }

      updates.updatedat = new Date().toISOString()

      const { data, error } = await supabase
        .from('review')
        .update(updates)
        .eq('id', id)
        .eq('idusuario', dbUserId)
        .eq('active', true)
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        return null
      }

      await RestaurantModel.updateRating(data.idrestaurante)

      return data as Review
    } catch (err) {
      console.error('Error updating review:', err)
      throw err
    }
  }

  /**
   * Soft delete a review (owner only)
   */
  static async softDelete({ id, userId }: DeleteReviewParams): Promise<OperationResult> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        return { success: false, message: 'Review not found' }
      }

      const { data: review, error: reviewError } = await supabase
        .from('review')
        .select('idrestaurante')
        .eq('id', id)
        .eq('idusuario', dbUserId)
        .eq('active', true)
        .maybeSingle()

      if (reviewError) {
        throw reviewError
      }

      if (!review) {
        return { success: false, message: 'Review not found' }
      }

      const { error } = await supabase
        .from('review')
        .update({ active: false, updatedat: new Date().toISOString() })
        .eq('id', id)
        .eq('idusuario', dbUserId)
        .eq('active', true)

      if (error) {
        throw error
      }

      await RestaurantModel.updateRating(review.idrestaurante)

      return { success: true, message: 'Review deleted successfully' }
    } catch (err) {
      console.error('Error deleting review:', err)
      throw err
    }
  }

  /**
   * Update review photo URL (owner only)
   */
  static async updatePhoto({ id, userId, photoUrl }: UploadReviewPhotoParams): Promise<OperationResult> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        return { success: false, message: 'Review not found' }
      }

      const { data, error } = await supabase
        .from('review')
        .update({ urlfotoreview: photoUrl, updatedat: new Date().toISOString() })
        .eq('id', id)
        .eq('idusuario', dbUserId)
        .eq('active', true)
        .select('idrestaurante')
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        return { success: false, message: 'Review not found' }
      }

      const restaurant = await RestaurantModel.getById({ id: data.idrestaurante })
      if (restaurant && !restaurant.urlfotoperfil) {
        await RestaurantModel.update({ id: restaurant.id, urlfotoperfil: photoUrl })
      }

      return { success: true, message: 'Review photo updated successfully' }
    } catch (err) {
      console.error('Error updating review photo:', err)
      throw err
    }
  }

  /**
   * Check if user is the owner of a review
   */
  static async isOwner(reviewId: string, userId: string): Promise<boolean> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        return false
      }

      const { data, error } = await supabase
        .from('review')
        .select('id')
        .eq('id', reviewId)
        .eq('idusuario', dbUserId)
        .eq('active', true)
        .maybeSingle()

      if (error) {
        return false
      }

      return !!data
    } catch (err) {
      console.error('Error checking review owner:', err)
      return false
    }
  }
}
