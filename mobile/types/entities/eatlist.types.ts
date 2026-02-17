/**
 * Eatlist Entity Types
 */

import type { Restaurant } from './restaurant.types';

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
