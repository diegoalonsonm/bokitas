import { supabase } from '../Models/supabase/client.js'
import { STORAGE_BUCKETS, STORAGE_MAX_SIZE, STORAGE_ALLOWED_TYPES } from '../Utils/constants.js'

export interface UploadResult {
  success: boolean
  url?: string
  message: string
}

export interface UploadPhotoParams {
  userId: string
  bucket: string
  file: File
  folder?: string
}

export class StorageService {
  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile({ userId, bucket, file, folder = 'uploads' }: UploadPhotoParams): Promise<UploadResult> {
    try {
      const fileMimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

      // Validate file type
      if (!STORAGE_ALLOWED_TYPES.includes(fileMimeType)) {
        return {
          success: false,
          message: `Invalid file type. Allowed types: ${STORAGE_ALLOWED_TYPES.join(', ')}`
        }
      }

      // Validate file size based on bucket
      const maxSize = bucket === STORAGE_BUCKETS.PROFILE_PHOTOS ? STORAGE_MAX_SIZE.PROFILE_PHOTOS : STORAGE_MAX_SIZE.REVIEW_PHOTOS
      
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        return {
          success: false,
          message: `File size exceeds limit of ${maxSizeMB}MB`
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return {
        success: true,
        url: publicUrl,
        message: 'File uploaded successfully'
      }
    } catch (err) {
      console.error('Storage service error:', err)
      return {
        success: false,
        message: (err as Error).message
      }
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(bucket: string, filePath: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        console.error('Storage delete error:', error)
        throw error
      }

      return {
        success: true,
        message: 'File deleted successfully'
      }
    } catch (err) {
      console.error('Storage delete error:', err)
      return {
        success: false,
        message: (err as Error).message
      }
    }
  }

  /**
   * Upload profile photo
   */
  static async uploadProfilePhoto(userId: string, file: File): Promise<UploadResult> {
    return this.uploadFile({
      userId,
      bucket: STORAGE_BUCKETS.PROFILE_PHOTOS,
      file,
      folder: 'profile-photos'
    })
  }

  /**
   * Upload review photo
   */
  static async uploadReviewPhoto(userId: string, file: File): Promise<UploadResult> {
    return this.uploadFile({
      userId,
      bucket: STORAGE_BUCKETS.REVIEW_PHOTOS,
      file,
      folder: 'review-photos'
    })
  }

  /**
   * Get public URL for a file
   */
  static async getPublicUrl(bucket: string, filePath: string): Promise<string> {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Get public URL error:', err)
      throw err
    }
  }
}
