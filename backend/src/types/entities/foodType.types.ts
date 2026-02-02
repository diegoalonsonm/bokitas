// FoodType entity types

export interface FoodType {
  id: string
  nombre: string
  idestado: string | null
  active: boolean
  createdat: string
  updatedat: string
}

export interface CreateFoodTypeParams {
  nombre: string
}

export interface GetAllFoodTypesParams {
  activeOnly?: boolean
}
