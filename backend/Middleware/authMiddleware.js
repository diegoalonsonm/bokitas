import { supabase } from '../Models/supabase/client.js'

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authorization header'
        }
      })
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error) {
      console.error('Auth verification failed:', error)
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token'
        }
      })
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message
      }
    })
  }
}
