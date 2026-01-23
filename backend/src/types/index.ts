// Shared types across the application

export interface OperationResult {
  success: boolean
  message: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: PaginationMeta
}
