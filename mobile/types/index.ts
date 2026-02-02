/**
 * Bokitas Type Definitions
 * 
 * Note: These types use English field names for the UI layer.
 * The API layer handles mapping from Spanish backend field names.
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  secondLastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  statusId: string;
  active: boolean;
}

/**
 * Public user profile (visible to other users)
 */
export interface UserPublic {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

// ============================================================================
// Restaurant Types
// ============================================================================

export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  photos?: string[];
  photoUrl: string | null;
  websiteUrl: string | null;
  averageRating: number;
  reviewCount?: number;
  foursquareId: string | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  foodTypes?: FoodType[];
}

// ============================================================================
// Review Types
// ============================================================================

export interface Review {
  id: string;
  comment: string | null;
  rating: number;
  photos?: string[];
  photoUrl: string | null;
  restaurantId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  // Relations (populated on some endpoints)
  user?: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
  restaurant?: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
}

/**
 * Review with restaurant details populated
 */
export interface ReviewWithRestaurant extends Review {
  restaurant: {
    id: string;
    name: string;
    photoUrl: string | null;
    address?: string | null;
  };
}

// ============================================================================
// Eatlist Types
// ============================================================================

export interface EatlistEntry {
  id: string;
  userId: string;
  restaurantId: string;
  hasBeenFlag: boolean; // true = visited, false = want to visit
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations (populated on some endpoints)
  restaurant?: Restaurant;
}

/**
 * Eatlist entry with full restaurant details
 */
export interface EatlistEntryWithRestaurant extends EatlistEntry {
  restaurant: Restaurant;
}

// ============================================================================
// Food Type
// ============================================================================

export interface FoodType {
  id: string;
  name: string;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  primerapellido: string;
}

// ============================================================================
// API Filter Params
// ============================================================================

export interface RestaurantFilterParams {
  limit?: number;
  offset?: number;
  query?: string;
  foodTypes?: string[];
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: 'relevance' | 'rating' | 'recent' | 'reviews';
}

export interface ReviewFilterParams {
  limit?: number;
  offset?: number;
}

// ============================================================================
// Status Constants
// ============================================================================

export const STATUS_IDS = {
  ACTIVO: '9aca8808-a7a2-4d43-8be8-d341655caa3e',
  BLOQUEADO: 'fdec242e-0080-42d9-8307-98a72982d9ae',
  ELIMINADO: 'dbed121f-7214-41be-ad06-c12c7ae0d7de',
  INACTIVO: '31d61dcd-cb50-47f2-a0c2-d494ec358fd4',
  PENDIENTE: '05e31c9e-093c-406a-bf6a-ec457f143e9c',
} as const;
