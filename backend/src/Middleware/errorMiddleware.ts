import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { ERROR_CODES } from '../Utils/constants.js'

// =============================================================================
// Custom Error Classes
// =============================================================================

/**
 * Base error class for application errors.
 * All custom errors should extend this class.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    this.name = 'AppError'
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, ERROR_CODES.NOT_FOUND)
    this.name = 'NotFoundError'
  }
}

/**
 * 400 Validation error (bad request)
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR)
    this.name = 'ValidationError'
  }
}

/**
 * 401 Unauthorized error (missing or invalid auth)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, ERROR_CODES.UNAUTHORIZED)
    this.name = 'UnauthorizedError'
  }
}

/**
 * 403 Forbidden error (authenticated but not allowed)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, ERROR_CODES.FORBIDDEN)
    this.name = 'ForbiddenError'
  }
}

/**
 * 409 Conflict error (duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, ERROR_CODES.CONFLICT)
    this.name = 'ConflictError'
  }
}

// =============================================================================
// Async Handler Utility
// =============================================================================

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

/**
 * Wrapper for async route handlers to catch errors and pass to error middleware.
 * Eliminates the need for try/catch blocks in controllers.
 *
 * @example
 * router.get('/:id', asyncHandler(ReviewController.getById))
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// =============================================================================
// 404 Handler for Undefined Routes
// =============================================================================

/**
 * Handles requests to undefined routes.
 * Must be registered after all valid routes.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  })
}

// =============================================================================
// Global Error Handler
// =============================================================================

// Type for errors that might have additional properties
interface SupabaseError {
  code?: string
  details?: string
  message?: string
}

interface ZodError {
  issues?: Array<{ message: string }>
}

/**
 * Map Supabase/Postgres error codes to HTTP status codes
 */
function getSupabaseStatusCode(code: string): number {
  const codeMap: Record<string, number> = {
    PGRST116: 404, // Column not found / no rows
    PGRST106: 400, // Not null violation
    PGRST104: 400, // Duplicate key
    '23505': 409,  // Unique violation
    '23503': 400,  // Foreign key violation
    '23514': 400,  // Check violation
    '42501': 403,  // Insufficient privileges
    '42P01': 404,  // Undefined table
  }

  return codeMap[code] || 500
}

/**
 * Get user-friendly message for common Supabase errors
 */
function getSupabaseMessage(code: string): string {
  const messageMap: Record<string, string> = {
    PGRST116: 'Resource not found',
    PGRST106: 'Missing required field',
    PGRST104: 'Duplicate entry',
    '23505': 'Resource already exists',
    '23503': 'Invalid reference',
    '23514': 'Data validation failed',
    '42501': 'Permission denied',
    '42P01': 'Resource not found',
  }

  return messageMap[code] || 'Database error'
}

/**
 * Global error handler middleware.
 * Handles all errors thrown in the application.
 *
 * Must be registered as the last middleware in Express.
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Handle custom AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    })

    // Log non-operational errors in development
    if (isDevelopment && !err.isOperational) {
      console.error('Non-operational Error:', err)
    }

    return
  }

  // Handle Zod validation errors
  const zodError = err as ZodError
  if (zodError.issues && Array.isArray(zodError.issues)) {
    res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: zodError.issues[0]?.message || 'Validation error'
      }
    })
    return
  }

  // Handle Supabase/Postgres errors
  const supabaseError = err as SupabaseError
  if (supabaseError.code) {
    const statusCode = getSupabaseStatusCode(supabaseError.code)

    res.status(statusCode).json({
      success: false,
      error: {
        code: supabaseError.code,
        message: isDevelopment 
          ? supabaseError.message || getSupabaseMessage(supabaseError.code)
          : getSupabaseMessage(supabaseError.code)
      }
    })

    if (isDevelopment) {
      console.error('Supabase Error:', supabaseError)
    }

    return
  }

  // Handle unknown errors
  console.error('Unhandled Error:', err)

  res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: isDevelopment ? err.message : 'An unexpected error occurred'
    }
  })
}
