import type { Response } from 'express'
import { RestaurantModel } from '../Models/restaurantModel.js'
import { FoursquareService } from '../Services/foursquareService.js'
import { ERROR_MESSAGES } from '../Utils/constants.js'
import {
  ValidationError,
  NotFoundError
} from '../Middleware/errorMiddleware.js'
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
  static async getAll(req: GetAllRestaurantsRequest, res: Response): Promise<void> {
    const validation = validateFilterRestaurants(req.query)

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
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
  }

  /**
   * GET /restaurants/search
   * Search restaurants via Foursquare API
   * Supports: query, lat/lng OR near
   */
  static async search(req: SearchRestaurantsRequest, res: Response): Promise<void> {
    const validation = validateSearchRestaurants(req.query)

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
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
  }

  /**
   * GET /restaurants/:id
   * Get restaurant by local DB ID
   */
  static async getById(req: GetRestaurantRequest, res: Response): Promise<void> {
    const validation = validateRestaurantId({ id: req.params.id })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const restaurant = await RestaurantModel.getById({ id: validation.data.id })

    if (!restaurant) {
      throw new NotFoundError(ERROR_MESSAGES.RESTAURANTE_NOT_FOUND)
    }

    res.status(200).json({
      success: true,
      data: restaurant
    })
  }

  /**
   * GET /restaurants/foursquare/:fsqId
   * Get or create restaurant by Foursquare ID
   * Used when user interacts with a restaurant from search results
   */
  static async getByFoursquareId(req: GetRestaurantByFoursquareIdRequest, res: Response): Promise<void> {
    const validation = validateFoursquareId({ fsqId: req.params.fsqId })

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
    }

    const restaurant = await RestaurantModel.getOrCreateByFoursquareId(validation.data.fsqId)

    res.status(200).json({
      success: true,
      data: restaurant
    })
  }

  /**
   * GET /restaurants/:id/reviews
   * Get reviews for a restaurant with pagination
   */
  static async getReviews(req: GetRestaurantReviewsRequest, res: Response): Promise<void> {
    const idValidation = validateRestaurantId({ id: req.params.id })

    if (!idValidation.success) {
      throw new ValidationError(idValidation.error.errors[0].message)
    }

    const paginationValidation = validatePagination(req.query)

    if (!paginationValidation.success) {
      throw new ValidationError(paginationValidation.error.errors[0].message)
    }

    const { page, limit } = paginationValidation.data

    // Check if restaurant exists
    const restaurant = await RestaurantModel.getById({ id: idValidation.data.id })
    if (!restaurant) {
      throw new NotFoundError(ERROR_MESSAGES.RESTAURANTE_NOT_FOUND)
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
  }

  /**
   * GET /restaurants/top
   * Get top rated restaurants
   */
  static async getTop(req: GetTopRestaurantsRequest, res: Response): Promise<void> {
    const validation = validateTopRestaurants(req.query)

    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message)
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
  }

  /**
   * PUT /restaurants/:id
   * Update restaurant information (requires authentication)
   * Only basic info can be updated - name, address, photo, website
   */
  static async update(req: UpdateRestaurantRequest, res: Response): Promise<void> {
    const idValidation = validateRestaurantId({ id: req.params.id })

    if (!idValidation.success) {
      throw new ValidationError(idValidation.error.errors[0].message)
    }

    const bodyValidation = validateUpdateRestaurant(req.body)

    if (!bodyValidation.success) {
      throw new ValidationError(bodyValidation.error.errors[0].message)
    }

    // Check if restaurant exists
    const restaurant = await RestaurantModel.getById({ id: idValidation.data.id })
    if (!restaurant) {
      throw new NotFoundError(ERROR_MESSAGES.RESTAURANTE_NOT_FOUND)
    }

    const result = await RestaurantModel.update({
      id: idValidation.data.id,
      ...bodyValidation.data
    })

    if (!result.success) {
      throw new ValidationError(result.message)
    }

    res.status(200).json({
      success: true,
      message: result.message
    })
  }
}
