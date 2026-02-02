// Eatlist entity types

export interface Eatlist {
  idusuario: string
  idrestaurante: string
  flag: boolean           // true = visited, false = want to visit
  active: boolean
  createdat: string
  updatedat: string
}

export interface EatlistWithRestaurant extends Eatlist {
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
