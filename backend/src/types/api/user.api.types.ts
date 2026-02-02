import type { Request } from 'express'

// User API request types

export interface UpdateProfileBody {
  nombre?: string
  primerapellido?: string
  segundoapellido?: string | null
  urlfotoperfil?: string
}

export interface UserQuery {
  page?: string
  limit?: string
}

// Use Record<string, string> for params to avoid strict Express typing conflicts
export type GetUserRequest = Request<Record<string, string>>
export type UpdateUserRequest = Request<Record<string, string>, unknown, UpdateProfileBody>
export type DeleteUserRequest = Request<Record<string, string>>
export type GetUserReviewsRequest = Request<Record<string, string>, unknown, unknown, UserQuery>
export type GetUserEatlistRequest = Request<Record<string, string>>
export type GetUserTop4Request = Request<Record<string, string>>
export type UploadPhotoRequest = Request<Record<string, string>>
