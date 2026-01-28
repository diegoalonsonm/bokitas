import type { Response } from 'express'
import { FoodTypeModel } from '../Models/foodTypeModel.js'
import { validateCreateFoodType } from '../Models/validations/foodTypeValidation.js'
import { ERROR_CODES, ERROR_MESSAGES } from '../Utils/constants.js'
import type {
  CreateFoodTypeRequest,
  GetAllFoodTypesRequest
} from '../types/api/foodType.api.types.js'

export class FoodTypeController {
  /**
   * GET /food-types
   * Get all active food types
   */
  static async getAll(_req: GetAllFoodTypesRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const foodTypes = await FoodTypeModel.getAll()

      res.status(200).json({
        success: true,
        data: foodTypes
      })
    } catch (err) {
      console.error('Get all food types error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: (err as Error).message
        }
      })
    }
  }

  /**
   * POST /food-types
   * Create a new food type (requires authentication)
   */
  static async create(req: CreateFoodTypeRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Authentication required'
          }
        })
        return
      }

      const validation = validateCreateFoodType(req.body)

      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: validation.error.errors[0].message
          }
        })
        return
      }

      // Check for duplicate name (case-insensitive)
      const exists = await FoodTypeModel.existsByName(validation.data.nombre)

      if (exists) {
        res.status(409).json({
          success: false,
          error: {
            code: ERROR_CODES.CONFLICT,
            message: ERROR_MESSAGES.FOOD_TYPE_ALREADY_EXISTS
          }
        })
        return
      }

      const foodType = await FoodTypeModel.create(validation.data)

      res.status(201).json({
        success: true,
        data: foodType
      })
    } catch (err) {
      console.error('Create food type error:', err)
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: (err as Error).message
        }
      })
    }
  }
}
