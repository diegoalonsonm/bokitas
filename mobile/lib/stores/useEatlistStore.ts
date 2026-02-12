import { create } from 'zustand';
import { EatlistEntry } from '@/types';
import { eatlistApi } from '@/lib/api/endpoints/eatlist';

interface EatlistState {
  entries: EatlistEntry[];
  isLoading: boolean;
  error: string | null;

  // Computed
  wantToVisit: EatlistEntry[];
  visited: EatlistEntry[];

  // Actions
  fetchEatlist: () => Promise<void>;
  addToEatlist: (restaurantId: string, visited?: boolean) => Promise<void>;
  removeFromEatlist: (restaurantId: string) => Promise<void>;
  updateFlag: (restaurantId: string, visited: boolean) => Promise<void>;
  isInEatlist: (restaurantId: string) => boolean;
  clearEatlist: () => void;
}

export const useEatlistStore = create<EatlistState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  // Computed getters
  get wantToVisit() {
    return get().entries.filter((e) => !e.hasBeenFlag);
  },
  get visited() {
    return get().entries.filter((e) => e.hasBeenFlag);
  },

  fetchEatlist: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await eatlistApi.getAll();
      if (response.success && response.data) {
        set({ entries: response.data, isLoading: false });
      } else {
        set({ error: response.error?.message || 'Failed to fetch eatlist', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch eatlist', isLoading: false });
    }
  },

  addToEatlist: async (restaurantId: string, visited = false) => {
    try {
      const response = await eatlistApi.add(restaurantId, visited);
      if (response.success) {
        await get().fetchEatlist(); // Refresh the list
      } else {
        throw new Error(response.error?.message || 'Failed to add to eatlist');
      }
    } catch (error) {
      throw error;
    }
  },

  removeFromEatlist: async (restaurantId: string) => {
    // Optimistic update
    const previousEntries = get().entries;
    set((state) => ({
      entries: state.entries.filter((e) => e.restaurantId !== restaurantId),
    }));

    try {
      const response = await eatlistApi.remove(restaurantId);
      if (!response.success) {
        // Rollback
        set({ entries: previousEntries });
        throw new Error(response.error?.message || 'Failed to remove from eatlist');
      }
    } catch (error) {
      set({ entries: previousEntries });
      throw error;
    }
  },

  updateFlag: async (restaurantId: string, visited: boolean) => {
    // Optimistic update
    const previousEntries = get().entries;
    set((state) => ({
      entries: state.entries.map((e) =>
        e.restaurantId === restaurantId ? { ...e, hasBeenFlag: visited } : e
      ),
    }));

    try {
      const response = await eatlistApi.updateFlag(restaurantId, visited);
      if (!response.success) {
        // Rollback
        set({ entries: previousEntries });
        throw new Error(response.error?.message || 'Failed to update');
      }
    } catch (error) {
      set({ entries: previousEntries });
      throw error;
    }
  },

  isInEatlist: (restaurantId: string) => {
    return get().entries.some((e) => e.restaurantId === restaurantId);
  },

  clearEatlist: () => {
    set({ entries: [], error: null });
  },
}));
