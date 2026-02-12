/**
 * Restaurant Entity Types
 */

import type { FoodType } from './food-type.types';

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
