import { z } from 'zod'

const profileUpdateSchema = z.object({
  nombre: z.string({
    invalid_type_error: 'Name must be a string'
  }).min(2, 'Name must be at least 2 characters').optional(),
  apellido: z.string({
    invalid_type_error: 'Last name must be a string'
  }).min(2, 'Last name must be at least 2 characters').optional(),
  primerapellido: z.string({
    invalid_type_error: 'Last name must be a string'
  }).min(2, 'Last name must be at least 2 characters').optional(),
  urlfotoperfil: z.string({
    invalid_type_error: 'Profile photo URL must be a string'
  }).url('Must be a valid URL').optional()
})

const idSchema = z.object({
  id: z.string({
    required_error: 'ID is required',
    invalid_type_error: 'ID must be a string'
  }).uuid('Must be a valid UUID')
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type IdInput = z.infer<typeof idSchema>

export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.safeParse(data)
}

export function validateId(data: unknown) {
  return idSchema.safeParse(data)
}
