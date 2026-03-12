import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import {
  CreateJournalRequest,
  Journal,
  JournalTemplate,
  JournalTemplateResponse,
  UserJournalsResponse,
  LocalJournal,
  LocalTemplate
} from "~/types/user_journal";
import SQLiteService from "~/services/sqlite/sqlite_service";
import JournalsRepository from "~/services/sqlite/journals_repository";
import TemplatesRepository from "~/services/sqlite/templates_repository";
import SyncService from "~/services/sync/sync_service";
import SyncQueue from "~/services/sync/sync_queue";
import NetworkMonitor from "~/services/sync/network_monitor";
import { useAuthStore } from "./auth_store";
import { useUserStreakStore } from "./user_streak";

// Helper function to get current user ID from auth store
const getUserId = (): string | undefined => {
  const authStore = useAuthStore();
  const userId = authStore.getUserUUID;
  console.log('[getUserId] userId from authStore:', userId);
  return userId || undefined;
};

export const userJournalStore = defineStore("user_journal", {
  state: () => ({
    templates: [] as LocalTemplate[],
    journals: [] as LocalJournal[],
    currentWritingContent: {} as { [key: string]: string },
    currentMoodScore: 5 as number, // 1-10 scale (matches EmotionSliderV2)
    currentMoodLabel: "Okay" as string,
    currentJournal: null as LocalJournal | null,
    isInitialized: false,
    isSyncing: false,
    isOnline: false,
  }),

  actions: {
    /**
     * Initialize SQLite database and load cached data
     * Should be called after user logs in
     */
    async initializeDatabase() {
      if (this.isInitialized) {
        console.log('[JournalStore] Already initialized');
        return;
      }

      try {
        // Get user ID and token from auth store
        const userId = getUserId();
        const authStore = useAuthStore();
        const token = await authStore.getAccessToken();

        console.log('[JournalStore] initializeDatabase - userId:', userId, 'hasToken:', !!token);

        if (!userId || !token) {
          throw new Error('User not authenticated');
        }

        console.log('[JournalStore] Initializing database...');

        // Initialize SQLite
        await SQLiteService.initialize();

        // Initialize network monitor
        await NetworkMonitor.initialize();
        this.isOnline = NetworkMonitor.isConnected();

        // Subscribe to network changes
        NetworkMonitor.subscribe((isOnline) => {
          this.isOnline = isOnline;
          console.log('[JournalStore] Network status:', isOnline ? 'online' : 'offline');
        });

        // Initialize sync service
        await SyncService.initialize(userId);

        // Load templates from cache
        await this.loadTemplatesFromLocal();

        // Load journals from local SQLite
        await this.loadJournalsFromLocal();

        // If online, sync with server
        if (this.isOnline) {
          await this.syncWithServer();
        }

        this.isInitialized = true;
        console.log('[JournalStore] Initialized successfully');
      } catch (error) {
        console.error('[JournalStore] Initialization error:', error);
        throw error;
      }
    },

    /**
     * Load templates from local SQLite cache
     */
    async loadTemplatesFromLocal() {
      try {
        if (!SQLiteService.isReady()) {
          console.log('[JournalStore] Database not ready - skipping template load');
          return;
        }

        const templates = await TemplatesRepository.getAll();
        this.templates = templates;
        console.log(`[JournalStore] Loaded ${templates.length} templates from cache`);

        // Check if cache is stale and refresh if online
        const isStale = await TemplatesRepository.isCacheStale();
        if (isStale && this.isOnline) {
          console.log('[JournalStore] Template cache is stale - refreshing from server');
          await this.refreshTemplatesFromServer();
        }
      } catch (error) {
        console.error('[JournalStore] Error loading templates:', error);
        // If cache fails and we're online, fetch from server
        if (this.isOnline) {
          await this.refreshTemplatesFromServer();
        }
      }
    },

    /**
     * Refresh templates from server and update cache
     */
    async refreshTemplatesFromServer() {
      try {
        const response: any = await TranquaraSDK.getInstance().getAllTemplates();

        let templatesToCache: any[] = [];

        // Safely extract templates array from response
        if (Array.isArray(response)) {
          templatesToCache = response;
        } else if (response && Array.isArray(response.templates)) {
          templatesToCache = response.templates;
        } else if (response && Array.isArray(response.data)) {
          templatesToCache = response.data;
        } else {
          console.warn('[JournalStore] Unexpected response format for templates:', response);
          return;
        }

        // Cache in SQLite
        if (templatesToCache.length > 0) {
          await TemplatesRepository.cacheAll(templatesToCache);
          // Update store state
          this.templates = await TemplatesRepository.getAll();
          console.log('[JournalStore] Templates refreshed from server');
        } else {
          console.log('[JournalStore] No templates found to cache');
        }
      } catch (error) {
        console.error('[JournalStore] Error refreshing templates:', error);
        // Do not re-throw, allows app to continue offline
      }
    },

    /**
     * Get all templates (offline-first)
     * 
     * Strategy:
     * 1. Load from local SQLite cache immediately (fast, works offline)
     * 2. If online, refresh from server in background and update cache
     */
    async getAllTemplates() {
      // Step 1: Always load from local cache first (instant response)
      if (this.templates.length === 0) {
        await this.loadTemplatesFromLocal();
      }

      // Step 2: If online, refresh from server in background (non-blocking)
      if (this.isOnline) {
        this.refreshTemplatesFromServer().catch((error) => {
          console.warn('[JournalStore] Background template refresh failed:', error);
        });
      }

      return this.templates;
    },

    /**
     * Load journals from local SQLite
     */
    async loadJournalsFromLocal() {
      try {
        if (!SQLiteService.isReady()) {
          console.log('[JournalStore] Database not ready - skipping journal load');
          return;
        }

        const userId = getUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        const journals = await JournalsRepository.getAllByUserId(userId);
        this.journals = journals;
        console.log(`[JournalStore] Loaded ${journals.length} journals from local storage`);
      } catch (error) {
        console.error('[JournalStore] Error loading journals:', error);
        throw error;
      }
    },

    /**
     * Download and merge journals from server into local SQLite
     * This is the "pull" part of bi-directional sync
     * 
     * @returns Sync statistics (inserted, updated, skipped counts)
     */
    async syncDownloadFromServer(): Promise<{
      inserted: number;
      updated: number;
      skipped: number;
      error?: string;
    }> {
      const defaultResult = { inserted: 0, updated: 0, skipped: 0 };

      try {
        const userId = getUserId();
        if (!userId) {
          console.log('[JournalStore] No user ID - skipping server download');
          return { ...defaultResult, error: 'User not authenticated' };
        }

        if (!this.isOnline) {
          console.log('[JournalStore] Offline - skipping server download');
          return { ...defaultResult, error: 'Device is offline' };
        }

        console.log('[JournalStore] Downloading journals from server...');

        // Fetch journals from server
        const response: any = await TranquaraSDK.getInstance().getJournals();

        // Handle different response formats
        let serverJournals: any[] = [];
        if (Array.isArray(response)) {
          serverJournals = response;
        } else if (response && Array.isArray(response.user_journals)) {
          serverJournals = response.user_journals;
        } else if (response && Array.isArray(response.journals)) {
          serverJournals = response.journals;
        } else if (response && Array.isArray(response.data)) {
          serverJournals = response.data;
        }

        console.log(`[JournalStore] Received ${serverJournals.length} journals from server`);

        if (serverJournals.length === 0) {
          console.log('[JournalStore] No journals on server');
          return defaultResult;
        }

        // Merge server journals into local SQLite
        const syncStats = await JournalsRepository.syncFromServer(serverJournals, userId);

        console.log('[JournalStore] Server download complete:', syncStats);
        return syncStats;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JournalStore] Error downloading from server:', error);
        return { ...defaultResult, error: errorMsg };
      }
    },

    /**
     * Full bi-directional sync:
     * 1. Download journals from server (pull)
     * 2. Upload pending journals to server (push)
     * 3. Reload local journals
     * 
     * @returns Combined sync result
     */
    async fullBiDirectionalSync(): Promise<{
      download: { inserted: number; updated: number; skipped: number; count: number; error?: string } | null;
      upload: { syncedCount: number; failedCount: number; error?: string } | null;
      errors: string[];
    }> {
      const result: {
        download: { inserted: number; updated: number; skipped: number; count: number; error?: string } | null;
        upload: { syncedCount: number; failedCount: number; error?: string } | null;
        errors: string[];
      } = {
        download: null,
        upload: null,
        errors: [],
      };

      if (this.isSyncing) {
        console.log('[JournalStore] Sync already in progress');
        result.errors.push('Sync already in progress');
        return result;
      }

      if (!this.isOnline) {
        console.log('[JournalStore] Offline - skipping full sync');
        result.errors.push('Device is offline');
        return result;
      }

      try {
        this.isSyncing = true;
        const userId = getUserId();

        if (!userId) {
          throw new Error('User not authenticated');
        }

        console.log('[JournalStore] Starting full bi-directional sync...');

        // Step 1: Download from server (pull)
        console.log('[JournalStore] Step 1: Downloading from server...');
        const downloadResult = await this.syncDownloadFromServer();
        result.download = {
          ...downloadResult,
          count: downloadResult.inserted + downloadResult.updated,
        };
        if (downloadResult.error) {
          result.errors.push(`Download: ${downloadResult.error}`);
        }

        // Step 2: Upload pending to server (push)
        console.log('[JournalStore] Step 2: Uploading pending journals...');
        const uploadResult = await SyncService.syncAll(userId);
        result.upload = {
          syncedCount: uploadResult.syncedCount,
          failedCount: uploadResult.failedCount,
          error: uploadResult.errors.length > 0 ? uploadResult.errors.join(', ') : undefined,
        };
        if (uploadResult.errors.length > 0) {
          result.errors.push(`Upload: ${uploadResult.errors.join(', ')}`);
        }

        // Step 3: Reload local journals to reflect all changes
        console.log('[JournalStore] Step 3: Reloading local journals...');
        await this.loadJournalsFromLocal();

        console.log('[JournalStore] Full bi-directional sync complete:', result);
        return result;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JournalStore] Full sync error:', error);
        result.errors.push(errorMsg);
        return result;
      } finally {
        this.isSyncing = false;
      }
    },

    /**
     * Get single journal by ID (offline-first from SQLite)
     */
    async getJournalById(journalId: string) {
      try {
        const journal = await JournalsRepository.getById(journalId);
        if (journal) {
          this.currentJournal = journal;
          return journal;
        }

        // Try by server ID if not found by client ID
        const journalByServerId = await JournalsRepository.getByServerId(journalId);
        if (journalByServerId) {
          this.currentJournal = journalByServerId;
          return journalByServerId;
        }

        throw new Error('Journal not found');
      } catch (error) {
        console.error('[JournalStore] Error getting journal:', error);
        throw error;
      }
    },

    /**
     * Get all journals (offline-first with optional server sync)
     * 
     * Strategy:
     * 1. Load from local SQLite immediately (fast, works offline)
     * 2. If online and not recently synced, fetch from server in background
     * 3. Merge server data and reload local journals
     * 
     * @param forceServerSync - Force download from server even if recently synced
     */
    async getJournals(forceServerSync = false) {
      console.log('[JournalStore] getJournals called - isInitialized:', this.isInitialized, 'SQLiteReady:', SQLiteService.isReady());

      if (!this.isInitialized || !SQLiteService.isReady()) {
        console.log('[JournalStore] Database not ready - attempting initialization...');
        try {
          await this.initializeDatabase();
        } catch (error) {
          console.error('[JournalStore] Failed to initialize database:', error);
          return this.journals;
        }
      }

      // Step 1: Load local journals immediately (instant response)
      await this.loadJournalsFromLocal();

      // Step 2: If online, sync with server (non-blocking for better UX)
      if (this.isOnline && !this.isSyncing) {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
          // Run server sync in background (don't block UI)
          this.syncDownloadFromServer()
            .then(async (result) => {
              if (result.inserted > 0 || result.updated > 0) {
                console.log('[JournalStore] Server sync added new data, reloading...');
                // Reload local journals to include server data
                await this.loadJournalsFromLocal();
              }
            })
            .catch((error) => {
              console.error('[JournalStore] Background server sync failed:', error);
            });
        }
      }

      return this.journals;
    },

    /**
     * Create new journal (offline-first: write to SQLite immediately)
     */
    async createJournal(journal: CreateJournalRequest) {
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        // Create in local SQLite immediately
        const newJournal = await JournalsRepository.create({
          user_id: userId,
          collection_id: journal.collection_id,
          title: journal.title,
          content: journal.content,
          content_html: journal.content_html,
          mood_score: journal.mood_score,
          mood_label: journal.mood_label,
        });

        // Update store state
        this.journals.unshift(newJournal);
        this.currentJournal = newJournal;

        // Add to sync queue
        SyncQueue.addToQueue(newJournal);

        // Attempt sync if online
        if (this.isOnline) {
          this.triggerBackgroundSync();
        }

        // Refresh streak data after journal creation
        try {
          const streakStore = useUserStreakStore();
          await streakStore.refreshAfterJournaling();
        } catch (streakError) {
          console.warn('[JournalStore] Failed to refresh streak:', streakError);
          // Don't fail journal creation if streak refresh fails
        }

        console.log('[JournalStore] Journal created locally:', newJournal.id);
        return newJournal;
      } catch (error) {
        console.error('[JournalStore] Error creating journal:', error);
        throw error;
      }
    },

    /**
     * Update journal (offline-first: write to SQLite immediately)
     */
    async updateJournal(journal: Partial<LocalJournal> & { id: string }) {
      try {
        // Update in local SQLite
        const updated = await JournalsRepository.update(journal.id, journal);

        if (!updated) {
          throw new Error('Journal not found');
        }

        // Update store state
        const index = this.journals.findIndex((j) => j.id === updated.id);
        if (index !== -1) {
          this.journals[index] = updated;
        }

        if (this.currentJournal?.id === updated.id) {
          this.currentJournal = updated;
        }

        // Add to sync queue
        SyncQueue.addToQueue(updated);

        // Attempt sync if online
        if (this.isOnline) {
          this.triggerBackgroundSync();
        }

        console.log('[JournalStore] Journal updated locally:', updated.id);
        return updated;
      } catch (error) {
        console.error('[JournalStore] Error updating journal:', error);
        throw error;
      }
    },

    /**
     * Delete journal (hard delete from local SQLite + queue server delete if offline)
     */
    async deleteJournal(journalId: string) {
      try {
        // Get journal first to check if it has a server_id
        const journal = await JournalsRepository.getById(journalId);

        if (journal?.server_id && this.isOnline) {
          // Online: delete from server immediately
          try {
            const sdk = TranquaraSDK.getInstance();
            await sdk.deleteJournal(journal.server_id);
            console.log('[JournalStore] Journal deleted from server:', journal.server_id);
          } catch (error) {
            console.warn('[JournalStore] Failed to delete from server (will retry via sync queue):', error);
            // Queue for retry
            SyncQueue.addDeleteToQueue(journal);
          }
        } else if (journal?.server_id && !this.isOnline) {
          // Offline: queue the delete for when we're back online
          SyncQueue.addDeleteToQueue(journal);
          console.log('[JournalStore] Offline — queued server delete for:', journal.server_id);
        }

        // Hard delete from local SQLite
        await JournalsRepository.hardDelete(journalId);

        // Update store state
        this.journals = this.journals.filter((j) => j.id !== journalId);

        if (this.currentJournal?.id === journalId) {
          this.currentJournal = null;
        }

        console.log('[JournalStore] Journal hard deleted locally:', journalId);
      } catch (error) {
        console.error('[JournalStore] Error deleting journal:', error);
        throw error;
      }
    },

    /**
     * Sync all pending journals with server (bi-directional)
     * Downloads from server + uploads pending local changes
     */
    async syncWithServer() {
      if (this.isSyncing) {
        console.log('[JournalStore] Sync already in progress');
        return;
      }

      if (!this.isOnline) {
        console.log('[JournalStore] Offline - skipping sync');
        return;
      }

      try {
        console.log('[JournalStore] Starting bi-directional sync with server...');

        // Use full bi-directional sync
        const result = await this.fullBiDirectionalSync();

        console.log('[JournalStore] Bi-directional sync completed:', result);

        return result;
      } catch (error) {
        console.error('[JournalStore] Sync error:', error);
        throw error;
      }
    },

    /**
     * Trigger background sync (non-blocking)
     */
    triggerBackgroundSync() {
      const userId = getUserId();
      if (!userId) return;

      // Use full bi-directional sync in background
      this.fullBiDirectionalSync().catch((error) => {
        console.error('[JournalStore] Background sync error:', error);
      });
    },

    /**
     * Search journals by text
     * Matches server implementation: searches title, content, AND content_html
     */
    async searchJournals(searchText: string) {
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        return await JournalsRepository.search(userId, searchText);
      } catch (error) {
        console.error('[JournalStore] Search error:', error);
        throw error;
      }
    },

    /**
     * Get journals with advanced filtering (matches server's GetListWithFilter)
     * Supports:
     * - Full-text search (title, content, content_html)
     * - Collection filtering (including free-form: collectionId = null)
     * - Time range filtering
     * - Pagination
     * - Sorting
     */
    async getJournalsWithFilter(options: {
      searchText?: string;
      collectionId?: string | null;
      startTime?: string;
      endTime?: string;
      page?: number;
      pageSize?: number;
      sortBy?: 'created_at' | 'updated_at' | 'title';
      sortDirection?: 'ASC' | 'DESC';
    } = {}) {
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        return await JournalsRepository.getWithFilter(userId, options);
      } catch (error) {
        console.error('[JournalStore] Filter error:', error);
        throw error;
      }
    },

    /**
     * Get journals by collection
     */
    async getJournalsByCollection(collectionId: string) {
      try {
        const userId = getUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        return await JournalsRepository.getByCollectionId(userId, collectionId);
      } catch (error) {
        console.error('[JournalStore] Error getting journals by collection:', error);
        throw error;
      }
    },

    /**
     * Get sync statistics
     */
    getSyncStats() {
      return SyncService.getStats();
    },

    /**
     * Clear all local data (for logout)
     */
    async clearLocalData() {
      try {
        await SQLiteService.clearAllData();
        await SQLiteService.close();

        this.journals = [];
        this.templates = [];
        this.currentJournal = null;
        this.isInitialized = false;

        SyncService.stopAutoSync();
        NetworkMonitor.unsubscribeAll();

        console.log('[JournalStore] Local data cleared');
      } catch (error) {
        console.error('[JournalStore] Error clearing local data:', error);
      }
    },

    updateCurrentWritingContent(key: string, value: string) {
      this.currentWritingContent[key] = value;
    },

    /**
     * Update current mood
     */
    updateMood(score: number, label: string) {
      this.currentMoodScore = score;
      this.currentMoodLabel = label;
    },

    /**
     * Clear current writing session
     */
    clearCurrentSession() {
      this.currentWritingContent = {};
      this.currentMoodScore = 5; // 1-10 scale default (middle value)
      this.currentMoodLabel = "Okay";
      this.currentJournal = null;
    },

  },

  getters: {
    /**
     * Group templates by category
     */
    templateGroupedByCategory(): { [key: string]: LocalTemplate[] } {
      const groupedTemplate = this.templates.reduce((acc, template) => {
        const category = template.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [template];
        } else {
          acc[category].push(template);
        }
        return acc;
      }, {} as { [key: string]: LocalTemplate[] });

      const keys = Object.keys(groupedTemplate);
      keys.sort();

      const reorderedObject = {} as typeof groupedTemplate;
      for (const key of keys) {
        reorderedObject[key] = groupedTemplate[key];
      }

      return reorderedObject;
    },

    /**
     * Get pending sync count
     */
    pendingSyncCount(): number {
      return this.journals.filter((j) => j.needs_sync === 1).length;
    },

    /**
     * Check if database is ready
     */
    isDatabaseReady(): boolean {
      return this.isInitialized && SQLiteService.isReady();
    },
  },
});
