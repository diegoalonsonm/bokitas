import { z } from 'zod'

// Add to eatlist - restaurantId required, flag optional (defaults false)
const addToEatlistSchema = z.object({
  restaurantId: z.string({
    required_error: 'Restaurant ID is required',
    invalid_type_error: 'Restaurant ID must be a string'
  }).min(1, 'Restaurant ID cannot be empty'),
  flag: z.boolean().optional().default(false)
})

// Update eatlist - flag is required
const updateEatlistSchema = z.object({
  flag: z.boolean({
    required_error: 'Flag is required',
    invalid_type_error: 'Flag must be a boolean'
  })
})

// Restaurant ID path parameter - UUID format
const restaurantIdParamSchema = z.object({
  restaurantId: z.string({
    required_error: 'Restaurant ID is required'
  }).uuid('Invalid restaurant ID format')
})

// Query params for GET - visited filter
const getEatlistQuerySchema = z.object({
  visited: z.enum(['true', 'false']).optional()
    .transform(val => val === undefined ? undefined : val === 'true')
})

export type AddToEatlistInput = z.infer<typeof addToEatlistSchema>
export type UpdateEatlistInput = z.infer<typeof updateEatlistSchema>
export type RestaurantIdParamInput = z.infer<typeof restaurantIdParamSchema>
export type GetEatlistQueryInput = z.infer<typeof getEatlistQuerySchema>

export function validateAddToEatlist(data: unknown) {
  return addToEatlistSchema.safeParse(data)
}

export function validateUpdateEatlist(data: unknown) {
  return updateEatlistSchema.safeParse(data)
}

export function validateRestaurantIdParam(data: unknown) {
  return restaurantIdParamSchema.safeParse(data)
}

export function validateGetEatlistQuery(data: unknown) {
  return getEatlistQuerySchema.safeParse(data)
}
