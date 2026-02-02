import type { Response } from 'express'
import { FoodTypeModel } from '../Models/foodTypeModel.js'
import { validateCreateFoodType } from '../Models/validations/foodTypeValidation.js'
import { ERROR_MESSAGES } from '../Utils/constants.js'
import {
  UnauthorizedError,
  ValidationError,
  ConflictError
} from '../Middleware/errorMiddleware.js'
import type {
  CreateFoodTypeRequest,
  GetAllFoodTypesRequest
} from '../types/api/foodType.api.types.js'

export class FoodTypeController {
  /**
   * GET /food-types
   * Get all active food types
   */
  static async getAll(_req: GetAllFoodTypesRequest, res: Response): Promise<void> {
    const foodTypes = await FoodTypeModel.getAll()

    res.status(200).json({
      success: true,
      data: foodTypes
    })
  }

  /**
   * POST /food-types
   * Create a new food type (requires authentication)
   */
  static async create(req: CreateFoodTypeRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const validation = validateCreateFoodType(req.body)

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    // Check for duplicate name (case-insensitive)
    const exists = await FoodTypeModel.existsByName(validation.data.nombre)

    if (exists) {
      throw new ConflictError(ERROR_MESSAGES.FOOD_TYPE_ALREADY_EXISTS)
    }

    const foodType = await FoodTypeModel.create(validation.data)

    res.status(201).json({
      success: true,
      data: foodType
    })
  }
}
