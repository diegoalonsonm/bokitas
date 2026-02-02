import { z } from 'zod'

// Search restaurants query parameters
const searchRestaurantsSchema = z.object({
  query: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(50000).optional(),
  near: z.string().min(2).optional(),
  limit: z.coerce.number().int().positive().max(50).optional()
}).refine(
  data => {
    // Either both lat and lng are provided, or neither
    if ((data.lat !== undefined) !== (data.lng !== undefined)) {
      return false
    }
    return true
  },
  { message: 'Provide both lat and lng together, or use near parameter instead' }
)

// Filter restaurants query parameters
const filterRestaurantsSchema = z.object({
  tipoComida: z.string().uuid('Invalid food type ID').optional(),
  puntuacionMin: z.coerce.number().min(1).max(5).optional(),
  ordenar: z.enum(['rating', 'distance', 'recent']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional()
})

// Get or create restaurant by Foursquare ID
const foursquareIdSchema = z.object({
  fsqId: z.string({
    required_error: 'Foursquare ID is required',
    invalid_type_error: 'Foursquare ID must be a string'
  }).min(1, 'Foursquare ID cannot be empty')
})

// Restaurant ID parameter
const restaurantIdSchema = z.object({
  id: z.string({
    required_error: 'Restaurant ID is required',
    invalid_type_error: 'Restaurant ID must be a string'
  }).uuid('Must be a valid UUID')
})

// Update restaurant body
const updateRestaurantSchema = z.object({
  nombre: z.string().min(1, 'Name cannot be empty').optional(),
  direccion: z.string().optional().nullable(),
  latitud: z.number().min(-90).max(90).optional().nullable(),
  longitud: z.number().min(-180).max(180).optional().nullable(),
  urlfotoperfil: z.string().url('Must be a valid URL').optional().nullable(),
  urlpaginarestaurante: z.string().url('Must be a valid URL').optional().nullable()
})

// Top restaurants query
const topRestaurantsSchema = z.object({
  near: z.string().min(2).optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(10)
})

// Pagination for reviews
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20)
})

// Export types
export type SearchRestaurantsInput = z.infer<typeof searchRestaurantsSchema>
export type FilterRestaurantsInput = z.infer<typeof filterRestaurantsSchema>
export type FoursquareIdInput = z.infer<typeof foursquareIdSchema>
export type RestaurantIdInput = z.infer<typeof restaurantIdSchema>
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>
export type TopRestaurantsInput = z.infer<typeof topRestaurantsSchema>
export type PaginationInput = z.infer<typeof paginationSchema>

// Validation functions
export function validateSearchRestaurants(data: unknown) {
  return searchRestaurantsSchema.safeParse(data)
}

export function validateFilterRestaurants(data: unknown) {
  return filterRestaurantsSchema.safeParse(data)
}

export function validateFoursquareId(data: unknown) {
  return foursquareIdSchema.safeParse(data)
}

export function validateRestaurantId(data: unknown) {
  return restaurantIdSchema.safeParse(data)
}

export function validateUpdateRestaurant(data: unknown) {
  return updateRestaurantSchema.safeParse(data)
}

export function validateTopRestaurants(data: unknown) {
  return topRestaurantsSchema.safeParse(data)
}

export function validatePagination(data: unknown) {
  return paginationSchema.safeParse(data)
}
