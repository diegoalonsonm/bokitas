import type { Request, Response, NextFunction } from 'express'
import { supabase } from '../Models/supabase/client.js'
import type { AuthUser } from '../types/entities/auth.types.js'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authorization header'
        }
      })
      return
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error) {
      console.error('Auth verification failed:', error)
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token'
        }
      })
      return
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      })
      return
    }

    req.user = user as AuthUser
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: (err as Error).message
      }
    })
  }
}
