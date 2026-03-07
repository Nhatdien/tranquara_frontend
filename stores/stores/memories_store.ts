import { defineStore } from "pinia";
import TranquaraSDK from "~/stores/tranquara_sdk";
import type { AIMemory } from "~/stores/ai_memories";

interface MemoriesState {
  memories: AIMemory[];
  loading: boolean;
  error: string | null;
}

export const useMemoriesStore = defineStore("memories_store", {
  state: (): MemoriesState => ({
    memories: [],
    loading: false,
    error: null,
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
    /** Fetch all memories from the API */
    async fetchMemories(category?: string) {
      this.loading = true;
      this.error = null;
      try {
        const sdk = TranquaraSDK.getInstance();
        const response = await sdk.getAIMemories(category);
        this.memories = response.memories || [];
      } catch (err: any) {
        this.error = err.message || "Failed to load memories";
        console.error("[memories-store] Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },

    /** Delete a single memory (optimistic UI) */
    async deleteMemory(memoryId: string) {
      // Optimistic: remove from local state immediately
      const index = this.memories.findIndex((m) => m.id === memoryId);
      const removed = index >= 0 ? this.memories.splice(index, 1)[0] : null;

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
    },
  },
});
