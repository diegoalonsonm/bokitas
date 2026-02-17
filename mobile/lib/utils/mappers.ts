/**
 * Map backend Spanish fields to English for internal use
 * This helps maintain consistency in the app while working with the Spanish backend
 */

import { User, Restaurant, Review } from '@/types';

// ============================================================================
// Raw API Types (Spanish backend fields)
// ============================================================================

export interface RawUser {
  id: string;
  correo: string;
  nombre: string;
  primerapellido: string;
  segundoapellido?: string | null;
  username?: string | null;
  urlfotoperfil?: string | null;
  createdat: string;
  idestado: string;
  active: boolean;
}

export interface RawRestaurant {
  id: string;
  nombre: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  urlfotoperfil: string | null;
  urlpaginarestaurante: string | null;
  puntuacion: number;
  reviewcount?: number;
  foursquareid: string | null;
  createdat: string;
  updatedat: string;
  active: boolean;
  tiposcomida?: Array<{ id: string; nombre: string }>;
}

export interface RawReview {
  id: string;
  comentario: string | null;
  puntuacion: number;
  urlfotoreview: string | null;
  idrestaurante: string;
  idusuario: string;
  createdat: string;
  updatedat: string;
  active: boolean;
  usuario?: {
    id: string;
    nombre: string;
    primerapellido: string;
    urlfotoperfil: string | null;
  };
  restaurante?: {
    id: string;
    nombre: string;
    urlfotoperfil: string | null;
    direccion?: string | null;
  };
}

// ============================================================================
// Mapping Functions
// ============================================================================

/**
 * Map raw user data from API to internal User type
 */
export function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    email: raw.correo,
    name: `${raw.nombre} ${raw.primerapellido}`.trim(),
    firstName: raw.nombre,
    lastName: raw.primerapellido,
    secondLastName: raw.segundoapellido || null,
    username: raw.username || null,
    photoUrl: raw.urlfotoperfil || null,
    createdAt: raw.createdat,
    statusId: raw.idestado,
    active: raw.active,
  };
}

/**
 * Map raw restaurant data from API to internal Restaurant type
 */
export function mapRestaurant(raw: RawRestaurant): Restaurant {
  return {
    id: raw.id,
    name: raw.nombre,
    address: raw.direccion,
    latitude: raw.latitud,
    longitude: raw.longitud,
    photoUrl: raw.urlfotoperfil,
    websiteUrl: raw.urlpaginarestaurante,
    averageRating: raw.puntuacion || 0,
    reviewCount: raw.reviewcount || 0,
    foursquareId: raw.foursquareid,
    createdAt: raw.createdat,
    updatedAt: raw.updatedat,
    active: raw.active,
    foodTypes: raw.tiposcomida?.map((t) => ({ id: t.id, name: t.nombre })) || [],
  };
}

/**
 * Map raw review data from API to internal Review type
 */
export function mapReview(raw: RawReview): Review {
  return {
    id: raw.id,
    comment: raw.comentario,
    rating: raw.puntuacion,
    photoUrl: raw.urlfotoreview,
    restaurantId: raw.idrestaurante,
    userId: raw.idusuario,
    createdAt: raw.createdat,
    updatedAt: raw.updatedat,
    active: raw.active,
    user: raw.usuario
      ? {
          id: raw.usuario.id,
          name: `${raw.usuario.nombre} ${raw.usuario.primerapellido}`.trim(),
          photoUrl: raw.usuario.urlfotoperfil,
        }
      : undefined,
    restaurant: raw.restaurante
      ? {
          id: raw.restaurante.id,
          name: raw.restaurante.nombre,
          photoUrl: raw.restaurante.urlfotoperfil,
        }
      : undefined,
  };
}

/**
 * Map array of raw users
 */
export function mapUsers(rawUsers: RawUser[]): User[] {
  return rawUsers.map(mapUser);
}

/**
 * Map array of raw restaurants
 */
export function mapRestaurants(rawRestaurants: RawRestaurant[]): Restaurant[] {
  return rawRestaurants.map(mapRestaurant);
}

/**
 * Map array of raw reviews
 */
export function mapReviews(rawReviews: RawReview[]): Review[] {
  return rawReviews.map(mapReview);
}
