import { z } from 'zod'

const createFoodTypeSchema = z.object({
  nombre: z.string({
    required_error: 'Food type name is required',
    invalid_type_error: 'Food type name must be a string'
  })
    .min(2, 'Food type name must be at least 2 characters')
    .max(100, 'Food type name must be 100 characters or less')
})

export type CreateFoodTypeInput = z.infer<typeof createFoodTypeSchema>

export function validateCreateFoodType(data: unknown) {
  return createFoodTypeSchema.safeParse(data)
}
