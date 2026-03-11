import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import { ToolkitRepository } from "~/services/sqlite/toolkit_repository";
import { useAuthStore } from "./auth_store";
import type { TherapySession, HomeworkItem, PrepPack, CreateSessionInput, UpdateSessionInput, UserAffirmation } from "~/types/therapy_toolkit";

const getUserId = (): string | undefined => {
  const authStore = useAuthStore();
  return authStore.getUserUUID || undefined;
};

export const useToolkitStore = defineStore("therapy_toolkit", {
  state: () => ({
    sessions: [] as TherapySession[],
    currentSession: null as TherapySession | null,
    homeworkItems: [] as HomeworkItem[],
    prepPacks: [] as PrepPack[],
    currentPrepPack: null as PrepPack | null,
    affirmations: [] as UserAffirmation[],
    isGeneratingPrepPack: false,
    isLoading: false,
    isOnline: false,
    error: null as string | null,
  }),

  getters: {
    /** Most recent non-completed session */
    upcomingSession: (state) => {
      return state.sessions.find(s => s.status !== 'completed') || null;
    },

    /** All completed sessions, newest first */
    completedSessions: (state) => {
      return state.sessions.filter(s => s.status === 'completed');
    },

    /** Homework items not yet completed */
    pendingHomework: (state) => {
      return state.homeworkItems.filter(h => !h.completed);
    },

    /** Homework items for a specific session */
    getHomeworkForSession: (state) => {
      return (sessionId: string) => state.homeworkItems.filter(h => h.session_id === sessionId);
    },

    /** Most recently generated prep pack */
    latestPrepPack: (state) => {
      return state.prepPacks.length > 0 ? state.prepPacks[0] : null;
    },
  },

  actions: {
    /** Load sessions + homework + prep packs from SQLite */
    async loadFromLocal() {
      const userId = getUserId();
      if (!userId) return;

      try {
        const repo = new ToolkitRepository();
        this.sessions = await repo.getSessionsByUser(userId);
        this.homeworkItems = await repo.getHomeworkByUser(userId);
        this.prepPacks = await repo.getPrepPacksByUser(userId);
        this.affirmations = await repo.getAffirmationsByUser(userId);
      } catch (error) {
        console.error('[ToolkitStore] Error loading from local:', error);
      }
    },

    /** Create a new therapy session (offline-first) */
    async createSession(input: CreateSessionInput): Promise<TherapySession | null> {
      const userId = getUserId();
      if (!userId) return null;

      const now = new Date().toISOString();
      const session: TherapySession = {
        id: crypto.randomUUID(),
        user_id: userId,
        status: input.status || 'scheduled',
        ...input,
        created_at: now,
        updated_at: now,
        needs_sync: true,
      };

      try {
        const repo = new ToolkitRepository();
        await repo.createSession(session);
        this.sessions.unshift(session);

        // Sync to server if online
        if (this.isOnline) {
          try {
            const response = await TranquaraSDK.getInstance().createSession(input);
            await repo.markSessionSynced(session.id, response.session.id);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync session:', e);
          }
        }

        return session;
      } catch (error) {
        console.error('[ToolkitStore] Error creating session:', error);
        return null;
      }
    },

    /** Update an existing session (offline-first) */
    async updateSession(id: string, updates: UpdateSessionInput) {
      try {
        const repo = new ToolkitRepository();
        await repo.updateSession({ id, ...updates });

        const idx = this.sessions.findIndex(s => s.id === id);
        if (idx !== -1) {
          this.sessions[idx] = { ...this.sessions[idx], ...updates, updated_at: new Date().toISOString() };
        }

        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().updateSession(id, updates);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync update:', e);
          }
        }
      } catch (error) {
        console.error('[ToolkitStore] Error updating session:', error);
      }
    },

    /** Soft-delete a session */
    async deleteSession(id: string) {
      try {
        const repo = new ToolkitRepository();
        await repo.deleteSession(id);
        this.sessions = this.sessions.filter(s => s.id !== id);

        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().deleteSession(id);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync delete:', e);
          }
        }
      } catch (error) {
        console.error('[ToolkitStore] Error deleting session:', error);
      }
    },

    /** Add a homework item to a session */
    async addHomework(sessionId: string, content: string): Promise<HomeworkItem | null> {
      const userId = getUserId();
      if (!userId) return null;

      const item: HomeworkItem = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        user_id: userId,
        content,
        completed: false,
        created_at: new Date().toISOString(),
        needs_sync: true,
      };

      try {
        const repo = new ToolkitRepository();
        await repo.createHomework(item);
        this.homeworkItems.push(item);

        // Sync to server if online
        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().createHomework({
              session_id: sessionId,
              content,
            });
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync homework:', e);
          }
        }

        return item;
      } catch (error) {
        console.error('[ToolkitStore] Error adding homework:', error);
        return null;
      }
    },

    /** Toggle homework completed state */
    async toggleHomework(id: string) {
      const item = this.homeworkItems.find(h => h.id === id);
      if (!item) return;

      const newState = !item.completed;
      try {
        const repo = new ToolkitRepository();
        await repo.toggleHomework(id, newState);
        item.completed = newState;
        item.completed_at = newState ? new Date().toISOString() : undefined;

        // Sync to server if online
        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().toggleHomework(id, newState);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync homework toggle:', e);
          }
        }
      } catch (error) {
        console.error('[ToolkitStore] Error toggling homework:', error);
      }
    },

    /** Delete a homework item */
    async deleteHomework(id: string) {
      try {
        const repo = new ToolkitRepository();
        await repo.deleteHomework(id);
        this.homeworkItems = this.homeworkItems.filter(h => h.id !== id);

        // Sync to server if online
        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().deleteHomework(id);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync homework delete:', e);
          }
        }
      } catch (error) {
        console.error('[ToolkitStore] Error deleting homework:', error);
      }
    },

    // ─── Prep Packs ───────────────────────────

    /** Generate an AI prep pack for the given date range */
    async generatePrepPack(dateRangeStart: string, dateRangeEnd: string): Promise<PrepPack | null> {
      const userId = getUserId();
      if (!userId) return null;

      this.isGeneratingPrepPack = true;
      this.error = null;

      try {
        const response = await TranquaraSDK.getInstance().generatePrepPack({
          user_id: userId,
          date_range_start: dateRangeStart,
          date_range_end: dateRangeEnd,
          language: useNuxtApp().$i18n?.locale?.value || 'en',
        });

        // Build local prep pack object with a local ID
        const prepPack: PrepPack = {
          ...response.prep_pack,
          id: crypto.randomUUID(),
          user_id: userId,
          date_range_start: dateRangeStart,
          date_range_end: dateRangeEnd,
          journal_count: response.meta.journals_analyzed,
          created_at: response.meta.generated_at,
        };

        // Persist to SQLite cache
        try {
          const repo = new ToolkitRepository();
          await repo.savePrepPack(prepPack);
        } catch (e) {
          console.warn('[ToolkitStore] Failed to cache prep pack locally:', e);
        }

        // Sync to server if online
        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().savePrepPackToServer({
              date_range_start: dateRangeStart,
              date_range_end: dateRangeEnd,
              content: {
                mood_overview: prepPack.mood_overview,
                key_themes: prepPack.key_themes,
                emotional_highlights: prepPack.emotional_highlights,
                patterns: prepPack.patterns,
                discussion_points: prepPack.discussion_points,
                growth_moments: prepPack.growth_moments,
              },
              journal_count: prepPack.journal_count,
              personal_notes: prepPack.personal_notes || null,
            });
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync prep pack to server:', e);
          }
        }

        // Add to state (newest first)
        this.prepPacks.unshift(prepPack);
        this.currentPrepPack = prepPack;
        return prepPack;
      } catch (error: any) {
        console.error('[ToolkitStore] Error generating prep pack:', error);
        this.error = error?.message || 'Failed to generate prep pack';
        return null;
      } finally {
        this.isGeneratingPrepPack = false;
      }
    },

    /** Load a specific prep pack by ID from local cache */
    async loadPrepPack(id: string): Promise<PrepPack | null> {
      // Check if already in memory
      const cached = this.prepPacks.find(p => p.id === id);
      if (cached) {
        this.currentPrepPack = cached;
        return cached;
      }

      try {
        const repo = new ToolkitRepository();
        const pack = await repo.getPrepPackById(id);
        if (pack) {
          this.currentPrepPack = pack;
        }
        return pack;
      } catch (error) {
        console.error('[ToolkitStore] Error loading prep pack:', error);
        return null;
      }
    },

    /** Delete a prep pack from local cache and server */
    async deletePrepPack(id: string) {
      try {
        const repo = new ToolkitRepository();
        await repo.deletePrepPack(id);
        this.prepPacks = this.prepPacks.filter(p => p.id !== id);
        if (this.currentPrepPack?.id === id) {
          this.currentPrepPack = null;
        }

        // Sync delete to server if online
        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().deletePrepPackFromServer(id);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync prep pack delete:', e);
          }
        }
      } catch (error) {
        console.error('[ToolkitStore] Error deleting prep pack:', error);
      }
    },

    // --- Affirmations (local-only)

    async addAffirmation(content: string): Promise<UserAffirmation | null> {
      const userId = getUserId();
      if (!userId) return null;

      const item: UserAffirmation = {
        id: crypto.randomUUID(),
        user_id: userId,
        content,
        is_favorite: false,
        created_at: new Date().toISOString(),
      };

      try {
        const repo = new ToolkitRepository();
        await repo.addAffirmation(item);
        this.affirmations.unshift(item);
        return item;
      } catch (error) {
        console.error('[ToolkitStore] Error adding affirmation:', error);
        return null;
      }
    },

    async toggleAffirmationFavorite(id: string) {
      const idx = this.affirmations.findIndex(a => a.id === id);
      if (idx === -1) return;
      const newState = !this.affirmations[idx].is_favorite;

      try {
        const repo = new ToolkitRepository();
        await repo.toggleAffirmationFavorite(id, newState);
        this.affirmations[idx].is_favorite = newState;
      } catch (error) {
        console.error('[ToolkitStore] Error toggling affirmation favorite:', error);
      }
    },

    async deleteAffirmation(id: string) {
      try {
        const repo = new ToolkitRepository();
        await repo.deleteAffirmation(id);
        this.affirmations = this.affirmations.filter(a => a.id !== id);
      } catch (error) {
        console.error('[ToolkitStore] Error deleting affirmation:', error);
      }
    },

    setOnline(online: boolean) {
      this.isOnline = online;
    },
  },
});
