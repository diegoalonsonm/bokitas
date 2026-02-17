/**
 * Bokitas Type Definitions — Re-export Hub
 *
 * All domain types are split into dedicated files.
 * Import from '@/types' for convenience, or directly
 * from the domain file for explicit provenance.
 */

// Entity types
export type { User, UserPublic } from './entities/user.types';
export type { Restaurant, RestaurantFilterParams } from './entities/restaurant.types';
export type { Review, ReviewWithRestaurant, ReviewFilterParams } from './entities/review.types';
export type { EatlistEntry, EatlistEntryWithRestaurant } from './entities/eatlist.types';
export type { FoodType } from './entities/food-type.types';

// Auth types
export type { AuthTokens, LoginResponse, RegisterData } from './auth.types';

// Constants
export { STATUS_IDS } from './constants';
