/**
 * Sync Queue Service
 * 
 * Manages journals pending synchronization with server.
 * Supports create/update AND delete actions.
 * Tracks retry logic and error handling.
 */

import JournalsRepository from '../sqlite/journals_repository';
import type { LocalJournal } from '~/types/user_journal';

export type SyncAction = 'upsert' | 'delete';

export interface SyncQueueItem {
  journal: LocalJournal;
  action: SyncAction;
  retryCount: number;
  lastError?: string;
}

export class SyncQueue {
  private static instance: SyncQueue;
  private queue: Map<string, SyncQueueItem> = new Map();
  private maxRetries = 3;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SyncQueue {
    if (!SyncQueue.instance) {
      SyncQueue.instance = new SyncQueue();
    }
    return SyncQueue.instance;
  }

  /**
   * Load pending journals from SQLite into memory queue
   */
  public async loadPendingJournals(userId: string): Promise<void> {
    try {
      const pendingJournals = await JournalsRepository.getPendingSync(userId);
      
      this.queue.clear();
      pendingJournals.forEach(journal => {
        this.queue.set(journal.id, {
          journal,
          action: 'upsert',
          retryCount: 0,
        });
      });

      console.log(`[SyncQueue] Loaded ${pendingJournals.length} pending journals`);
    } catch (error) {
      console.error('[SyncQueue] Error loading pending journals:', error);
      throw error;
    }
  }

  /**
   * Add journal to sync queue (create/update)
   */
  public addToQueue(journal: LocalJournal): void {
    this.queue.set(journal.id, {
      journal,
      action: 'upsert',
      retryCount: 0,
    });
    console.log('[SyncQueue] Added to queue (upsert):', journal.id);
  }

  /**
   * Add a delete operation to the sync queue.
   * When online, the server delete will be processed by SyncService.
   */
  public addDeleteToQueue(journal: LocalJournal): void {
    this.queue.set(journal.id, {
      journal,
      action: 'delete',
      retryCount: 0,
    });
    console.log('[SyncQueue] Added to queue (delete):', journal.id);
  }

  /**
   * Remove journal from queue (after successful sync)
   */
  public removeFromQueue(journalId: string): void {
    this.queue.delete(journalId);
    console.log('[SyncQueue] Removed from queue:', journalId);
  }

  /**
   * Get all items in queue
   */
  public getQueue(): SyncQueueItem[] {
    return Array.from(this.queue.values());
  }

  /**
   * Get queue size
   */
  public getQueueSize(): number {
    return this.queue.size;
  }

  /**
   * Check if queue is empty
   */
  public isEmpty(): boolean {
    return this.queue.size === 0;
  }

  /**
   * Get items ready for sync (retry count < max)
   */
  public getItemsReadyForSync(): SyncQueueItem[] {
    return Array.from(this.queue.values()).filter(
      item => item.retryCount < this.maxRetries
    );
  }

  /**
   * Get failed items (retry count >= max)
   */
  public getFailedItems(): SyncQueueItem[] {
    return Array.from(this.queue.values()).filter(
      item => item.retryCount >= this.maxRetries
    );
  }

  /**
   * Increment retry count for a journal
   */
  public incrementRetry(journalId: string, error: string): void {
    const item = this.queue.get(journalId);
    if (item) {
      item.retryCount++;
      item.lastError = error;
      console.log(`[SyncQueue] Retry count for ${journalId}: ${item.retryCount}/${this.maxRetries}`);
    }
  }

  /**
   * Reset retry count (after successful sync)
   */
  public resetRetry(journalId: string): void {
    const item = this.queue.get(journalId);
    if (item) {
      item.retryCount = 0;
      item.lastError = undefined;
    }
  }

  /**
   * Clear entire queue
   */
  public clearQueue(): void {
    this.queue.clear();
    console.log('[SyncQueue] Queue cleared');
  }

  /**
   * Get statistics about queue
   */
  public getStats(): {
    total: number;
    ready: number;
    failed: number;
  } {
    const ready = this.getItemsReadyForSync().length;
    const failed = this.getFailedItems().length;

    return {
      total: this.queue.size,
      ready,
      failed,
    };
  }

  /**
   * Set max retry attempts
   */
  public setMaxRetries(max: number): void {
    this.maxRetries = max;
  }

  /**
   * Get max retry attempts
   */
  public getMaxRetries(): number {
    return this.maxRetries;
  }
}

// Export singleton instance
export default SyncQueue.getInstance();
