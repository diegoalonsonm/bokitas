// User entity types

export interface User {
  id: string
  email: string
  nombre: string
  primerapellido: string
  segundoapellido?: string | null
  urlFotoPerfil?: string | null
  createdat?: Date
  idestado: string
  active: boolean
}

export interface CreateUserParams {
  email: string
  nombre: string
  primerapellido: string
  segundoapellido?: string | null
  authId: string
}

export interface UpdateUserParams {
  id: string
  nombre?: string
  primerapellido?: string
  segundoapellido?: string | null
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
