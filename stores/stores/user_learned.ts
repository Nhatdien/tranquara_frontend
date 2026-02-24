import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import type { LocalLearnedSlideGroup } from "~/types/user_journal";
import SQLiteService from "~/services/sqlite/sqlite_service";
import LearnedRepository from "~/services/sqlite/learned_repository";
import { useAuthStore } from "./auth_store";

// Helper function to get current user ID from auth store
const getUserId = (): string | undefined => {
  const authStore = useAuthStore();
  return authStore.getUserUUID || undefined;
};

export const useLearnedStore = defineStore("user_learned", {
  state: () => ({
    /** All completed slide groups for the current user (keyed by collection_id) */
    completedByCollection: {} as Record<string, LocalLearnedSlideGroup[]>,
    /** Flat list of all completed slide groups */
    allCompleted: [] as LocalLearnedSlideGroup[],
    isLoading: false,
    isOnline: false,
  }),

  getters: {
    /**
     * Get completed slide group IDs for a given collection
     */
    getCompletedIds: (state) => {
      return (collectionId: string): string[] => {
        const records = state.completedByCollection[collectionId] || [];
        return records.map(r => r.slide_group_id);
      };
    },

    /**
     * Get completion count for a collection
     */
    getCompletedCount: (state) => {
      return (collectionId: string): number => {
        return (state.completedByCollection[collectionId] || []).length;
      };
    },

    /**
     * Check if a specific slide group is completed
     */
    isSlideGroupCompleted: (state) => {
      return (collectionId: string, slideGroupId: string): boolean => {
        const records = state.completedByCollection[collectionId] || [];
        return records.some(r => r.slide_group_id === slideGroupId);
      };
    },

    /**
     * Calculate progress percentage for a collection
     */
    getProgress: (state) => {
      return (collectionId: string, totalSlideGroups: number): number => {
        if (totalSlideGroups === 0) return 0;
        const completed = (state.completedByCollection[collectionId] || []).length;
        return Math.round((completed / totalSlideGroups) * 100);
      };
    },
  },

  actions: {
    /**
     * Load all completed slide groups for the current user from local SQLite
     */
    async loadFromLocal() {
      const userId = getUserId();
      if (!userId) return;

      try {
        if (!SQLiteService.isReady()) {
          console.log('[LearnedStore] Database not ready');
          return;
        }

        const all = await LearnedRepository.getAllByUser(userId);
        this.allCompleted = all;

        // Group by collection_id
        const grouped: Record<string, LocalLearnedSlideGroup[]> = {};
        for (const record of all) {
          if (!grouped[record.collection_id]) {
            grouped[record.collection_id] = [];
          }
          grouped[record.collection_id].push(record);
        }
        this.completedByCollection = grouped;

        console.log(`[LearnedStore] Loaded ${all.length} completed slide groups from local`);
      } catch (error) {
        console.error('[LearnedStore] Error loading from local:', error);
      }
    },

    /**
     * Mark a slide group as completed (offline-first)
     */
    async markCompleted(collectionId: string, slideGroupId: string): Promise<boolean> {
      const userId = getUserId();
      if (!userId) return false;

      try {
        // 1. Save locally first
        const record = await LearnedRepository.markCompleted(userId, collectionId, slideGroupId);

        // 2. Update store state
        if (!this.completedByCollection[collectionId]) {
          this.completedByCollection[collectionId] = [];
        }
        // Avoid duplicates in state
        const exists = this.completedByCollection[collectionId].some(
          r => r.slide_group_id === slideGroupId
        );
        if (!exists) {
          this.completedByCollection[collectionId].push(record);
          this.allCompleted.push(record);
        }

        // 3. Sync to server if online
        if (this.isOnline) {
          try {
            const response = await TranquaraSDK.getInstance().createLearned({
              collection_id: collectionId,
              slide_group_id: slideGroupId,
            });
            // Mark as synced locally
            await LearnedRepository.markAsSynced(record.id, response.learned.id);
            console.log('[LearnedStore] Synced completion to server');
          } catch (error) {
            console.warn('[LearnedStore] Failed to sync to server - will retry later:', error);
          }
        }

        return true;
      } catch (error) {
        console.error('[LearnedStore] Error marking completed:', error);
        return false;
      }
    },

    /**
     * Sync all pending completions to server
     */
    async syncPendingToServer() {
      const userId = getUserId();
      if (!userId || !this.isOnline) return;

      try {
        const pending = await LearnedRepository.getPendingSync(userId);
        if (pending.length === 0) return;

        console.log(`[LearnedStore] Syncing ${pending.length} pending completions`);

        for (const record of pending) {
          try {
            const response = await TranquaraSDK.getInstance().createLearned({
              collection_id: record.collection_id,
              slide_group_id: record.slide_group_id,
            });
            await LearnedRepository.markAsSynced(record.id, response.learned.id);
          } catch (error) {
            console.warn(`[LearnedStore] Failed to sync record ${record.id}:`, error);
          }
        }
      } catch (error) {
        console.error('[LearnedStore] Error syncing pending:', error);
      }
    },

    /**
     * Pull latest completions from server and merge with local
     */
    async syncFromServer() {
      const userId = getUserId();
      if (!userId || !this.isOnline) return;

      try {
        const response = await TranquaraSDK.getInstance().getAllLearned();
        const serverRecords = response.learned || [];

        if (serverRecords.length > 0) {
          await LearnedRepository.syncFromServer(serverRecords, userId);
          // Reload local state
          await this.loadFromLocal();
        }

        console.log(`[LearnedStore] Synced ${serverRecords.length} records from server`);
      } catch (error) {
        console.error('[LearnedStore] Error syncing from server:', error);
      }
    },

    /**
     * Full sync: push pending then pull from server
     */
    async fullSync() {
      await this.syncPendingToServer();
      await this.syncFromServer();
    },

    /**
     * Set online status
     */
    setOnline(online: boolean) {
      this.isOnline = online;
    },
  },
});
