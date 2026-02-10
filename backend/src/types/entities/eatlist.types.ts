// Eatlist entity types

export interface Eatlist {
  idusuario: string
  idrestaurante: string
  flag: boolean           // true = visited, false = want to visit
  active: boolean
  createdat: string
  updatedat: string
}

// API response type - uses 'hasbeenflag' to match mobile client expectations
// Also includes 'id' field that mobile expects (uses idrestaurante as unique identifier per user)
export interface EatlistApiResponse {
  id: string              // synthetic id (using idrestaurante for uniqueness within user's eatlist)
  idusuario: string
  idrestaurante: string
  hasbeenflag: boolean    // mapped from 'flag' column
  active: boolean
  createdat: string
  updatedat: string
}

export interface EatlistWithRestaurant extends EatlistApiResponse {
  restaurante: {
    id: string
    nombre: string
    urlfotoperfil: string | null
    puntuacion: number | null
  }
}

export interface GetEatlistParams {
  userId: string
  visited?: boolean       // Optional filter
}

export interface AddToEatlistParams {
  userId: string
  restaurantId: string
  flag?: boolean          // Defaults to false
}

export interface UpdateEatlistParams {
  userId: string
  restaurantId: string
  flag: boolean
}

export interface RemoveFromEatlistParams {
  userId: string
  restaurantId: string
}

export interface CheckEatlistParams {
  userId: string
  restaurantId: string
  includeInactive?: boolean
}
