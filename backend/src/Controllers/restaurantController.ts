import type { Response } from 'express'
import { RestaurantModel } from '../Models/restaurantModel.js'
import { FoursquareService } from '../Services/foursquareService.js'
import { ERROR_CODES, ERROR_MESSAGES } from '../Utils/constants.js'
import {
  validateSearchRestaurants,
  validateFilterRestaurants,
  validateRestaurantId,
  validateFoursquareId,
  validatePagination,
  validateTopRestaurants,
  validateUpdateRestaurant
} from '../Models/validations/restaurantValidation.js'
import type {
  GetAllRestaurantsRequest,
  SearchRestaurantsRequest,
  GetRestaurantRequest,
  GetRestaurantByFoursquareIdRequest,
  GetRestaurantReviewsRequest,
  GetTopRestaurantsRequest,
  UpdateRestaurantRequest
} from '../types/api/restaurant.api.types.js'

export class RestaurantController {
  /**
   * GET /restaurants
   * List restaurants from local DB with filters and pagination
   */
  static async getAll(req: GetAllRestaurantsRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const validation = validateFilterRestaurants(req.query)

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

      const { tipoComida, puntuacionMin, ordenar, page, limit } = validation.data

      const { restaurants, total } = await RestaurantModel.getAll({
        tipoComida,
        puntuacionMin,
        ordenar,
        page,
        limit
      })

      res.status(200).json({
        success: true,
        data: restaurants,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (err) {
      console.error('Get all restaurants error:', err)
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
   * GET /restaurants/search
   * Search restaurants via Foursquare API
   * Supports: query, lat/lng OR near
   */
  static async search(req: SearchRestaurantsRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const validation = validateSearchRestaurants(req.query)

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

      const { query, lat, lng, radius, near, limit } = validation.data

      const restaurants = await FoursquareService.searchPlaces({
        query,
        lat,
        lng,
        radius,
        near,
        limit
      })

      res.status(200).json({
        success: true,
        data: restaurants,
        meta: {
          count: restaurants.length,
          source: 'foursquare'
        }
      })
    } catch (err) {
      console.error('Search restaurants error:', err)
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
   * GET /restaurants/:id
   * Get restaurant by local DB ID
   */
  static async getById(req: GetRestaurantRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const validation = validateRestaurantId({ id: req.params.id })

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

      const restaurant = await RestaurantModel.getById({ id: validation.data.id })

      if (!restaurant) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.RESTAURANTE_NOT_FOUND
          }
        })
        return
      }

      res.status(200).json({
        success: true,
        data: restaurant
      })
    } catch (err) {
      console.error('Get restaurant by ID error:', err)
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
   * GET /restaurants/foursquare/:fsqId
   * Get or create restaurant by Foursquare ID
   * Used when user interacts with a restaurant from search results
   */
  static async getByFoursquareId(req: GetRestaurantByFoursquareIdRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const validation = validateFoursquareId({ fsqId: req.params.fsqId })

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

      const restaurant = await RestaurantModel.getOrCreateByFoursquareId(validation.data.fsqId)

      res.status(200).json({
        success: true,
        data: restaurant
      })
    } catch (err) {
      console.error('Get restaurant by Foursquare ID error:', err)
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
   * GET /restaurants/:id/reviews
   * Get reviews for a restaurant with pagination
   */
  static async getReviews(req: GetRestaurantReviewsRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const idValidation = validateRestaurantId({ id: req.params.id })

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

      const paginationValidation = validatePagination(req.query)

      if (!paginationValidation.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: paginationValidation.error.errors[0].message
          }
        })
        return
      }

      const { page, limit } = paginationValidation.data

      // Check if restaurant exists
      const restaurant = await RestaurantModel.getById({ id: idValidation.data.id })
      if (!restaurant) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.RESTAURANTE_NOT_FOUND
          }
        })
        return
      }

      const { reviews, total } = await RestaurantModel.getReviews(idValidation.data.id, page, limit)

      res.status(200).json({
        success: true,
        data: reviews,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (err) {
      console.error('Get restaurant reviews error:', err)
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
   * GET /restaurants/top
   * Get top rated restaurants
   */
  static async getTop(req: GetTopRestaurantsRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const validation = validateTopRestaurants(req.query)

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

      const { limit } = validation.data

      const restaurants = await RestaurantModel.getTopRated(limit)

      res.status(200).json({
        success: true,
        data: restaurants,
        meta: {
          count: restaurants.length
        }
      })
    } catch (err) {
      console.error('Get top restaurants error:', err)
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
   * PUT /restaurants/:id
   * Update restaurant information (requires authentication)
   * Only basic info can be updated - name, address, photo, website
   */
  static async update(req: UpdateRestaurantRequest, res: Response, _next: unknown): Promise<void> {
    try {
      const idValidation = validateRestaurantId({ id: req.params.id })

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

      const bodyValidation = validateUpdateRestaurant(req.body)

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

      // Check if restaurant exists
      const restaurant = await RestaurantModel.getById({ id: idValidation.data.id })
      if (!restaurant) {
        res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.RESTAURANTE_NOT_FOUND
          }
        })
        return
      }

      const result = await RestaurantModel.update({
        id: idValidation.data.id,
        ...bodyValidation.data
      })

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
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
      console.error('Update restaurant error:', err)
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
