/**
 * Review Entity Types
 */

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

export interface ReviewFilterParams {
    limit?: number;
    offset?: number;
}
