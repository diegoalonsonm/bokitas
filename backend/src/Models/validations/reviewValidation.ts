import { z } from 'zod'

const createReviewSchema = z.object({
  restaurantId: z.string({
    required_error: 'Restaurant ID is required',
    invalid_type_error: 'Restaurant ID must be a string'
  }).min(1, 'Restaurant ID cannot be empty'),
  puntuacion: z.coerce.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comentario: z.string()
    .max(2000, 'Comment must be 2000 characters or less')
    .nullable()
    .optional()
})

const updateReviewSchema = z.object({
  puntuacion: z.coerce.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  comentario: z.string()
    .max(2000, 'Comment must be 2000 characters or less')
    .nullable()
    .optional()
}).refine(
  data => data.puntuacion !== undefined || data.comentario !== undefined,
  { message: 'At least one field (puntuacion or comentario) must be provided' }
)

const reviewIdSchema = z.object({
  id: z.string({
    required_error: 'Review ID is required',
    invalid_type_error: 'Review ID must be a string'
  }).uuid('Invalid review ID format')
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ReviewIdInput = z.infer<typeof reviewIdSchema>

export function validateCreateReview(data: unknown) {
  return createReviewSchema.safeParse(data)
}

export function validateUpdateReview(data: unknown) {
  return updateReviewSchema.safeParse(data)
}

export function validateReviewId(data: unknown) {
  return reviewIdSchema.safeParse(data)
}
