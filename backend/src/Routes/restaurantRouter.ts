import { Router } from 'express'
import { RestaurantController } from '../Controllers/restaurantController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { asyncHandler } from '../Middleware/errorMiddleware.js'
import type {
  GetAllRestaurantsRequest,
  SearchRestaurantsRequest,
  GetRestaurantRequest,
  GetRestaurantByFoursquareIdRequest,
  GetRestaurantReviewsRequest,
  GetTopRestaurantsRequest,
  UpdateRestaurantRequest
} from '../types/api/restaurant.api.types.js'

const restaurantRouter = Router()

// Public routes (no auth required)

// GET /restaurants - List all from local DB with filters
restaurantRouter.get('/', asyncHandler((req, res) => RestaurantController.getAll(req as GetAllRestaurantsRequest, res)))

// GET /restaurants/search - Search via Foursquare API
restaurantRouter.get('/search', asyncHandler((req, res) => RestaurantController.search(req as SearchRestaurantsRequest, res)))

// GET /restaurants/top - Get top rated restaurants
restaurantRouter.get('/top', asyncHandler((req, res) => RestaurantController.getTop(req as GetTopRestaurantsRequest, res)))

// GET /restaurants/foursquare/:fsqId - Get or create by Foursquare ID
restaurantRouter.get('/foursquare/:fsqId', asyncHandler((req, res) => RestaurantController.getByFoursquareId(req as unknown as GetRestaurantByFoursquareIdRequest, res)))

// GET /restaurants/:id - Get single restaurant by local ID
restaurantRouter.get('/:id', asyncHandler((req, res) => RestaurantController.getById(req as GetRestaurantRequest, res)))

// GET /restaurants/:id/reviews - Get restaurant reviews
restaurantRouter.get('/:id/reviews', asyncHandler((req, res) => RestaurantController.getReviews(req as GetRestaurantReviewsRequest, res)))

// Protected routes (auth required)

// PUT /restaurants/:id - Update restaurant info
restaurantRouter.put('/:id', authMiddleware, asyncHandler((req, res) => RestaurantController.update(req as UpdateRestaurantRequest, res)))

export default restaurantRouter
