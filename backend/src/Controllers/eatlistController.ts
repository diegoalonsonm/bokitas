import type { Response } from 'express'
import { EatlistModel } from '../Models/eatlistModel.js'
import { UserModel } from '../Models/userModel.js'
import {
  validateAddToEatlist,
  validateUpdateEatlist,
  validateRestaurantIdParam,
  validateGetEatlistQuery
} from '../Models/validations/eatlistValidation.js'
import { ERROR_CODES, ERROR_MESSAGES } from '../Utils/constants.js'
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
  static async getAll(req: GetEatlistRequest, res: Response, _next: unknown): Promise<void> {
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

      // Validate query params
      const queryValidation = validateGetEatlistQuery(req.query)

      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: queryValidation.error.errors[0].message
          }
        })
        return
      }

      const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!ownerId) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        })
        return
      }

      const eatlist = await EatlistModel.getAll({
        userId,
        visited: queryValidation.data.visited
      })

      res.status(200).json({
        success: true,
        data: eatlist
      })
    } catch (err) {
      console.error('Get eatlist error:', err)
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
   * POST /eatlist
   * Add restaurant to user's eatlist
   */
  static async add(req: AddToEatlistRequest, res: Response, _next: unknown): Promise<void> {
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

      const validation = validateAddToEatlist(req.body)

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

      const ownerId = await UserModel.getUserIdByAuthId({ authId: userId })
      if (!ownerId) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USER_NOT_FOUND
          }
        })
        return
      }

      const result = await EatlistModel.add({
        userId,
        restaurantId: validation.data.restaurantId,
        flag: validation.data.flag
      })

      // Check if result is an error
      if ('error' in result) {
        res.status(409).json({
          success: false,
          error: {
            code: ERROR_CODES.CONFLICT,
            message: result.error
          }
        })
        return
      }

      res.status(201).json({
        success: true,
        data: result.entry
      })
    } catch (err) {
      console.error('Add to eatlist error:', err)

      if ((err as Error).message === 'Restaurant not found') {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.RESTAURANTE_NOT_FOUND
          }
        })
        return
      }

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
   * PUT /eatlist/:restaurantId
   * Update the visited flag of an eatlist entry
   */
  static async update(req: UpdateEatlistRequest, res: Response, _next: unknown): Promise<void> {
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

      const idValidation = validateRestaurantIdParam({ restaurantId: req.params.restaurantId })

      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: idValidation.error.errors[0].message
          }
        })
        return
      }

      const bodyValidation = validateUpdateEatlist(req.body)

      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: bodyValidation.error.errors[0].message
          }
        })
        return
      }

      const updated = await EatlistModel.update({
        userId,
        restaurantId: idValidation.data.restaurantId,
        flag: bodyValidation.data.flag
      })

      if (!updated) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'Eatlist entry not found'
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        data: updated
      })
    } catch (err) {
      console.error('Update eatlist error:', err)
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
   * DELETE /eatlist/:restaurantId
   * Remove restaurant from user's eatlist (soft delete)
   */
  static async remove(req: RemoveFromEatlistRequest, res: Response, _next: unknown): Promise<void> {
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

      const validation = validateRestaurantIdParam({ restaurantId: req.params.restaurantId })

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

      const result = await EatlistModel.remove({
        userId,
        restaurantId: validation.data.restaurantId
      })

      if (!result.success) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: result.message
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (err) {
      console.error('Remove from eatlist error:', err)
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
