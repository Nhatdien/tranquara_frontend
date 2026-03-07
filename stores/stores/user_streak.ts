import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import type { UserStreak } from "~/types/user_streak";
import { storage } from "~/utils/storage";
import JournalsRepository from "~/services/sqlite/journals_repository";
import SQLiteService from "~/services/sqlite/sqlite_service";
import NetworkMonitor from "~/services/sync/network_monitor";
import { useAuthStore } from "./auth_store";

const STREAK_CACHE_KEY = "streak_data";

// Helper to get current user ID
const getUserId = (): string | undefined => {
  const authStore = useAuthStore();
  return authStore.getUserUUID || undefined;
};

export const useUserStreakStore = defineStore("user_streak", {
  state: () => ({
    streak: null as UserStreak | null,
    isLoading: false,
    isOnline: false,
    error: null as string | null,
  }),

  getters: {
    currentStreak: (state): number => state.streak?.current_streak ?? 0,
    longestStreak: (state): number => state.streak?.longest_streak ?? 0,
    totalEntries: (state): number => state.streak?.total_entries ?? 0,
    lastActive: (state): string | null => state.streak?.last_active ?? null,

    /**
     * Whether the streak is still active (last active was today or yesterday)
     */
    isStreakActive: (state): boolean => {
      if (!state.streak?.last_active) return false;
      const lastActive = new Date(state.streak.last_active);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 1;
    },

    /**
     * Whether the user has already journaled today
     */
    hasJournaledToday: (state): boolean => {
      if (!state.streak?.last_active) return false;
      const lastActive = new Date(state.streak.last_active);
      const today = new Date();
      return (
        lastActive.getFullYear() === today.getFullYear() &&
        lastActive.getMonth() === today.getMonth() &&
        lastActive.getDate() === today.getDate()
      );
    },
  },

  actions: {
    /**
     * Fetch streak data (offline-first)
     *
     * Strategy:
     * 1. Load cached streak from Preferences immediately
     * 2. If online, fetch from server and update cache
     * 3. If offline, compute from local SQLite journals as fallback
     */
    async fetchStreak() {
      this.isLoading = true;
      this.error = null;
      this.isOnline = NetworkMonitor.isConnected();

      try {
        // Step 1: Load from local cache immediately (instant response)
        await this.loadFromCache();

        // Step 2: If online, fetch fresh data from server
        if (this.isOnline) {
          try {
            const sdk = TranquaraSDK.getInstance();
            const response = await sdk.getUserStreak();
            this.streak = response.user_streak;
            // Persist to cache for offline use
            await this.saveToCache();
            console.log("[StreakStore] Streak fetched from server and cached");
          } catch (err: any) {
            console.warn("[StreakStore] Server fetch failed, using cached/local data:", err.message);
            // If server fails but we have no cache, compute locally
            if (!this.streak) {
              await this.computeFromLocal();
            }
          }
        } else {
          // Step 3: If offline and no cache, compute from local journals
          if (!this.streak) {
            await this.computeFromLocal();
          }
          console.log("[StreakStore] Offline - using cached/computed streak data");
        }
      } catch (err: any) {
        this.error = err.message;
        console.error("[StreakStore] Error fetching streak:", err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Load streak data from Preferences cache
     */
    async loadFromCache() {
      try {
        const cached = await storage.get<UserStreak>(STREAK_CACHE_KEY);
        if (cached) {
          this.streak = cached;
          console.log("[StreakStore] Loaded streak from cache");
        }
      } catch (error) {
        console.warn("[StreakStore] Error loading from cache:", error);
      }
    },

    /**
     * Save current streak data to Preferences cache
     */
    async saveToCache() {
      try {
        if (this.streak) {
          await storage.set(STREAK_CACHE_KEY, this.streak);
        }
      } catch (error) {
        console.warn("[StreakStore] Error saving to cache:", error);
      }
    },

    /**
     * Compute streak data locally from SQLite journal entries.
     * Used as fallback when offline and no cached server data available.
     */
    async computeFromLocal() {
      try {
        const userId = getUserId();
        if (!userId || !SQLiteService.isReady()) {
          console.log("[StreakStore] Cannot compute locally - no user or DB not ready");
          return;
        }

        // Get all journals sorted by created_at DESC
        const journals = await JournalsRepository.getAllByUserId(userId, 1000, 0);
        if (journals.length === 0) {
          this.streak = {
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_active: new Date().toISOString(),
            total_entries: 0,
            updated_at: new Date().toISOString(),
          };
          return;
        }

        // Extract unique dates (normalized to YYYY-MM-DD)
        const uniqueDates = new Set<string>();
        for (const journal of journals) {
          const date = new Date(journal.created_at);
          uniqueDates.add(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          );
        }

        // Sort dates descending
        const sortedDates = Array.from(uniqueDates).sort().reverse();

        // Compute current streak (consecutive days from today/yesterday)
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
          const entryDate = new Date(sortedDates[i]);
          entryDate.setHours(0, 0, 0, 0);

          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);
          expectedDate.setHours(0, 0, 0, 0);

          // Allow today or yesterday as the first entry
          if (i === 0) {
            const diffDays = Math.floor(
              (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays > 1) break; // Streak is broken
            currentStreak = 1;

            // Adjust expected date for subsequent entries
            expectedDate.setTime(entryDate.getTime());
            continue;
          }

          const prevDate = new Date(sortedDates[i - 1]);
          prevDate.setHours(0, 0, 0, 0);
          const diff = Math.floor(
            (prevDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Compute longest streak
        let longestStreak = 0;
        let tempStreak = 1;
        const sortedAsc = [...sortedDates].sort();

        for (let i = 1; i < sortedAsc.length; i++) {
          const prev = new Date(sortedAsc[i - 1]);
          const curr = new Date(sortedAsc[i]);
          prev.setHours(0, 0, 0, 0);
          curr.setHours(0, 0, 0, 0);

          const diff = Math.floor(
            (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        this.streak = {
          user_id: userId,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_active: sortedDates[0] || new Date().toISOString(),
          total_entries: journals.length,
          updated_at: new Date().toISOString(),
        };

        // Cache the computed result
        await this.saveToCache();
        console.log("[StreakStore] Computed streak from local journals:", this.streak);
      } catch (error) {
        console.error("[StreakStore] Error computing local streak:", error);
      }
    },

    /**
     * Refresh streak data after a journal entry is created.
     * Called by the journal store after successful creation.
     *
     * Offline-first: If offline, recompute from local data.
     * If online, fetch fresh data from server.
     */
    async refreshAfterJournaling() {
      this.isOnline = NetworkMonitor.isConnected();

      if (this.isOnline) {
        try {
          const sdk = TranquaraSDK.getInstance();
          const response = await sdk.getUserStreak();
          this.streak = response.user_streak;
          await this.saveToCache();
        } catch (err) {
          console.warn("[StreakStore] Server refresh failed, computing locally");
          await this.computeFromLocal();
        }
      } else {
        // Offline: recompute from local journals
        await this.computeFromLocal();
      }
    },

    /**
     * Reset store state (e.g., on logout)
     */
    async resetState() {
      this.streak = null;
      this.isLoading = false;
      this.error = null;
      try {
        await storage.remove(STREAK_CACHE_KEY);
      } catch (error) {
        console.warn("[StreakStore] Error clearing cache:", error);
      }
    },
  },
});
