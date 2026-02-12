import { useState, useEffect, useCallback } from 'react';
import { restaurantsApi } from '@/lib/api/endpoints/restaurants';
import { reviewsApi } from '@/lib/api/endpoints/reviews';
import type { Restaurant, Review } from '@/types';

interface UseHomeDataReturn {
    topRestaurants: Restaurant[];
    recentReviews: Review[];
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * Hook that manages all data fetching for the Home screen.
 * Fetches top-rated restaurants and recent reviews in parallel.
 */
export function useHomeData(): UseHomeDataReturn {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [topRestaurants, setTopRestaurants] = useState<Restaurant[]>([]);
    const [recentReviews, setRecentReviews] = useState<Review[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const [restaurantsRes, reviewsRes] = await Promise.all([
                restaurantsApi.getTop(10),
                reviewsApi.getRecent(10),
            ]);

            if (restaurantsRes.data) {
                setTopRestaurants(restaurantsRes.data);
            }

            if (reviewsRes.data) {
                setRecentReviews(reviewsRes.data);
            }
        } catch (err) {
            setError('Error al cargar datos. Desliza para actualizar.');
            console.error('Error fetching home data:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refresh = useCallback(() => {
        setIsRefreshing(true);
        fetchData();
    }, [fetchData]);

    return {
        topRestaurants,
        recentReviews,
        isLoading,
        isRefreshing,
        error,
        refresh,
    };
}
