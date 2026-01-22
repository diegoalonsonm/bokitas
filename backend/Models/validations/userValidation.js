import { z } from 'zod'

const profileUpdateSchema = z.object({
  nombre: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).optional(),
  apellido: z.string({
    required_error: 'Last name is required',
    invalid_type_error: 'Last name must be a string'
  }).optional(),
  urlfotoperfil: z.string({
    required_error: 'Profile photo URL is required',
    invalid_type_error: 'Profile photo URL must be a string'
  }).url('Must be a valid URL').optional()
})

export function validateProfileUpdate(data) {
  return profileUpdateSchema.safeParse(data)
}

export function validateId(data) {
  return z.string({
    required_error: 'ID is required',
    invalid_type_error: 'ID must be a string'
  }).uuid('Must be a valid UUID').safeParse(data)
}
