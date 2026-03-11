import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import { ToolkitRepository } from "~/services/sqlite/toolkit_repository";
import { useAuthStore } from "./auth_store";
import type { TherapySession, HomeworkItem, CreateSessionInput, UpdateSessionInput } from "~/types/therapy_toolkit";

const getUserId = (): string | undefined => {
  const authStore = useAuthStore();
  return authStore.getUserUUID || undefined;
};

export const useToolkitStore = defineStore("therapy_toolkit", {
  state: () => ({
    sessions: [] as TherapySession[],
    currentSession: null as TherapySession | null,
    homeworkItems: [] as HomeworkItem[],
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
  },

  actions: {
    /** Load sessions + homework from SQLite */
    async loadFromLocal() {
      const userId = getUserId();
      if (!userId) return;

      try {
        const repo = new ToolkitRepository();
        this.sessions = await repo.getSessionsByUser(userId);
        this.homeworkItems = await repo.getHomeworkByUser(userId);
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
      } catch (error) {
        console.error('[ToolkitStore] Error deleting homework:', error);
      }
    },

    setOnline(online: boolean) {
      this.isOnline = online;
    },
  },
});
