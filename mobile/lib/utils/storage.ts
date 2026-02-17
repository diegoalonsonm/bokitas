import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wrapper with JSON serialization
 */
export const storage = {
  /**
   * Get item from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading from storage [${key}]:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage [${key}]:`, error);
    }
  },

  /**
   * Remove item from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage [${key}]:`, error);
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  /**
   * Get all keys in storage
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};

/**
 * Cache storage with TTL support
 */
export const cache = {
  /**
   * Get cached item (returns null if expired)
   */
  async get<T>(key: string): Promise<T | null> {
    const cached = await storage.get<{ data: T; expiresAt: number }>(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      await storage.remove(key);
      return null;
    }
    
    return cached.data;
  },

  /**
   * Set cached item with TTL (in milliseconds)
   */
  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    await storage.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  },

  /**
   * Remove cached item
   */
  async remove(key: string): Promise<void> {
    await storage.remove(key);
  },
};
