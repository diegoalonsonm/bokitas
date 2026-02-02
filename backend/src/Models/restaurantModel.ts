import { supabase } from './supabase/client.js'
import { ESTADO } from '../Utils/constants.js'
import { FoursquareService } from '../Services/foursquareService.js'
import type { 
  Restaurant, 
  RestaurantWithFoodTypes,
  CreateRestaurantParams, 
  UpdateRestaurantParams,
  GetRestaurantParams,
  GetRestaurantByFoursquareIdParams,
  RestaurantFilterParams,
  LinkFoodTypesParams,
  FoodType
} from '../types/entities/restaurant.types.js'
import type { OperationResult } from '../types/index.js'
import { randomUUID } from 'crypto'

export class RestaurantModel {
  /**
   * Get all restaurants with filters and pagination
   */
  static async getAll(filters: RestaurantFilterParams): Promise<{ restaurants: Restaurant[]; total: number }> {
    try {
      const { 
        tipoComida, 
        puntuacionMin, 
        ordenar = 'recent', 
        page = 1, 
        limit = 20 
      } = filters

      const offset = (page - 1) * limit

      // Build base query
      let query = supabase
        .from('restaurante')
        .select('*', { count: 'exact' })
        .eq('active', true)

      // Filter by food type if provided
      if (tipoComida) {
        // Get restaurant IDs that have this food type
        const { data: rtcData } = await supabase
          .from('restaurantetipocomida')
          .select('idrestaurante')
          .eq('idtipocomida', tipoComida)

        if (rtcData && rtcData.length > 0) {
          const restaurantIds = rtcData.map(r => r.idrestaurante)
          query = query.in('id', restaurantIds)
        } else {
          // No restaurants with this food type
          return { restaurants: [], total: 0 }
        }
      }

      // Filter by minimum rating
      if (puntuacionMin !== undefined) {
        query = query.gte('puntuacion', puntuacionMin)
      }

      // Apply sorting
      switch (ordenar) {
        case 'rating':
          query = query.order('puntuacion', { ascending: false })
          break
        case 'recent':
          query = query.order('createdat', { ascending: false })
          break
        case 'distance':
          // Distance sorting would require lat/lng and PostGIS
          // For now, fall back to rating
          query = query.order('puntuacion', { ascending: false })
          break
        default:
          query = query.order('createdat', { ascending: false })
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return { 
        restaurants: (data || []) as Restaurant[], 
        total: count || 0 
      }
    } catch (err) {
      console.error('Error getting restaurants:', err)
      throw err
    }
  }

  /**
   * Get restaurant by ID
   */
  static async getById({ id }: GetRestaurantParams): Promise<RestaurantWithFoodTypes | null> {
    try {
      const { data, error } = await supabase
        .from('restaurante')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single()

      if (error || !data) {
        return null
      }

      // Get food types for this restaurant
      const foodTypes = await this.getFoodTypes(id)

      return {
        ...data,
        foodTypes
      } as RestaurantWithFoodTypes
    } catch (err) {
      console.error('Error getting restaurant by ID:', err)
      throw err
    }
  }

  /**
   * Get restaurant by Foursquare ID
   */
  static async getByFoursquareId({ foursquareid }: GetRestaurantByFoursquareIdParams): Promise<RestaurantWithFoodTypes | null> {
    try {
      const { data, error } = await supabase
        .from('restaurante')
        .select('*')
        .eq('foursquareid', foursquareid)
        .eq('active', true)
        .single()

      if (error || !data) {
        return null
      }

      // Get food types for this restaurant
      const foodTypes = await this.getFoodTypes(data.id)

      return {
        ...data,
        foodTypes
      } as RestaurantWithFoodTypes
    } catch (err) {
      console.error('Error getting restaurant by Foursquare ID:', err)
      throw err
    }
  }

  /**
   * Create a new restaurant
   */
  static async create(params: CreateRestaurantParams): Promise<Restaurant> {
    try {
      const id = randomUUID()
      
      const { data, error } = await supabase
        .from('restaurante')
        .insert({
          id,
          nombre: params.nombre,
          direccion: params.direccion || null,
          latitud: params.latitud || null,
          longitud: params.longitud || null,
          urlfotoperfil: params.urlfotoperfil || null,
          urlpaginarestaurante: params.urlpaginarestaurante || null,
          foursquareid: params.foursquareid || null,
          puntuacion: 0,
          idestado: ESTADO.ACTIVO,
          active: true,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Link food types if provided
      if (params.foodTypeIds && params.foodTypeIds.length > 0) {
        await this.linkFoodTypes({ restaurantId: id, foodTypeIds: params.foodTypeIds })
      }

      return data as Restaurant
    } catch (err) {
      console.error('Error creating restaurant:', err)
      throw err
    }
  }

  /**
   * Update restaurant info
   */
  static async update({ id, ...updateData }: UpdateRestaurantParams): Promise<OperationResult> {
    try {
      const updates: Record<string, unknown> = {}

      if (updateData.nombre !== undefined) updates.nombre = updateData.nombre
      if (updateData.direccion !== undefined) updates.direccion = updateData.direccion
      if (updateData.latitud !== undefined) updates.latitud = updateData.latitud
      if (updateData.longitud !== undefined) updates.longitud = updateData.longitud
      if (updateData.urlfotoperfil !== undefined) updates.urlfotoperfil = updateData.urlfotoperfil
      if (updateData.urlpaginarestaurante !== undefined) updates.urlpaginarestaurante = updateData.urlpaginarestaurante
      if (updateData.puntuacion !== undefined) updates.puntuacion = updateData.puntuacion

      if (Object.keys(updates).length === 0) {
        return { success: false, message: 'No fields to update' }
      }

      updates.updatedat = new Date().toISOString()

      const { data, error } = await supabase
        .from('restaurante')
        .update(updates)
        .eq('id', id)
        .eq('active', true)
        .select('id')
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        return { success: false, message: 'Restaurant not found' }
      }

      return { success: true, message: 'Restaurant updated successfully' }
    } catch (err) {
      console.error('Error updating restaurant:', err)
      throw err
    }
  }

  /**
   * Get or create restaurant by Foursquare ID
   * Used when user interacts with a restaurant (review, eatlist)
   */
  static async getOrCreateByFoursquareId(foursquareid: string): Promise<RestaurantWithFoodTypes> {
    try {
      // Check if restaurant already exists
      const existing = await this.getByFoursquareId({ foursquareid })
      if (existing) {
        return existing
      }

      // Fetch details from Foursquare
      const foursquareData = await FoursquareService.getPlaceDetails(foursquareid)

      // Create the restaurant
      const restaurant = await this.create({
        nombre: foursquareData.nombre,
        direccion: foursquareData.direccion,
        latitud: foursquareData.latitud,
        longitud: foursquareData.longitud,
        urlfotoperfil: foursquareData.urlfotoperfil,
        urlpaginarestaurante: foursquareData.urlpaginarestaurante,
        foursquareid: foursquareData.foursquareid,
        foodTypeIds: foursquareData.foodTypeIds
      })

      // Get food types for response
      const foodTypes = await this.getFoodTypes(restaurant.id)

      return {
        ...restaurant,
        foodTypes
      }
    } catch (err) {
      console.error('Error in getOrCreateByFoursquareId:', err)
      throw err
    }
  }

  /**
   * Link food types to a restaurant
   */
  static async linkFoodTypes({ restaurantId, foodTypeIds }: LinkFoodTypesParams): Promise<void> {
    try {
      // Remove existing links
      await supabase
        .from('restaurantetipocomida')
        .delete()
        .eq('idrestaurante', restaurantId)

      // Insert new links
      if (foodTypeIds.length > 0) {
        const links = foodTypeIds.map(foodTypeId => ({
          idrestaurante: restaurantId,
          idtipocomida: foodTypeId,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString()
        }))

        const { error } = await supabase
          .from('restaurantetipocomida')
          .insert(links)

        if (error) {
          console.error('Error linking food types:', error)
          // Don't throw - food type linking is not critical
        }
      }
    } catch (err) {
      console.error('Error linking food types:', err)
      // Don't throw - food type linking is not critical
    }
  }

  /**
   * Get food types for a restaurant
   */
  static async getFoodTypes(restaurantId: string): Promise<FoodType[]> {
    try {
      const { data, error } = await supabase
        .from('restaurantetipocomida')
        .select('idtipocomida, tipocomida:idtipocomida(id, nombre)')
        .eq('idrestaurante', restaurantId)

      if (error || !data) {
        return []
      }

      // Extract food type data from joined result
      const foodTypes: FoodType[] = []
      for (const item of data) {
        // Supabase returns the joined data, handle both array and object formats
        const tipocomida = item.tipocomida as unknown
        if (tipocomida && typeof tipocomida === 'object' && 'id' in tipocomida && 'nombre' in tipocomida) {
          foodTypes.push(tipocomida as FoodType)
        }
      }
      return foodTypes
    } catch (err) {
      console.error('Error getting food types:', err)
      return []
    }
  }

  /**
   * Get restaurant reviews
   */
  static async getReviews(restaurantId: string, page: number = 1, limit: number = 20): Promise<{ reviews: unknown[]; total: number }> {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from('review')
        .select('id, idusuario, puntuacion, comentario, urlfotoreview, createdat, usuario:idusuario(id, nombre, primerapellido, urlfotoperfil)', { count: 'exact' })
        .eq('idrestaurante', restaurantId)
        .eq('active', true)
        .order('createdat', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return { 
        reviews: data || [], 
        total: count || 0 
      }
    } catch (err) {
      console.error('Error getting restaurant reviews:', err)
      throw err
    }
  }

  /**
   * Get top rated restaurants
   */
  static async getTopRated(limit: number = 10): Promise<Restaurant[]> {
    try {
      const { data, error } = await supabase
        .from('restaurante')
        .select('*')
        .eq('active', true)
        .gt('puntuacion', 0) // Only restaurants with ratings
        .order('puntuacion', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return (data || []) as Restaurant[]
    } catch (err) {
      console.error('Error getting top rated restaurants:', err)
      throw err
    }
  }

  /**
   * Update restaurant rating (called after review changes)
   */
  static async updateRating(restaurantId: string): Promise<void> {
    try {
      // Calculate average rating from all active reviews
      const { data, error } = await supabase
        .from('review')
        .select('puntuacion')
        .eq('idrestaurante', restaurantId)
        .eq('active', true)

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        // No reviews, set rating to 0
        await supabase
          .from('restaurante')
          .update({ puntuacion: 0, updatedat: new Date().toISOString() })
          .eq('id', restaurantId)
        return
      }

      // Calculate average
      const totalRating = data.reduce((sum, review) => sum + review.puntuacion, 0)
      const avgRating = totalRating / data.length

      // Update restaurant rating (rounded to 1 decimal)
      await supabase
        .from('restaurante')
        .update({ 
          puntuacion: Math.round(avgRating * 10) / 10,
          updatedat: new Date().toISOString()
        })
        .eq('id', restaurantId)
    } catch (err) {
      console.error('Error updating restaurant rating:', err)
      // Don't throw - rating update is not critical
    }
  }
}
