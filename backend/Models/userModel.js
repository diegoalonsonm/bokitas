import { supabase } from '../supabase/client.js'
import { ESTADO, ERROR_MESSAGES } from '../Utils/constants.js'

export class UserModel {
  static async create({ email, nombre, apellido, idauth }) {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .insert({
          id: crypto.randomUUID(),
          email,
          nombre,
          apellido,
          idauth,
          idestado: ESTADO.PENDIENTE,
          active: true,
          createdat: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error creating user:', err)
      throw err
    }
  }

  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('id, email, nombre, apellido, urlfotoperfil, createdat, idestado, active')
        .eq('id', id)
        .eq('active', true)
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (err) {
      console.error('Error getting user by ID:', err)
      throw err
    }
  }

  static async getByEmail(email) {
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

      return data ? data.id : null
    } catch (err) {
      console.error('Error getting user by email:', err)
      throw err
    }
  }

  static async updateProfile(id, updates) {
    try {
      const updateData = {}
      
      if (updates.nombre !== undefined) {
        updateData.nombre = updates.nombre
      }
      if (updates.apellido !== undefined) {
        updateData.apellido = updates.apellido
      }
      if (updates.urlfotoperfil !== undefined) {
        updateData.urlfotoperfil = updates.urlfotoperfil
      }
      if (updates.idestado !== undefined) {
        updateData.idestado = updates.idestado
      }

      if (Object.keys(updateData).length === 0) {
        return { success: false, message: 'No fields to update' }
      }

      const { data, error } = await supabase
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

  static async softDelete(id) {
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

  static async getReviews(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit

      const { data, error } = await supabase
        .from('review')
        .select('id, idusuario, puntuacion, comentario, createdat')
        .eq('idusuario', userId)
        .eq('active', true)
        .order('createdat', { ascending: false })
        .range(offset, limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error getting user reviews:', err)
      throw err
    }
  }

  static async getEatlist(userId) {
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

  static async getTop4(userId) {
    try {
      const { data, error } = await supabase
        .from('eatlist')
        .select('idrestaurante')
        .eq('idusuario', userId)

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        return []
      }

      const restaurantIds = data.map(e => e.idrestaurante)

      const { data: restaurants, error } = await supabase
        .from('restaurante')
        .select('id, nombre, urlfotoperfil, puntuacion')
        .in('id', restaurantIds)
        .eq('active', true)
        .order('puntuacion', { ascending: false })
        .limit(4)

      if (error) {
        throw error
      }

      return restaurants || []
    } catch (err) {
      console.error('Error getting top 4 restaurants:', err)
      throw err
    }
  }
}
