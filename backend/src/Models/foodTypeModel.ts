import { supabase } from './supabase/client.js'
import { ESTADO } from '../Utils/constants.js'
import { randomUUID } from 'crypto'
import type { FoodType, CreateFoodTypeParams } from '../types/entities/foodType.types.js'

export class FoodTypeModel {
  /**
   * Get all active food types ordered alphabetically
   */
  static async getAll(): Promise<FoodType[]> {
    try {
      const { data, error } = await supabase
        .from('tipocomida')
        .select('*')
        .eq('active', true)
        .order('nombre', { ascending: true })

      if (error) {
        throw error
      }

      return (data || []) as FoodType[]
    } catch (err) {
      console.error('Error getting all food types:', err)
      throw err
    }
  }

  /**
   * Create a new food type
   */
  static async create({ nombre }: CreateFoodTypeParams): Promise<FoodType> {
    try {
      const now = new Date().toISOString()
      const id = randomUUID()

      const { data, error } = await supabase
        .from('tipocomida')
        .insert({
          id,
          nombre,
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

      console.log('Food type created successfully with ID:', id)
      return data as FoodType
    } catch (err) {
      console.error('Error creating food type:', err)
      throw err
    }
  }

  /**
   * Check if a food type with the same name exists (case-insensitive)
   */
  static async existsByName(nombre: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('tipocomida')
        .select('id')
        .ilike('nombre', nombre)
        .eq('active', true)
        .limit(1)

      if (error) {
        throw error
      }

      return !!data && data.length > 0
    } catch (err) {
      console.error('Error checking food type by name:', err)
      throw err
    }
  }
}
