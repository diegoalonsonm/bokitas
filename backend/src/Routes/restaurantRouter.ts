import { Router } from 'express'
import { RestaurantController } from '../Controllers/restaurantController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'

const restaurantRouter = Router()

// Public routes (no auth required)

// GET /restaurants - List all from local DB with filters
restaurantRouter.get('/', (req, res, next) => RestaurantController.getAll(req, res, next))

// GET /restaurants/search - Search via Foursquare API
restaurantRouter.get('/search', (req, res, next) => RestaurantController.search(req, res, next))

// GET /restaurants/top - Get top rated restaurants
restaurantRouter.get('/top', (req, res, next) => RestaurantController.getTop(req, res, next))

// GET /restaurants/foursquare/:fsqId - Get or create by Foursquare ID
restaurantRouter.get('/foursquare/:fsqId', (req, res, next) => RestaurantController.getByFoursquareId(req, res, next))

// GET /restaurants/:id - Get single restaurant by local ID
restaurantRouter.get('/:id', (req, res, next) => RestaurantController.getById(req, res, next))

// GET /restaurants/:id/reviews - Get restaurant reviews
restaurantRouter.get('/:id/reviews', (req, res, next) => RestaurantController.getReviews(req, res, next))

// Protected routes (auth required)

// PUT /restaurants/:id - Update restaurant info
restaurantRouter.put('/:id', authMiddleware, (req, res, next) => RestaurantController.update(req, res, next))

export default restaurantRouter
