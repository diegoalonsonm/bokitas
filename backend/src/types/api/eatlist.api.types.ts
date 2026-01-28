import type { Request } from 'express'

// Eatlist API request types

export interface AddToEatlistBody {
  restaurantId: string    // UUID or Foursquare ID
  flag?: boolean
}

export interface UpdateEatlistBody {
  flag: boolean
}

export interface EatlistParams {
  restaurantId: string
}

export interface GetEatlistQuery {
  visited?: string        // 'true' or 'false' (string from query)
}

export type GetEatlistRequest = Request<Record<string, string>, unknown, unknown, GetEatlistQuery>
export type AddToEatlistRequest = Request<Record<string, string>, unknown, AddToEatlistBody>
export type UpdateEatlistRequest = Request<EatlistParams, unknown, UpdateEatlistBody>
export type RemoveFromEatlistRequest = Request<EatlistParams>
