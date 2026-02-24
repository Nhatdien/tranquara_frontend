/**
 * Learned Slide Groups Repository
 * 
 * SQLite operations for user_learned_slide_groups table
 * Implements offline-first progress tracking for learn-type collections
 */

import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { LocalLearnedSlideGroup } from '~/types/user_journal';
import SQLiteService from './sqlite_service';

export class LearnedRepository {
  private getDb(): SQLiteDBConnection {
    const service = SQLiteService;
    if (!service.isReady()) {
      throw new Error('Database not initialized');
    }
    return service.getConnection();
  }

  /**
   * Mark a slide group as completed
   * Uses INSERT OR IGNORE to handle duplicates gracefully
   */
  async markCompleted(
    userId: string,
    collectionId: string,
    slideGroupId: string,
  ): Promise<LocalLearnedSlideGroup> {
    const db = this.getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const query = `
      INSERT OR IGNORE INTO user_learned_slide_groups 
        (id, user_id, collection_id, slide_group_id, completed_at, needs_sync)
      VALUES (?, ?, ?, ?, ?, 1);
    `;

    await db.run(query, [id, userId, collectionId, slideGroupId, now]);

    // Fetch the record (might be existing if duplicate)
    const existing = await this.getOne(userId, collectionId, slideGroupId);
    if (existing) return existing;

    // Shouldn't reach here, but return the new record
    return {
      id,
      user_id: userId,
      collection_id: collectionId,
      slide_group_id: slideGroupId,
      completed_at: now,
      needs_sync: 1,
      server_id: null,
      synced_at: null,
    };
  }

  /**
   * Get a specific completion record
   */
  async getOne(
    userId: string,
    collectionId: string,
    slideGroupId: string,
  ): Promise<LocalLearnedSlideGroup | null> {
    const db = this.getDb();

    const query = `
      SELECT * FROM user_learned_slide_groups
      WHERE user_id = ? AND collection_id = ? AND slide_group_id = ?;
    `;
    const result = await db.query(query, [userId, collectionId, slideGroupId]);

    if (!result.values || result.values.length === 0) return null;
    return this.mapRow(result.values[0]);
  }

  /**
   * Get all completed slide groups for a specific collection
   */
  async getByCollection(userId: string, collectionId: string): Promise<LocalLearnedSlideGroup[]> {
    const db = this.getDb();

    const query = `
      SELECT * FROM user_learned_slide_groups
      WHERE user_id = ? AND collection_id = ?
      ORDER BY completed_at ASC;
    `;
    const result = await db.query(query, [userId, collectionId]);

    if (!result.values || result.values.length === 0) return [];
    return result.values.map(row => this.mapRow(row));
  }

  /**
   * Get all completed slide groups for a user (across all collections)
   */
  async getAllByUser(userId: string): Promise<LocalLearnedSlideGroup[]> {
    const db = this.getDb();

    const query = `
      SELECT * FROM user_learned_slide_groups
      WHERE user_id = ?
      ORDER BY completed_at DESC;
    `;
    const result = await db.query(query, [userId]);

    if (!result.values || result.values.length === 0) return [];
    return result.values.map(row => this.mapRow(row));
  }

  /**
   * Get count of completed slide groups for a collection
   */
  async getCompletedCount(userId: string, collectionId: string): Promise<number> {
    const db = this.getDb();

    const query = `
      SELECT COUNT(*) as count FROM user_learned_slide_groups
      WHERE user_id = ? AND collection_id = ?;
    `;
    const result = await db.query(query, [userId, collectionId]);

    if (!result.values || result.values.length === 0) return 0;
    return result.values[0].count || 0;
  }

  /**
   * Check if a specific slide group is completed
   */
  async isCompleted(userId: string, collectionId: string, slideGroupId: string): Promise<boolean> {
    const record = await this.getOne(userId, collectionId, slideGroupId);
    return record !== null;
  }

  /**
   * Delete a completion record
   */
  async delete(id: string): Promise<void> {
    const db = this.getDb();
    await db.run('DELETE FROM user_learned_slide_groups WHERE id = ?;', [id]);
  }

  /**
   * Mark a record as synced with the server
   */
  async markAsSynced(localId: string, serverId: string): Promise<void> {
    const db = this.getDb();

    const query = `
      UPDATE user_learned_slide_groups 
      SET server_id = ?, needs_sync = 0, synced_at = ?
      WHERE id = ?;
    `;
    await db.run(query, [serverId, new Date().toISOString(), localId]);
  }

  /**
   * Get records that need syncing to server
   */
  async getPendingSync(userId: string): Promise<LocalLearnedSlideGroup[]> {
    const db = this.getDb();

    const query = `
      SELECT * FROM user_learned_slide_groups
      WHERE user_id = ? AND needs_sync = 1
      ORDER BY completed_at ASC;
    `;
    const result = await db.query(query, [userId]);

    if (!result.values || result.values.length === 0) return [];
    return result.values.map(row => this.mapRow(row));
  }

  /**
   * Sync from server: merge server records into local DB
   */
  async syncFromServer(serverRecords: any[], userId: string): Promise<void> {
    const db = this.getDb();

    for (const record of serverRecords) {
      const query = `
        INSERT OR IGNORE INTO user_learned_slide_groups 
          (id, server_id, user_id, collection_id, slide_group_id, completed_at, needs_sync, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?);
      `;
      await db.run(query, [
        crypto.randomUUID(), // local id
        record.id,           // server id
        userId,
        record.collection_id,
        record.slide_group_id,
        record.completed_at,
        new Date().toISOString(),
      ]);
    }
  }

  /**
   * Helper: Map SQLite row to LocalLearnedSlideGroup
   */
  private mapRow(row: any): LocalLearnedSlideGroup {
    return {
      id: row.id,
      server_id: row.server_id || null,
      user_id: row.user_id,
      collection_id: row.collection_id,
      slide_group_id: row.slide_group_id,
      completed_at: row.completed_at,
      needs_sync: row.needs_sync,
      synced_at: row.synced_at || null,
    };
  }
}

export default new LearnedRepository();
