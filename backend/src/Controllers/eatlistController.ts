import type { Response } from 'express'
import { EatlistModel } from '../Models/eatlistModel.js'
import { UserModel } from '../Models/userModel.js'
import {
  validateAddToEatlist,
  validateUpdateEatlist,
  validateRestaurantIdParam,
  validateGetEatlistQuery
} from '../Models/validations/eatlistValidation.js'
import { ERROR_MESSAGES } from '../Utils/constants.js'
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ConflictError
} from '../Middleware/errorMiddleware.js'
import type {
  GetEatlistRequest,
  AddToEatlistRequest,
  UpdateEatlistRequest,
  RemoveFromEatlistRequest
} from '../types/api/eatlist.api.types.js'

export class EatlistController {
  /**
   * GET /eatlist
   * Get current user's eatlist with optional visited filter
   */
  static async getAll(req: GetEatlistRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    // Validate query params
    const queryValidation = validateGetEatlistQuery(req.query)

    if (!queryValidation.success) {
      throw new ValidationError(queryValidation.error.errors[0].message)
    }

    const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
    if (!ownerId) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
    }

    const eatlist = await EatlistModel.getAll({
      userId,
      visited: queryValidation.data.visited
    })

    res.status(200).json({
      success: true,
      data: eatlist
    })
  }

  /**
   * POST /eatlist
   * Add restaurant to user's eatlist
   */
  static async add(req: AddToEatlistRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const validation = validateAddToEatlist(req.body)

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
    if (!ownerId) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND)
    }

    const result = await EatlistModel.add({
      userId,
      restaurantId: validation.data.restaurantId,
      flag: validation.data.flag
    })

    // Check if result is an error
    if ('error' in result) {
      throw new ConflictError(result.error)
    }

    res.status(201).json({
      success: true,
      data: result.entry
    })
  }

  /**
   * PUT /eatlist/:restaurantId
   * Update the visited flag of an eatlist entry
   */
  static async update(req: UpdateEatlistRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const idValidation = validateRestaurantIdParam({ restaurantId: req.params.restaurantId })

    if (!idValidation.success) {
      throw new ValidationError(idValidation.error.errors[0].message)
    }

    const bodyValidation = validateUpdateEatlist(req.body)

    if (!bodyValidation.success) {
      throw new ValidationError(bodyValidation.error.errors[0].message)
    }

    const updated = await EatlistModel.update({
      userId,
      restaurantId: idValidation.data.restaurantId,
      flag: bodyValidation.data.flag
    })

    if (!updated) {
      throw new NotFoundError('Eatlist entry not found')
    }

    res.status(200).json({
      success: true,
      data: updated
    })
  }

  /**
   * DELETE /eatlist/:restaurantId
   * Remove restaurant from user's eatlist (soft delete)
   */
  static async remove(req: RemoveFromEatlistRequest, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('Authentication required')
    }

    const validation = validateRestaurantIdParam({ restaurantId: req.params.restaurantId })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const result = await EatlistModel.remove({
      userId,
      restaurantId: validation.data.restaurantId
    })

    if (!result.success) {
      throw new NotFoundError(result.message)
    }

    res.status(200).json({
      success: true,
      message: result.message
    })
  }
}
