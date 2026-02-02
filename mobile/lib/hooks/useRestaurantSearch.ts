import { useState, useEffect, useCallback } from 'react';
import { restaurantsApi } from '@/lib/api';
import { Restaurant, RestaurantFilterParams } from '@/types';
import { useSearchStore } from '@/lib/stores';

/**
 * Hook for searching restaurants with debounce
 */
export function useRestaurantSearch(debounceMs: number = 300) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  
  const { query, setQuery, filters, addToHistory } = useSearchStore();
  const limit = 20;

  const search = useCallback(
    async (searchQuery: string, reset = true) => {
      if (!searchQuery?.trim()) {
        setRestaurants([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      const currentPage = reset ? 0 : page;
      if (reset) {
        setPage(0);
      }

      try {
        const params: RestaurantFilterParams = {
          query: searchQuery,
          limit,
          offset: currentPage * limit,
          foodTypes: filters.foodTypes,
          minRating: filters.minRating,
          sortBy: filters.sortBy as RestaurantFilterParams['sortBy'],
          radius: filters.radius,
        };

        const response = await restaurantsApi.search(params);
        
        if (response.success && response.data) {
          if (reset) {
            setRestaurants(response.data);
          } else {
            setRestaurants((prev) => [...prev, ...response.data!]);
          }
          setHasMore(response.data.length === limit);
          
          // Add to search history if query search
          if (searchQuery?.trim() && reset) {
            await addToHistory(searchQuery);
          }
        } else {
          setError(response.error?.message || 'Search failed');
          if (reset) {
            setRestaurants([]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        if (reset) {
          setRestaurants([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [addToHistory, filters, page]
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && query) {
      setPage((p) => p + 1);
      search(query, false);
    }
  }, [isLoading, hasMore, query, search]);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setRestaurants([]);
      return;
    }

    const timer = setTimeout(() => {
      search(query, true);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return {
    restaurants,
    isLoading,
    error,
    hasMore,
    search,
    loadMore,
    clearResults: () => setRestaurants([]),
  };
}
