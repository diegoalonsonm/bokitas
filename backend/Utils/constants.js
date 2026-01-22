export const ESTADO = {
  ACTIVO: '9aca8808-a7a2-4d43-8be8-d341655caa3e',
  BLOQUEADO: 'fdec242e-0080-42d9-8307-98a72982d9ae',
  ELIMINADO: 'dbed121f-7214-41be-ad06-c12c7ae0d7de',
  INACTIVO: '31d61dcd-cb50-47f2-a0c2-d494ec358fd4',
  PENDIENTE: '05e31c9e-093c-406a-bf6a-ec457f143e9c'
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
}

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  RESTAURANTE_NOT_FOUND: 'Restaurant not found',
  REVIEW_NOT_FOUND: 'Review not found',
  INVALID_TOKEN: 'Invalid or expired token',
  NOT_OWNER: 'You do not have permission to perform this action',
  MISSING_REQUIRED_FIELD: 'Missing required field',
  INVALID_FORMAT: 'Invalid format'
}

export const FOOD_TYPES_LIMIT = 20

export const DEFAULT_SEARCH_RADIUS_KM = 10
export const DEFAULT_PAGINATION_PAGE = 1
export const DEFAULT_PAGINATION_LIMIT = 20

export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  REVIEW_PHOTOS: 'review-photos'
}

export const STORAGE_MAX_SIZE = {
  PROFILE_PHOTOS: 5 * 1024 * 1024,
  REVIEW_PHOTOS: 10 * 1024 * 1024
}

export const STORAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const FOURQUARE_FREE_TIER_LIMIT = 10000
