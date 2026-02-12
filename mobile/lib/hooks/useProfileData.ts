import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/lib/api/endpoints/users';
import { useEatlistStore } from '@/lib/stores/useEatlistStore';
import type { Review, Restaurant } from '@/types';

interface UseProfileDataReturn {
    reviews: Review[];
    top4: Restaurant[];
    reviewCount: number;
    savedCount: number;
    isLoading: boolean;
    isRefreshing: boolean;
    refresh: () => void;
}

/**
 * Hook that manages all data fetching for the Profile screen.
 * Fetches user reviews, top 4 restaurants, and eatlist data in parallel.
 */
export function useProfileData(userId: string | undefined): UseProfileDataReturn {
    const { entries: eatlistEntries, fetchEatlist } = useEatlistStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [top4, setTop4] = useState<Restaurant[]>([]);
    const [reviewCount, setReviewCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Compute "Por visitar" count from store for real-time sync with EatList tab
    const savedCount = eatlistEntries.filter((e) => !e.hasBeenFlag).length;

    const fetchUserData = useCallback(async () => {
        if (!userId) return;

        try {
            const [reviewsRes, top4Res] = await Promise.all([
                usersApi.getReviews(userId, { limit: 5 }),
                usersApi.getTop4(userId),
                fetchEatlist(), // Use store's fetch for eatlist
            ]);

            if (reviewsRes.data) {
                setReviews(reviewsRes.data);
                setReviewCount(reviewsRes.meta?.total || reviewsRes.data.length);
            }
            if (top4Res.data) {
                setTop4(top4Res.data);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [userId, fetchEatlist]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const refresh = useCallback(() => {
        setIsRefreshing(true);
        fetchUserData();
    }, [fetchUserData]);

    return {
        reviews,
        top4,
        reviewCount,
        savedCount,
        isLoading,
        isRefreshing,
        refresh,
    };
}
