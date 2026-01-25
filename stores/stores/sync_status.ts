/**
 * Sync Status Store
 * 
 * Centralized store for tracking sync state across the application
 * Provides reactive sync status, history, and statistics
 */

import { defineStore } from 'pinia';
import NetworkMonitor from '~/services/sync/network_monitor';
import JournalsRepository from '~/services/sqlite/journals_repository';
import { useAuthStore } from './auth_store';
import { Preferences } from '@capacitor/preferences';

// Storage keys for persistent sync data
const SYNC_STORAGE_KEYS = {
  LAST_SYNC_TIME: 'sync_last_time',
  SYNC_HISTORY: 'sync_history',
  SYNC_STATS: 'sync_stats',
};

export type SyncState = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface SyncHistoryEntry {
  timestamp: string;
  type: 'upload' | 'download' | 'full';
  success: boolean;
  itemsProcessed: number;
  error?: string;
}

export interface SyncStats {
  totalUploads: number;
  totalDownloads: number;
  totalErrors: number;
  lastSuccessfulSync: string | null;
}

export interface SyncStatusState {
  // Current sync status
  currentState: SyncState;
  isOnline: boolean;
  
  // Sync progress
  pendingCount: number;
  currentProgress: number; // 0-100
  currentMessage: string;
  
  // Sync history
  lastSyncTime: string | null;
  lastSyncResult: 'success' | 'partial' | 'error' | null;
  lastSyncError: string | null;
  syncHistory: SyncHistoryEntry[];
  
  // Statistics
  stats: SyncStats;
  
  // Internal
  isInitialized: boolean;
}

export const useSyncStatusStore = defineStore('sync_status', {
  state: (): SyncStatusState => ({
    currentState: 'idle',
    isOnline: true,
    pendingCount: 0,
    currentProgress: 0,
    currentMessage: '',
    lastSyncTime: null,
    lastSyncResult: null,
    lastSyncError: null,
    syncHistory: [],
    stats: {
      totalUploads: 0,
      totalDownloads: 0,
      totalErrors: 0,
      lastSuccessfulSync: null,
    },
    isInitialized: false,
  }),

  getters: {
    /**
     * Human-readable sync status
     */
    statusText(): string {
      if (!this.isOnline) return 'Offline';
      switch (this.currentState) {
        case 'syncing': return 'Syncing...';
        case 'success': return 'Synced';
        case 'error': return 'Sync failed';
        default: return 'Ready';
      }
    },

    /**
     * Status color for UI components
     */
    statusColor(): 'success' | 'warning' | 'error' | 'neutral' | 'info' {
      if (!this.isOnline) return 'neutral';
      switch (this.currentState) {
        case 'syncing': return 'info';
        case 'success': return 'success';
        case 'error': return 'error';
        default: return this.pendingCount > 0 ? 'warning' : 'success';
      }
    },

    /**
     * Status icon for UI components
     */
    statusIcon(): string {
      if (!this.isOnline) return 'i-lucide-wifi-off';
      switch (this.currentState) {
        case 'syncing': return 'i-lucide-refresh-cw';
        case 'success': return 'i-lucide-check-circle';
        case 'error': return 'i-lucide-alert-circle';
        default: return this.pendingCount > 0 ? 'i-lucide-cloud-off' : 'i-lucide-cloud';
      }
    },

    /**
     * Formatted last sync time
     */
    lastSyncTimeFormatted(): string {
      if (!this.lastSyncTime) return 'Never';
      
      const date = new Date(this.lastSyncTime);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      
      return date.toLocaleDateString();
    },

    /**
     * Whether there are pending items to sync
     */
    hasPendingSync(): boolean {
      return this.pendingCount > 0;
    },

    /**
     * Whether sync can be triggered (online and not already syncing)
     */
    canSync(): boolean {
      return this.isOnline && this.currentState !== 'syncing';
    },
  },

  actions: {
    /**
     * Initialize the sync status store
     */
    async initialize() {
      if (this.isInitialized) {
        console.log('[SyncStatusStore] Already initialized');
        return;
      }

      try {
        console.log('[SyncStatusStore] Initializing...');

        // Initialize network monitoring
        await NetworkMonitor.initialize();
        this.isOnline = NetworkMonitor.isConnected();

        // Subscribe to network changes
        NetworkMonitor.subscribe((isOnline) => {
          this.isOnline = isOnline;
          if (!isOnline) {
            this.currentState = 'offline';
          } else if (this.currentState === 'offline') {
            this.currentState = 'idle';
          }
        });

        // Load persisted data
        await this.loadPersistedData();

        // Update pending count
        await this.refreshPendingCount();

        this.isInitialized = true;
        console.log('[SyncStatusStore] Initialized successfully');
      } catch (error) {
        console.error('[SyncStatusStore] Initialization error:', error);
      }
    },

    /**
     * Load persisted sync data from Preferences
     */
    async loadPersistedData() {
      try {
        // Load last sync time
        const { value: lastSyncTime } = await Preferences.get({ 
          key: SYNC_STORAGE_KEYS.LAST_SYNC_TIME 
        });
        if (lastSyncTime) {
          this.lastSyncTime = lastSyncTime;
        }

        // Load sync history
        const { value: historyJson } = await Preferences.get({ 
          key: SYNC_STORAGE_KEYS.SYNC_HISTORY 
        });
        if (historyJson) {
          this.syncHistory = JSON.parse(historyJson);
        }

        // Load sync stats
        const { value: statsJson } = await Preferences.get({ 
          key: SYNC_STORAGE_KEYS.SYNC_STATS 
        });
        if (statsJson) {
          this.stats = JSON.parse(statsJson);
        }
      } catch (error) {
        console.error('[SyncStatusStore] Error loading persisted data:', error);
      }
    },

    /**
     * Persist sync data to Preferences
     */
    async persistData() {
      try {
        await Preferences.set({
          key: SYNC_STORAGE_KEYS.LAST_SYNC_TIME,
          value: this.lastSyncTime || '',
        });

        await Preferences.set({
          key: SYNC_STORAGE_KEYS.SYNC_HISTORY,
          value: JSON.stringify(this.syncHistory.slice(0, 50)), // Keep last 50 entries
        });

        await Preferences.set({
          key: SYNC_STORAGE_KEYS.SYNC_STATS,
          value: JSON.stringify(this.stats),
        });
      } catch (error) {
        console.error('[SyncStatusStore] Error persisting data:', error);
      }
    },

    /**
     * Refresh pending sync count from SQLite
     */
    async refreshPendingCount() {
      try {
        const authStore = useAuthStore();
        const userId = authStore.getUserUUID;
        
        if (!userId) {
          this.pendingCount = 0;
          return;
        }

        this.pendingCount = await JournalsRepository.getPendingSyncCount(userId);
        console.log('[SyncStatusStore] Pending count:', this.pendingCount);
      } catch (error) {
        console.error('[SyncStatusStore] Error refreshing pending count:', error);
      }
    },

    /**
     * Called when sync starts
     */
    onSyncStart(type: 'upload' | 'download' | 'full' = 'full') {
      this.currentState = 'syncing';
      this.currentProgress = 0;
      this.currentMessage = type === 'upload' 
        ? 'Uploading journals...' 
        : type === 'download' 
          ? 'Downloading journals...' 
          : 'Syncing...';
      this.lastSyncError = null;
    },

    /**
     * Update sync progress
     */
    onSyncProgress(progress: number, message?: string) {
      this.currentProgress = Math.min(100, Math.max(0, progress));
      if (message) {
        this.currentMessage = message;
      }
    },

    /**
     * Called when sync completes successfully
     */
    async onSyncSuccess(result: { 
      uploadedCount?: number; 
      downloadedCount?: number;
      type?: 'upload' | 'download' | 'full';
    }) {
      const now = new Date().toISOString();
      
      this.currentState = 'success';
      this.currentProgress = 100;
      this.currentMessage = 'Sync complete';
      this.lastSyncTime = now;
      this.lastSyncResult = 'success';

      // Update stats
      this.stats.totalUploads += result.uploadedCount || 0;
      this.stats.totalDownloads += result.downloadedCount || 0;
      this.stats.lastSuccessfulSync = now;

      // Add to history
      this.addHistoryEntry({
        timestamp: now,
        type: result.type || 'full',
        success: true,
        itemsProcessed: (result.uploadedCount || 0) + (result.downloadedCount || 0),
      });

      // Refresh pending count
      await this.refreshPendingCount();

      // Persist data
      await this.persistData();

      // Reset to idle after a short delay
      setTimeout(() => {
        if (this.currentState === 'success') {
          this.currentState = 'idle';
          this.currentMessage = '';
        }
      }, 3000);
    },

    /**
     * Called when sync partially succeeds
     */
    async onSyncPartial(result: { 
      uploadedCount?: number; 
      downloadedCount?: number;
      failedCount?: number;
      error?: string;
    }) {
      const now = new Date().toISOString();
      
      this.currentState = 'idle';
      this.currentProgress = 100;
      this.currentMessage = 'Sync partially complete';
      this.lastSyncTime = now;
      this.lastSyncResult = 'partial';
      this.lastSyncError = result.error || 'Some items failed to sync';

      // Update stats
      this.stats.totalUploads += result.uploadedCount || 0;
      this.stats.totalDownloads += result.downloadedCount || 0;
      this.stats.totalErrors += result.failedCount || 1;

      // Add to history
      this.addHistoryEntry({
        timestamp: now,
        type: 'full',
        success: false,
        itemsProcessed: (result.uploadedCount || 0) + (result.downloadedCount || 0),
        error: result.error,
      });

      // Refresh pending count
      await this.refreshPendingCount();

      // Persist data
      await this.persistData();
    },

    /**
     * Called when sync fails
     */
    async onSyncError(error: string) {
      const now = new Date().toISOString();
      
      this.currentState = 'error';
      this.currentProgress = 0;
      this.currentMessage = 'Sync failed';
      this.lastSyncResult = 'error';
      this.lastSyncError = error;

      // Update stats
      this.stats.totalErrors += 1;

      // Add to history
      this.addHistoryEntry({
        timestamp: now,
        type: 'full',
        success: false,
        itemsProcessed: 0,
        error,
      });

      // Persist data
      await this.persistData();
    },

    /**
     * Add entry to sync history
     */
    addHistoryEntry(entry: SyncHistoryEntry) {
      this.syncHistory.unshift(entry);
      // Keep only last 50 entries
      if (this.syncHistory.length > 50) {
        this.syncHistory = this.syncHistory.slice(0, 50);
      }
    },

    /**
     * Clear sync history
     */
    async clearHistory() {
      this.syncHistory = [];
      await this.persistData();
    },

    /**
     * Reset sync stats
     */
    async resetStats() {
      this.stats = {
        totalUploads: 0,
        totalDownloads: 0,
        totalErrors: 0,
        lastSuccessfulSync: null,
      };
      await this.persistData();
    },

    /**
     * Reset error state and return to idle
     */
    clearError() {
      if (this.currentState === 'error') {
        this.currentState = 'idle';
        this.currentMessage = '';
      }
    },
  },
});

export default useSyncStatusStore;
