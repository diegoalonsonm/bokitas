import type { Request } from 'express'

// Review API request types

export interface CreateReviewBody {
  restaurantId: string
  puntuacion: number
  comentario?: string | null
}

export interface UpdateReviewBody {
  puntuacion?: number
  comentario?: string | null
}

export interface ReviewParams {
  id: string
}

export type CreateReviewRequest = Request<Record<string, string>, unknown, CreateReviewBody>
export type UpdateReviewRequest = Request<ReviewParams, unknown, UpdateReviewBody>
export type GetReviewRequest = Request<ReviewParams>
export type DeleteReviewRequest = Request<ReviewParams>
export type UploadReviewPhotoRequest = Request<ReviewParams>
