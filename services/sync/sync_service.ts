/**
 * Sync Service
 * 
 * Orchestrates background synchronization of journals with server
 * Handles batch uploads, retry logic, and conflict resolution
 */

import NetworkMonitor from './network_monitor';
import SyncQueue from './sync_queue';
import JournalsRepository from '../sqlite/journals_repository';
import TranquaraSDK from '~/stores/tranquara_sdk';
import type { LocalJournal } from '~/types/user_journal';

export type SyncCallback = (status: SyncStatus) => void;
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private status: SyncStatus = 'idle';
  private listeners: Set<SyncCallback> = new Set();
  private autoSyncInterval: number | null = null;
  private batchSize = 10; // Upload 10 journals at a time

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize sync service
   * Sets up network monitoring and auto-sync
   */
  public async initialize(userId: string): Promise<void> {
    console.log('[SyncService] Initializing for user:', userId);

    // Load pending journals into queue
    await SyncQueue.loadPendingJournals(userId);

    // Subscribe to network status changes
    NetworkMonitor.subscribe((isOnline) => {
      if (isOnline && !this.isSyncing) {
        console.log('[SyncService] Network online - triggering sync');
        this.syncAll(userId);
      }
    });

    console.log('[SyncService] Initialized successfully');
  }

  /**
   * Start auto-sync interval
   * Syncs every X minutes when online
   */
  public startAutoSync(userId: string, intervalMinutes = 5): void {
    if (this.autoSyncInterval) {
      console.log('[SyncService] Auto-sync already running');
      return;
    }

    this.autoSyncInterval = window.setInterval(() => {
      if (NetworkMonitor.isConnected() && !this.isSyncing) {
        console.log('[SyncService] Auto-sync triggered');
        this.syncAll(userId);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`[SyncService] Auto-sync started (every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop auto-sync interval
   */
  public stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      console.log('[SyncService] Auto-sync stopped');
    }
  }

  /**
   * Sync all pending journals
   * Main sync orchestration method
   */
  public async syncAll(userId: string): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress');
      return { success: false, syncedCount: 0, failedCount: 0, errors: ['Sync already in progress'] };
    }

    if (!NetworkMonitor.isConnected()) {
      console.log('[SyncService] Offline - skipping sync');
      return { success: false, syncedCount: 0, failedCount: 0, errors: ['Device is offline'] };
    }

    this.isSyncing = true;
    this.updateStatus('syncing');

    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      // Get items ready for sync (excludes max retry failures)
      const itemsToSync = SyncQueue.getItemsReadyForSync();
      
      if (itemsToSync.length === 0) {
        console.log('[SyncService] No journals to sync');
        this.updateStatus('idle');
        return result;
      }

      console.log(`[SyncService] Syncing ${itemsToSync.length} journals...`);

      // Process in batches
      for (let i = 0; i < itemsToSync.length; i += this.batchSize) {
        const batch = itemsToSync.slice(i, i + this.batchSize);
        
        for (const item of batch) {
          try {
            if (item.action === 'delete') {
              await this.syncDeleteJournal(item.journal);
            } else {
              await this.syncJournal(item.journal, userId);
            }
            result.syncedCount++;
            SyncQueue.removeFromQueue(item.journal.id);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(`${item.journal.id}: ${errorMsg}`);
            result.failedCount++;
            SyncQueue.incrementRetry(item.journal.id, errorMsg);
          }
        }

        // Small delay between batches to avoid overwhelming server
        if (i + this.batchSize < itemsToSync.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`[SyncService] Sync complete: ${result.syncedCount} success, ${result.failedCount} failed`);
      this.updateStatus(result.failedCount > 0 ? 'error' : 'success');

    } catch (error) {
      console.error('[SyncService] Sync error:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.updateStatus('error');
    } finally {
      this.isSyncing = false;
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        if (this.status !== 'syncing') {
          this.updateStatus('idle');
        }
      }, 3000);
    }

    return result;
  }

  /**
   * Sync single journal to server
   * Uses TranquaraSDK.syncJournal() with conflict resolution
   */
  private async syncJournal(journal: LocalJournal, userId: string): Promise<void> {
    console.log('[SyncService] Syncing journal:', journal.id);
    
    try {
      // Call SDK sync method which handles create/update/conflict resolution
      const response = await TranquaraSDK.getInstance().syncJournal(journal);
      
      // Mark as synced in local database
      await JournalsRepository.markAsSynced(journal.id, response.id);
      
      console.log('[SyncService] Journal synced successfully:', journal.id, '→', response.id);
    } catch (error) {
      console.error('[SyncService] Error syncing journal:', journal.id, error);
      throw error;
    }
  }

  /**
   * Delete a journal from the server (queued offline delete).
   * Only deletes if the journal has a server_id.
   */
  private async syncDeleteJournal(journal: LocalJournal): Promise<void> {
    if (!journal.server_id) {
      console.log('[SyncService] Journal has no server_id, skip server delete:', journal.id);
      return;
    }

    console.log('[SyncService] Deleting journal from server:', journal.server_id);

    try {
      await TranquaraSDK.getInstance().deleteJournal(journal.server_id);
      console.log('[SyncService] Journal deleted from server:', journal.server_id);
    } catch (error) {
      console.error('[SyncService] Error deleting journal from server:', journal.server_id, error);
      throw error;
    }
  }

  /**
   * Force sync specific journal
   */
  public async syncSingle(journalId: string, userId: string): Promise<boolean> {
    if (!NetworkMonitor.isConnected()) {
      throw new Error('Device is offline');
    }

    try {
      const journal = await JournalsRepository.getById(journalId);
      if (!journal) {
        throw new Error('Journal not found');
      }

      await this.syncJournal(journal, userId);
      SyncQueue.removeFromQueue(journalId);
      return true;
    } catch (error) {
      console.error('[SyncService] Error syncing single journal:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      SyncQueue.incrementRetry(journalId, errorMsg);
      throw error;
    }
  }

  /**
   * Get current sync status
   */
  public getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Check if currently syncing
   */
  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Subscribe to sync status changes
   */
  public subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current status
    callback(this.status);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(newStatus: SyncStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      console.log('[SyncService] Status changed:', newStatus);
      
      this.listeners.forEach(callback => {
        try {
          callback(newStatus);
        } catch (error) {
          console.error('[SyncService] Error in status callback:', error);
        }
      });
    }
  }

  /**
   * Get sync statistics
   */
  public getStats(): {
    queueSize: number;
    readyToSync: number;
    failed: number;
    isOnline: boolean;
    isSyncing: boolean;
  } {
    const queueStats = SyncQueue.getStats();
    
    return {
      queueSize: queueStats.total,
      readyToSync: queueStats.ready,
      failed: queueStats.failed,
      isOnline: NetworkMonitor.isConnected(),
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Set batch size for sync operations
   */
  public setBatchSize(size: number): void {
    this.batchSize = size;
  }
}

// Export singleton instance
export default SyncService.getInstance();
