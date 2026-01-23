import { supabase } from './supabase/client.js'
import { ESTADO } from '../Utils/constants.js'
import type { User, GetUserParams, UpdateUserParams, DeleteUserParams, GetUserByEmailParams } from '../types/entities/user.types.js'
import type { OperationResult } from '../types/index.js'
import { randomUUID } from 'crypto'

export class UserModel {
  /**
   * Create a new user
   */
  static async create({ email, nombre, apellido, authId }: { email: string; nombre: string; apellido: string; authId: string }): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .insert({
          id: randomUUID(),
          email,
          nombre,
          apellido,
          idauth: authId,
          idestado: ESTADO.PENDIENTE,
          active: true,
          createdat: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as User
    } catch (err) {
      console.error('Error creating user:', err)
      throw err
    }
  }

  /**
   * Get user by ID
   */
  static async getById({ id }: GetUserParams): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('id, email, nombre, apellido, urlFotoPerfil, createdat, idestado, active')
        .eq('id', id)
        .eq('active', true)
        .single()

      if (error || !data) {
        return null
      }

      return data as User
    } catch (err) {
      console.error('Error getting user by ID:', err)
      throw err
    }
  }

  /**
   * Get user ID by email
   */
  static async getUserIdByEmail({ email }: GetUserByEmailParams): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('id')
        .eq('email', email)
        .eq('active', true)
        .single()

      if (error || !data) {
        return null
      }

      return data.id
    } catch (err) {
      console.error('Error getting user by email:', err)
      throw err
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile({ id, nombre, apellido, urlFotoPerfil, idestado }: UpdateUserParams): Promise<OperationResult> {
    try {
      const updateData: Record<string, unknown> = {}
      
      if (nombre !== undefined) {
        updateData.nombre = nombre
      }
      if (apellido !== undefined) {
        updateData.apellido = apellido
      }
      if (urlFotoPerfil !== undefined) {
        updateData.urlFotoPerfil = urlFotoPerfil
      }
      if (idestado !== undefined) {
        updateData.idestado = idestado
      }

      if (Object.keys(updateData).length === 0) {
        return { success: false, message: 'No fields to update' }
      }

      const { error } = await supabase
        .from('usuario')
        .update(updateData)
        .eq('id', id)
        .eq('active', true)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { success: true, message: 'Profile updated successfully' }
    } catch (err) {
      console.error('Error updating user profile:', err)
      throw err
    }
  }

  /**
   * Soft delete user (set active = false)
   */
  static async softDelete({ id }: DeleteUserParams): Promise<OperationResult> {
    try {
      const { error } = await supabase
        .from('usuario')
        .update({ active: false, idestado: ESTADO.ELIMINADO })
        .eq('id', id)
        .eq('active', true)

      if (error) {
        throw error
      }

      return { success: true, message: 'Account deactivated successfully' }
    } catch (err) {
      console.error('Error deactivating user:', err)
      throw err
    }
  }

  /**
   * Get user reviews
   */
  static async getReviews(userId: string, page: number = 1, limit: number = 20): Promise<unknown[]> {
    try {
      const offset = (page - 1) * limit

      const { data, error } = await supabase
        .from('review')
        .select('id, idusuario, puntuacion, comentario, createdat')
        .eq('idusuario', userId)
        .eq('active', true)
        .order('createdat', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error getting user reviews:', err)
      throw err
    }
  }

  /**
   * Get user eatlist
   */
  static async getEatlist(userId: string): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('eatlist')
        .select('idusuario, idrestaurante, visitado, createdat')
        .eq('idusuario', userId)

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error getting user eatlist:', err)
      throw err
    }
  }

  /**
   * Get user's top 4 rated restaurants
   */
  static async getTop4(userId: string): Promise<unknown[]> {
    try {
      const { data: eatlistData, error: eatlistError } = await supabase
        .from('eatlist')
        .select('idrestaurante')
        .eq('idusuario', userId)

      if (eatlistError) {
        throw eatlistError
      }

      if (!eatlistData || eatlistData.length === 0) {
        return []
      }

      const restaurantIds = eatlistData.map((e: { idrestaurante: string }) => e.idrestaurante)

      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurante')
        .select('id, nombre, urlfotoperfil, puntuacion')
        .in('id', restaurantIds)
        .eq('active', true)
        .order('puntuacion', { ascending: false })
        .limit(4)

      if (restaurantsError) {
        throw restaurantsError
      }

      return restaurants || []
    } catch (err) {
      console.error('Error getting top 4 restaurants:', err)
      throw err
    }
  }
}
