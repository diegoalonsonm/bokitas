import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

interface SearchFilters {
  foodTypes: string[];
  minRating?: number;
  sortBy: string;
  radius?: number;
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  searchHistory: string[];
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  addToHistory: (query: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

const defaultFilters: SearchFilters = {
  foodTypes: [],
  minRating: undefined,
  sortBy: 'relevance',
  radius: undefined,
};

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  filters: { ...defaultFilters },
  searchHistory: [],

  setQuery: (query) => set({ query }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  clearFilters: () => set({ filters: { ...defaultFilters } }),

  addToHistory: async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const { searchHistory } = get();
    const filtered = searchHistory.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    set({ searchHistory: updated });
    
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  },

  loadHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        set({ searchHistory: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  },

  clearHistory: async () => {
    set({ searchHistory: [] });
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  },
}));
