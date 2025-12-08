/**
 * Secure Storage Utility
 * 
 * Uses Capacitor Secure Storage Plugin for sensitive data (tokens, passwords, etc.)
 * - iOS: Stores in Keychain (encrypted by system)
 * - Android: Stores in Keystore (encrypted by system)
 * - Web: Falls back to localStorage with encryption (less secure)
 * 
 * ⚠️ ONLY use this for sensitive data. For regular data, use storage.ts
 */

import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export const secureStorage = {
  /**
   * Store a token or sensitive string
   */
  async setToken(key: string, value: string): Promise<void> {
    try {
      await SecureStoragePlugin.set({ key, value });
    } catch (error) {
      console.error(`Failed to store secure token ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get a token or sensitive string
   * Returns null if not found or error occurs
   */
  async getToken(key: string): Promise<string | null> {
    try {
      const { value } = await SecureStoragePlugin.get({ key });
      return value;
    } catch (error) {
      // Key doesn't exist or other error
      return null;
    }
  },

  /**
   * Remove a specific token
   */
  async removeToken(key: string): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch (error) {
      console.error(`Failed to remove secure token ${key}:`, error);
      // Don't throw - key might not exist
    }
  },

  /**
   * Clear all secure storage
   * ⚠️ Use with caution - removes ALL secure data
   */
  async clearAll(): Promise<void> {
    try {
      await SecureStoragePlugin.clear();
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
      throw error;
    }
  },

  /**
   * Get all keys in secure storage
   */
  async keys(): Promise<string[]> {
    try {
      const { value } = await SecureStoragePlugin.keys();
      return value;
    } catch (error) {
      console.error('Failed to get secure storage keys:', error);
      return [];
    }
  },
};
