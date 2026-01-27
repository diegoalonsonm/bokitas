// Review entity types

export interface Review {
  id: string
  comentario: string | null
  puntuacion: number
  urlfotoreview: string | null
  idrestaurante: string
  idusuario: string
  idestado: string | null
  active: boolean
  createdat: string
  updatedat: string
}

export interface ReviewWithUser extends Review {
  usuario: {
    id: string
    nombre: string
    primerapellido: string
    urlfotoperfil: string | null
  }
}

export interface ReviewWithRestaurant extends Review {
  restaurante: {
    id: string
    nombre: string
    urlfotoperfil: string | null
  }
}

export interface CreateReviewParams {
  restaurantId: string
  userId: string
  puntuacion: number
  comentario?: string | null
}

export interface UpdateReviewParams {
  id: string
  userId: string
  puntuacion?: number
  comentario?: string | null
}

export interface DeleteReviewParams {
  id: string
  userId: string
}

export interface GetReviewParams {
  id: string
}

export interface UploadReviewPhotoParams {
  id: string
  userId: string
  photoUrl: string
}
