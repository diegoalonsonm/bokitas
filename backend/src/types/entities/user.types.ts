// User entity types

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  urlFotoPerfil?: string | null
  createdat?: Date
  idestado: string
  active: boolean
}

export interface CreateUserParams {
  email: string
  nombre: string
  apellido: string
  authId: string
}

export interface UpdateUserParams {
  id: string
  nombre?: string
  apellido?: string
  urlFotoPerfil?: string
  idestado?: string
}

export interface GetUserParams {
  id: string
}

export interface GetUserByEmailParams {
  email: string
}

export interface DeleteUserParams {
  id: string
}
