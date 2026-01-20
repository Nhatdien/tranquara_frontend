/**
 * Journals Repository
 * 
 * SQLite CRUD operations for user_journals table
 * Implements offline-first pattern with sync metadata
 */

import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { LocalJournal } from '~/types/user_journal';
import SQLiteService from './sqlite_service';

export class JournalsRepository {
  private getDb(): SQLiteDBConnection {
    const service = SQLiteService;
    if (!service.isReady()) {
      throw new Error('Database not initialized');
    }
    return service.getConnection();
  }

  /**
   * Insert new journal entry
   * Auto-generates client ID and timestamps
   */
  async create(journal: Omit<LocalJournal, 'id' | 'created_at' | 'updated_at' | 'needs_sync' | 'is_deleted'>): Promise<LocalJournal> {
    const db = this.getDb();
    
    const newJournal: LocalJournal = {
      ...journal,
      id: this.generateClientId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      needs_sync: 1,
      is_deleted: 0,
    };

    const query = `
      INSERT INTO user_journals (
        id, server_id, user_id, collection_id, title, content, content_html,
        mood_score, mood_label, created_at, updated_at, needs_sync, synced_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    await db.run(query, [
      newJournal.id,
      newJournal.server_id || null,
      newJournal.user_id,
      newJournal.collection_id || null,
      newJournal.title || null,
      newJournal.content,
      newJournal.content_html || null,
      newJournal.mood_score || null,
      newJournal.mood_label || null,
      newJournal.created_at,
      newJournal.updated_at,
      newJournal.needs_sync,
      newJournal.synced_at || null,
      newJournal.is_deleted,
    ]);

    console.log('[JournalsRepo] Created journal:', newJournal.id);
    return newJournal;
  }

  /**
   * Get single journal by client ID
   */
  async getById(id: string): Promise<LocalJournal | null> {
    const db = this.getDb();
    
    const query = `SELECT * FROM user_journals WHERE id = ? AND is_deleted = 0;`;
    const result = await db.query(query, [id]);

    if (!result.values || result.values.length === 0) {
      return null;
    }

    return this.mapRowToJournal(result.values[0]);
  }

  /**
   * Get journal by server ID
   */
  async getByServerId(serverId: string): Promise<LocalJournal | null> {
    const db = this.getDb();
    
    const query = `SELECT * FROM user_journals WHERE server_id = ? AND is_deleted = 0;`;
    const result = await db.query(query, [serverId]);

    if (!result.values || result.values.length === 0) {
      return null;
    }

    return this.mapRowToJournal(result.values[0]);
  }

  /**
   * Get all journals for a user (sorted by created_at DESC)
   */
  async getAllByUserId(userId: string, limit = 100, offset = 0): Promise<LocalJournal[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM user_journals 
      WHERE user_id = ? AND is_deleted = 0
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?;
    `;
    
    const result = await db.query(query, [userId, limit, offset]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToJournal(row));
  }

  /**
   * Get journals by collection ID
   */
  async getByCollectionId(userId: string, collectionId: string): Promise<LocalJournal[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM user_journals 
      WHERE user_id = ? AND collection_id = ? AND is_deleted = 0
      ORDER BY created_at DESC;
    `;
    
    const result = await db.query(query, [userId, collectionId]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToJournal(row));
  }

  /**
   * Update existing journal
   * Sets needs_sync=1 and updates timestamp
   */
  async update(id: string, updates: Partial<LocalJournal>): Promise<LocalJournal | null> {
    const db = this.getDb();
    
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Journal not found: ${id}`);
    }

    const updated: LocalJournal = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
      needs_sync: 1, // Mark for sync
    };

    const query = `
      UPDATE user_journals SET
        title = ?, content = ?, content_html = ?,
        mood_score = ?, mood_label = ?,
        collection_id = ?, updated_at = ?, needs_sync = ?
      WHERE id = ?;
    `;

    await db.run(query, [
      updated.title || null,
      updated.content,
      updated.content_html || null,
      updated.mood_score || null,
      updated.mood_label || null,
      updated.collection_id || null,
      updated.updated_at,
      updated.needs_sync,
      id,
    ]);

    console.log('[JournalsRepo] Updated journal:', id);
    return updated;
  }

  /**
   * Soft delete journal
   * Sets is_deleted=1 and needs_sync=1
   */
  async delete(id: string): Promise<void> {
    const db = this.getDb();
    
    const query = `
      UPDATE user_journals SET
        is_deleted = 1,
        needs_sync = 1,
        updated_at = ?
      WHERE id = ?;
    `;

    await db.run(query, [new Date().toISOString(), id]);
    console.log('[JournalsRepo] Soft deleted journal:', id);
  }

  /**
   * Hard delete journal (for cleanup after successful server delete)
   */
  async hardDelete(id: string): Promise<void> {
    const db = this.getDb();
    
    const query = `DELETE FROM user_journals WHERE id = ?;`;
    await db.run(query, [id]);
    console.log('[JournalsRepo] Hard deleted journal:', id);
  }

  /**
   * Get all journals pending sync (needs_sync=1)
   */
  async getPendingSync(userId: string): Promise<LocalJournal[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM user_journals 
      WHERE user_id = ? AND needs_sync = 1
      ORDER BY updated_at ASC;
    `;
    
    const result = await db.query(query, [userId]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToJournal(row));
  }

  /**
   * Mark journal as synced
   * Updates server_id, sets needs_sync=0, records synced_at
   */
  async markAsSynced(clientId: string, serverId: string): Promise<void> {
    const db = this.getDb();
    
    const query = `
      UPDATE user_journals SET
        server_id = ?,
        needs_sync = 0,
        synced_at = ?
      WHERE id = ?;
    `;

    await db.run(query, [serverId, new Date().toISOString(), clientId]);
    console.log('[JournalsRepo] Marked as synced:', clientId, '→', serverId);
  }

  /**
   * Upsert journal from server (for initial sync or conflict resolution)
   * Uses server updated_at to compare with local version
   */
  async upsertFromServer(serverJournal: any): Promise<void> {
    const db = this.getDb();
    
    // Check if journal exists by server_id
    const existing = serverJournal.id ? await this.getByServerId(serverJournal.id) : null;

    if (existing) {
      // Compare timestamps - only update if server is newer
      if (new Date(serverJournal.updated_at) > new Date(existing.updated_at)) {
        const query = `
          UPDATE user_journals SET
            title = ?, content = ?, content_html = ?,
            mood_score = ?, mood_label = ?, collection_id = ?,
            updated_at = ?, needs_sync = 0, synced_at = ?
          WHERE id = ?;
        `;

        await db.run(query, [
          serverJournal.title || null,
          serverJournal.content,
          serverJournal.content_html || null,
          serverJournal.mood_score || null,
          serverJournal.mood_label || null,
          serverJournal.collection_id || null,
          serverJournal.updated_at,
          new Date().toISOString(),
          existing.id,
        ]);

        console.log('[JournalsRepo] Updated from server:', existing.id);
      } else {
        console.log('[JournalsRepo] Local version is newer, skipping update:', existing.id);
      }
    } else {
      // Insert new journal from server
      const query = `
        INSERT INTO user_journals (
          id, server_id, user_id, collection_id, title, content, content_html,
          mood_score, mood_label, created_at, updated_at, needs_sync, synced_at, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0);
      `;

      await db.run(query, [
        this.generateClientId(),
        serverJournal.id,
        serverJournal.user_id,
        serverJournal.collection_id || null,
        serverJournal.title || null,
        serverJournal.content,
        serverJournal.content_html || null,
        serverJournal.mood_score || null,
        serverJournal.mood_label || null,
        serverJournal.created_at,
        serverJournal.updated_at,
        new Date().toISOString(),
      ]);

      console.log('[JournalsRepo] Inserted from server:', serverJournal.id);
    }
  }

  /**
   * Search journals by text content
   */
  async search(userId: string, searchText: string): Promise<LocalJournal[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM user_journals 
      WHERE user_id = ? 
        AND is_deleted = 0
        AND (title LIKE ? OR content LIKE ?)
      ORDER BY created_at DESC
      LIMIT 50;
    `;
    
    const searchPattern = `%${searchText}%`;
    const result = await db.query(query, [userId, searchPattern, searchPattern]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToJournal(row));
  }

  /**
   * Helper: Map SQLite row to LocalJournal type
   */
  private mapRowToJournal(row: any): LocalJournal {
    return {
      id: row.id,
      server_id: row.server_id,
      user_id: row.user_id,
      collection_id: row.collection_id,
      title: row.title,
      content: row.content,
      content_html: row.content_html,
      mood_score: row.mood_score,
      mood_label: row.mood_label,
      created_at: row.created_at,
      updated_at: row.updated_at,
      needs_sync: row.needs_sync,
      synced_at: row.synced_at,
      is_deleted: row.is_deleted,
    };
  }

  /**
   * Helper: Generate client-side UUID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default new JournalsRepository();
