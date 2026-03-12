import { defineStore } from "pinia";
import TranquaraSDK from "~/stores/tranquara_sdk";
import type { AIMemory } from "~/stores/ai_memories";
import MemoriesRepository from "~/services/sqlite/memories_repository";
import SQLiteService from "~/services/sqlite/sqlite_service";
import NetworkMonitor from "~/services/sync/network_monitor";
import { useAuthStore } from "./auth_store";

// Helper function to get current user ID from auth store
const getUserId = (): string | undefined => {
  const authStore = useAuthStore();
  return authStore.getUserUUID || undefined;
};

interface MemoriesState {
  memories: AIMemory[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

export const useMemoriesStore = defineStore("memories_store", {
  state: (): MemoriesState => ({
    memories: [],
    loading: false,
    error: null,
    isOnline: false,
  }),

  getters: {
    /** Group memories by category */
    memoriesByCategory(): Record<string, AIMemory[]> {
      const grouped: Record<string, AIMemory[]> = {};
      for (const memory of this.memories) {
        if (!grouped[memory.category]) {
          grouped[memory.category] = [];
        }
        grouped[memory.category].push(memory);
      }
      return grouped;
    },

    /** Get unique categories present */
    categories(): string[] {
      return Object.keys(this.memoriesByCategory);
    },

    /** Total number of memories */
    totalMemories(): number {
      return this.memories.length;
    },

    /** Check if there are any memories */
    hasMemories(): boolean {
      return this.memories.length > 0;
    },
  },

  actions: {
    /**
     * Fetch memories (offline-first)
     * 
     * Strategy:
     * 1. Load from local SQLite cache immediately (works offline)
     * 2. If online, refresh from server and update cache
     */
    async fetchMemories(category?: string) {
      this.loading = true;
      this.error = null;
      this.isOnline = NetworkMonitor.isConnected();

      const userId = getUserId();
      if (!userId) {
        this.error = "User not authenticated";
        this.loading = false;
        return;
      }

      try {
        // Step 1: Load from local SQLite cache immediately
        if (SQLiteService.isReady()) {
          try {
            const cached = await MemoriesRepository.getAll(userId, category);
            if (cached.length > 0) {
              this.memories = cached as unknown as AIMemory[];
              console.log(`[memories-store] Loaded ${cached.length} memories from cache`);
            }
          } catch (cacheErr) {
            console.warn("[memories-store] Cache load failed:", cacheErr);
          }
        }

        // Step 2: If online, fetch from server and update cache
        if (this.isOnline) {
          try {
            const sdk = TranquaraSDK.getInstance();
            const response = await sdk.getAIMemories(category);
            const serverMemories = response.memories || [];
            this.memories = serverMemories;

            // Cache to SQLite for offline use
            if (SQLiteService.isReady()) {
              await MemoriesRepository.cacheAll(userId, serverMemories);
              console.log(`[memories-store] Cached ${serverMemories.length} memories from server`);
            }
          } catch (serverErr: any) {
            console.warn("[memories-store] Server fetch failed, using cached data:", serverErr.message);
            // If server fails but we already have cached data, keep it
            if (this.memories.length === 0) {
              this.error = "Memories unavailable offline. They will load when you're back online.";
            }
          }
        } else if (this.memories.length === 0) {
          // Offline with no cache
          this.error = "Memories will be available when you're online.";
        }
      } catch (err: any) {
        this.error = err.message || "Failed to load memories";
        console.error("[memories-store] Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },

    /** Delete a single memory (optimistic UI + cache update) */
    async deleteMemory(memoryId: string) {
      // Optimistic: remove from local state immediately
      const index = this.memories.findIndex((m) => m.id === memoryId);
      const removed = index >= 0 ? this.memories.splice(index, 1)[0] : null;

      // Remove from local cache
      if (SQLiteService.isReady()) {
        try {
          await MemoriesRepository.deleteById(memoryId);
        } catch (cacheErr) {
          console.warn("[memories-store] Cache delete failed:", cacheErr);
        }
      }

      // If online, delete from server
      if (NetworkMonitor.isConnected()) {
        try {
          const sdk = TranquaraSDK.getInstance();
          await sdk.deleteAIMemory(memoryId);
        } catch (err: any) {
          // Rollback on failure
          if (removed && index >= 0) {
            this.memories.splice(index, 0, removed);
          }
          console.error("[memories-store] Delete error:", err);
          throw err;
        }
      } else {
        // Offline: memory is removed locally, server delete will happen 
        // next time memories are refreshed from server (server is authoritative)
        console.log("[memories-store] Offline — memory removed locally, server delete pending");
      }
    },
  },
});
