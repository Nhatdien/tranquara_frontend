import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import type { UserStreak } from "~/types/user_streak";

export const useUserStreakStore = defineStore("user_streak", {
  state: () => ({
    streak: null as UserStreak | null,
    isLoading: false,
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
     * Fetch the current user's streak data from the server
     */
    async fetchStreak() {
      this.isLoading = true;
      this.error = null;
      try {
        const sdk = TranquaraSDK.getInstance();
        const response = await sdk.getUserStreak();
        this.streak = response.user_streak;
      } catch (err: any) {
        this.error = err.message;
        console.error("[StreakStore] Error fetching streak:", err);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Refresh streak data after a journal entry is created.
     * Called by the journal store after successful creation.
     */
    async refreshAfterJournaling() {
      await this.fetchStreak();
    },

    /**
     * Reset store state (e.g., on logout)
     */
    resetState() {
      this.streak = null;
      this.isLoading = false;
      this.error = null;
    },
  },
});
