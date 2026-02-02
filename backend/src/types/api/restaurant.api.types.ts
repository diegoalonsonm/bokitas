import type { Request } from 'express'

// Restaurant API request types

export interface SearchRestaurantsQuery {
  query?: string
  lat?: string
  lng?: string
  radius?: string
  near?: string
  limit?: string
}

export interface FilterRestaurantsQuery {
  tipoComida?: string
  puntuacionMin?: string
  ordenar?: 'rating' | 'distance' | 'recent'
  page?: string
  limit?: string
  lat?: string
  lng?: string
}

export interface CreateRestaurantBody {
  foursquareid: string
}

export interface UpdateRestaurantBody {
  nombre?: string
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
  urlfotoperfil?: string | null
  urlpaginarestaurante?: string | null
}

// Request types
export type SearchRestaurantsRequest = Request<
  Record<string, string>,
  unknown,
  unknown,
  SearchRestaurantsQuery
>

export type GetAllRestaurantsRequest = Request<
  Record<string, string>,
  unknown,
  unknown,
  FilterRestaurantsQuery
>

export type GetRestaurantRequest = Request<Record<string, string>>

export type GetRestaurantByFoursquareIdRequest = Request<{ fsqId: string }>

export type GetRestaurantReviewsRequest = Request<
  Record<string, string>,
  unknown,
  unknown,
  { page?: string; limit?: string }
>

export type GetTopRestaurantsRequest = Request<
  Record<string, string>,
  unknown,
  unknown,
  { near?: string; limit?: string }
>

export type CreateRestaurantRequest = Request<
  Record<string, string>,
  unknown,
  CreateRestaurantBody
>

export type UpdateRestaurantRequest = Request<
  Record<string, string>,
  unknown,
  UpdateRestaurantBody
>
