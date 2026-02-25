import multer from 'multer'
import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { STORAGE_ALLOWED_TYPES } from '../Utils/constants.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file && file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${STORAGE_ALLOWED_TYPES.join(', ')}`))
    }
  }
})

export const uploadSingle = (fieldName: string): RequestHandler[] => {
  return [
    upload.single(fieldName),
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file uploaded. Please select an image.'
          }
        })
        return
      }
      next()
    }
  ]
}

export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount)
}

export default upload
