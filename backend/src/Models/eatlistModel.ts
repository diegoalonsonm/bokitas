import { supabase } from './supabase/client.js'
import { RestaurantModel } from './restaurantModel.js'
import { UserModel } from './userModel.js'
import type {
  Eatlist,
  EatlistWithRestaurant,
  GetEatlistParams,
  AddToEatlistParams,
  UpdateEatlistParams,
  RemoveFromEatlistParams,
  CheckEatlistParams
} from '../types/entities/eatlist.types.js'
import type { OperationResult } from '../types/index.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class EatlistModel {
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
   * Get user's eatlist with optional visited filter
   */
  static async getAll({ userId, visited }: GetEatlistParams): Promise<EatlistWithRestaurant[]> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        throw new Error('User not found')
      }

      let query = supabase
        .from('eatlist')
        .select(`
          idusuario,
          idrestaurante,
          flag,
          active,
          createdat,
          updatedat,
          restaurante:idrestaurante (
            id,
            nombre,
            urlfotoperfil,
            puntuacion
          )
        `)
        .eq('idusuario', dbUserId)
        .eq('active', true)
        .order('createdat', { ascending: false })

      // Apply visited filter if provided
      if (visited !== undefined) {
        query = query.eq('flag', visited)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transform the data to match EatlistWithRestaurant interface
      const result: EatlistWithRestaurant[] = (data || []).map((item: unknown) => {
        const raw = item as Record<string, unknown>
        const restaurante = Array.isArray(raw.restaurante) ? raw.restaurante[0] : raw.restaurante
        return {
          idusuario: raw.idusuario as string,
          idrestaurante: raw.idrestaurante as string,
          flag: raw.flag as boolean,
          active: raw.active as boolean,
          createdat: raw.createdat as string,
          updatedat: raw.updatedat as string,
          restaurante: restaurante as EatlistWithRestaurant['restaurante']
        }
      })

      return result
    } catch (err) {
      console.error('Error getting eatlist:', err)
      throw err
    }
  }

  /**
   * Check if an eatlist entry exists
   */
  static async findEntry({ userId, restaurantId, includeInactive = false }: CheckEatlistParams): Promise<Eatlist | null> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        return null
      }

      let query = supabase
        .from('eatlist')
        .select('*')
        .eq('idusuario', dbUserId)
        .eq('idrestaurante', restaurantId)

      if (!includeInactive) {
        query = query.eq('active', true)
      }

      const { data, error } = await query.maybeSingle()

      if (error) {
        throw error
      }

      return data as Eatlist | null
    } catch (err) {
      console.error('Error checking eatlist entry:', err)
      throw err
    }
  }

  /**
   * Add restaurant to user's eatlist
   * - Reactivates soft-deleted entries
   * - Returns conflict error if already exists and active
   */
  static async add({ userId, restaurantId, flag = false }: AddToEatlistParams): Promise<{ entry: Eatlist; reactivated: boolean } | { error: string }> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        throw new Error('User not found')
      }

      // Resolve restaurant ID (UUID or Foursquare)
      const idrestaurante = await this.resolveRestaurantId(restaurantId)
      const now = new Date().toISOString()

      // Check if entry exists (including inactive)
      const { data: existingEntry, error: checkError } = await supabase
        .from('eatlist')
        .select('*')
        .eq('idusuario', dbUserId)
        .eq('idrestaurante', idrestaurante)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existingEntry) {
        if (existingEntry.active) {
          // Already exists and active - return conflict
          return { error: 'Restaurant already in eatlist' }
        }

        // Reactivate soft-deleted entry with new flag
        const { data, error } = await supabase
          .from('eatlist')
          .update({
            flag,
            active: true,
            updatedat: now
          })
          .eq('idusuario', dbUserId)
          .eq('idrestaurante', idrestaurante)
          .select()
          .single()

        if (error) {
          throw error
        }

        return { entry: data as Eatlist, reactivated: true }
      }

      // Create new entry
      const { data, error } = await supabase
        .from('eatlist')
        .insert({
          idusuario: dbUserId,
          idrestaurante,
          flag,
          active: true,
          createdat: now,
          updatedat: now
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { entry: data as Eatlist, reactivated: false }
    } catch (err) {
      console.error('Error adding to eatlist:', err)
      throw err
    }
  }

  /**
   * Update the flag (visited status) of an eatlist entry
   */
  static async update({ userId, restaurantId, flag }: UpdateEatlistParams): Promise<Eatlist | null> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        return null
      }

      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('eatlist')
        .update({
          flag,
          updatedat: now
        })
        .eq('idusuario', dbUserId)
        .eq('idrestaurante', restaurantId)
        .eq('active', true)
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      return data as Eatlist | null
    } catch (err) {
      console.error('Error updating eatlist entry:', err)
      throw err
    }
  }

  /**
   * Remove restaurant from user's eatlist (soft delete)
   */
  static async remove({ userId, restaurantId }: RemoveFromEatlistParams): Promise<OperationResult> {
    try {
      const dbUserId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!dbUserId) {
        return { success: false, message: 'Eatlist entry not found' }
      }

      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('eatlist')
        .update({
          active: false,
          updatedat: now
        })
        .eq('idusuario', dbUserId)
        .eq('idrestaurante', restaurantId)
        .eq('active', true)
        .select('idrestaurante')
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!data) {
        return { success: false, message: 'Eatlist entry not found' }
      }

      return { success: true, message: 'Removed from eatlist successfully' }
    } catch (err) {
      console.error('Error removing from eatlist:', err)
      throw err
    }
  }
}
