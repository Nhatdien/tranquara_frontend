/**
 * Simple Storage Utility
 * 
 * Uses Capacitor Preferences for non-sensitive data (settings, preferences, cache)
 * For sensitive data (tokens, passwords), use secure-storage.ts instead
 */

import { Preferences } from '@capacitor/preferences';

export const storage = {
  /**
   * Store a value (automatically serializes to JSON)
   */
  async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  },

  /**
   * Get a value (automatically parses from JSON)
   */
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  },

  /**
   * Remove a specific key
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  },

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  },
};
