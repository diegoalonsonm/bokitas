import type { Request } from 'express'

// FoodType API request types

export interface CreateFoodTypeBody {
  nombre: string
}

export type CreateFoodTypeRequest = Request<Record<string, string>, unknown, CreateFoodTypeBody>
export type GetAllFoodTypesRequest = Request
