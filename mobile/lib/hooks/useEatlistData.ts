import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEatlistStore } from '@/lib/stores/useEatlistStore';
import type { EatlistEntry } from '@/types';

export type EatlistFilter = 'all' | 'visited' | 'wishlist';

interface FilterCounts {
    all: number;
    visited: number;
    wishlist: number;
}

interface UseEatlistDataReturn {
    entries: EatlistEntry[];
    filteredEntries: EatlistEntry[];
    filter: EatlistFilter;
    filterCounts: FilterCounts;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    setFilter: (filter: EatlistFilter) => void;
    refresh: () => Promise<void>;
    toggleVisited: (entry: EatlistEntry) => Promise<void>;
    remove: (restaurantId: string) => Promise<void>;
}

/**
 * Hook that manages eatlist data, filtering, tab switching, and entry actions.
 * Wraps the eatlist store and adds filter/refresh UI state.
 */
export function useEatlistData(hasUser: boolean): UseEatlistDataReturn {
    const {
        entries,
        isLoading,
        error,
        fetchEatlist,
        updateFlag,
        removeFromEatlist,
    } = useEatlistStore();

    const [filter, setFilter] = useState<EatlistFilter>('wishlist');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (hasUser) {
            fetchEatlist();
        }
    }, [hasUser, fetchEatlist]);

    const filteredEntries = useMemo(() => {
        return entries.filter((entry) => {
            if (filter === 'visited') return entry.hasBeenFlag;
            if (filter === 'wishlist') return !entry.hasBeenFlag;
            return true;
        });
    }, [entries, filter]);

    const filterCounts = useMemo((): FilterCounts => ({
        all: entries.length,
        visited: entries.filter((e) => e.hasBeenFlag).length,
        wishlist: entries.filter((e) => !e.hasBeenFlag).length,
    }), [entries]);

    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchEatlist();
        setIsRefreshing(false);
    }, [fetchEatlist]);

    const toggleVisited = useCallback(async (entry: EatlistEntry) => {
        await updateFlag(entry.restaurantId, !entry.hasBeenFlag);
    }, [updateFlag]);

    const remove = useCallback(async (restaurantId: string) => {
        await removeFromEatlist(restaurantId);
    }, [removeFromEatlist]);

    return {
        entries,
        filteredEntries,
        filter,
        filterCounts,
        isLoading,
        isRefreshing,
        error,
        setFilter,
        refresh,
        toggleVisited,
        remove,
    };
}
