import multer from 'multer'
import { STORAGE_ALLOWED_TYPES } from '../Utils/constants.js'

// Configure multer for memory storage (we'll process and upload to Supabase in the controller)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    // Check if file type is allowed (more permissive check to handle various image types)
    if (file && file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${STORAGE_ALLOWED_TYPES.join(', ')}`))
    }
  }
})

// Middleware to handle single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName)
}

// Middleware to handle multiple file uploads
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount)
}

export default upload
