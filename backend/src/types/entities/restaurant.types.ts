// Restaurant entity types

export interface Restaurant {
  id: string
  nombre: string
  direccion: string | null
  latitud: number | null
  longitud: number | null
  urlfotoperfil: string | null
  urlpaginarestaurante: string | null
  puntuacion: number
  foursquareid: string | null
  createdat: string
  updatedat: string
  idestado: string
  active: boolean
}

export interface RestaurantWithFoodTypes extends Restaurant {
  foodTypes?: FoodType[]
  reviewcount?: number
}

export interface FoodType {
  id: string
  nombre: string
}

export interface CreateRestaurantParams {
  nombre: string
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
  urlfotoperfil?: string | null
  urlpaginarestaurante?: string | null
  foursquareid?: string | null
  foodTypeIds?: string[]
}

export interface UpdateRestaurantParams {
  id: string
  nombre?: string
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
  urlfotoperfil?: string | null
  urlpaginarestaurante?: string | null
  puntuacion?: number
}

export interface GetRestaurantParams {
  id: string
}

export interface GetRestaurantByFoursquareIdParams {
  foursquareid: string
}

export interface RestaurantSearchParams {
  query?: string
  lat?: number
  lng?: number
  radius?: number
  near?: string
  limit?: number
}

export interface RestaurantFilterParams {
  tipoComida?: string
  puntuacionMin?: number
  ordenar?: 'rating' | 'distance' | 'recent'
  page?: number
  limit?: number
  lat?: number
  lng?: number
}

export interface LinkFoodTypesParams {
  restaurantId: string
  foodTypeIds: string[]
}
