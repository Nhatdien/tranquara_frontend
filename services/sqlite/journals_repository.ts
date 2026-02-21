/**
 * Journals Repository
 * 
 * SQLite CRUD operations for user_journals table
 * Implements offline-first pattern with sync metadata
 */

import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { LocalJournal } from '~/types/user_journal';
import SQLiteService from './sqlite_service';

/**
 * Filter options for advanced journal queries
 * Matches the server's QueryFilter pattern
 */
export interface JournalFilterOptions {
  searchText?: string;
  collectionId?: string | null;  // undefined = all, null = free-form only, string = specific collection
  startTime?: string;  // ISO date string
  endTime?: string;    // ISO date string
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortDirection?: 'ASC' | 'DESC';
}

export class JournalsRepository {
  private getDb(): SQLiteDBConnection {
    const service = SQLiteService;
    if (!service.isReady()) {
      throw new Error('Database not initialized');
    }
    return service.getConnection();
  }

  /**
   * Save database to IndexedDB store after write operations (web only)
   */
  private async persistToStore(): Promise<void> {
    await SQLiteService.saveToStore();
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

    // Persist to IndexedDB (web platform)
    await this.persistToStore();

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

    // Persist to IndexedDB (web platform)
    await this.persistToStore();

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
    await this.persistToStore();
    console.log('[JournalsRepo] Soft deleted journal:', id);
  }

  /**
   * Hard delete journal (for cleanup after successful server delete)
   */
  async hardDelete(id: string): Promise<void> {
    const db = this.getDb();
    
    const query = `DELETE FROM user_journals WHERE id = ?;`;
    await db.run(query, [id]);
    await this.persistToStore();
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
    await this.persistToStore();
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

    // Persist all changes to IndexedDB (web platform)
    await this.persistToStore();
  }

  /**
   * Search journals by text content
   * Matches server implementation: searches title, content, AND content_html
   * Uses LIKE for SQLite (equivalent to PostgreSQL's plainto_tsquery for basic cases)
   */
  async search(userId: string, searchText: string): Promise<LocalJournal[]> {
    const db = this.getDb();
    
    // Match server: search across title, content, and content_html
    const query = `
      SELECT * FROM user_journals 
      WHERE user_id = ? 
        AND is_deleted = 0
        AND (
          title LIKE ? 
          OR content LIKE ? 
          OR content_html LIKE ?
        )
      ORDER BY created_at DESC
      LIMIT 50;
    `;
    
    const searchPattern = `%${searchText}%`;
    const result = await db.query(query, [userId, searchPattern, searchPattern, searchPattern]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToJournal(row));
  }

  /**
   * Get journals with advanced filtering (matches server's GetListWithFilter)
   * Supports:
   * - Full-text search (title, content, content_html)
   * - Collection filtering (including free-form: collectionId = null)
   * - Time range filtering
   * - Pagination
   * - Sorting
   */
  async getWithFilter(
    userId: string, 
    options: JournalFilterOptions = {}
  ): Promise<{ journals: LocalJournal[]; totalCount: number }> {
    const db = this.getDb();
    
    const {
      searchText,
      collectionId,
      startTime,
      endTime,
      page = 1,
      pageSize = 20,
      sortBy = 'created_at',
      sortDirection = 'DESC'
    } = options;

    // Build dynamic query
    const conditions: string[] = ['user_id = ?', 'is_deleted = 0'];
    const params: any[] = [userId];

    // Search condition (matches server's full-text search on title + content_html)
    if (searchText && searchText.trim()) {
      const searchPattern = `%${searchText.trim()}%`;
      conditions.push('(title LIKE ? OR content LIKE ? OR content_html LIKE ?)');
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Collection filter
    if (collectionId !== undefined) {
      if (collectionId === null) {
        // Free-form journals (no collection)
        conditions.push('collection_id IS NULL');
      } else {
        conditions.push('collection_id = ?');
        params.push(collectionId);
      }
    }

    // Time range filter (matches server's time range implementation)
    if (startTime) {
      conditions.push('created_at >= ?');
      params.push(startTime);
    }
    if (endTime) {
      conditions.push('created_at <= ?');
      params.push(endTime);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * pageSize;

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM user_journals WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const totalCount = countResult.values?.[0]?.total || 0;

    // Data query with sorting and pagination
    const dataQuery = `
      SELECT * FROM user_journals 
      WHERE ${whereClause}
      ORDER BY ${sortBy} ${sortDirection}
      LIMIT ? OFFSET ?
    `;
    const dataResult = await db.query(dataQuery, [...params, pageSize, offset]);

    const journals = dataResult.values?.map(row => this.mapRowToJournal(row)) || [];

    return { journals, totalCount };
  }

  /**
   * Sync journals from server (batch operation)
   * Merges server journals with local SQLite database
   * - New journals (not in local): Insert
   * - Existing journals (by server_id): Update if server is newer
   * - Local-only journals (no server_id): Keep as-is (pending upload)
   * 
   * @param serverJournals - Array of journals from server API
   * @param userId - Current user ID
   * @returns Sync statistics
   */
  async syncFromServer(serverJournals: any[], userId: string): Promise<{
    inserted: number;
    updated: number;
    skipped: number;
  }> {
    const db = this.getDb();
    
    const stats = {
      inserted: 0,
      updated: 0,
      skipped: 0,
    };

    console.log(`[JournalsRepo] Syncing ${serverJournals.length} journals from server...`);

    for (const serverJournal of serverJournals) {
      try {
        // Skip if journal doesn't belong to this user
        if (serverJournal.user_id !== userId) {
          console.log('[JournalsRepo] Skipping journal from different user:', serverJournal.id);
          stats.skipped++;
          continue;
        }

        // Check if journal exists locally by server_id
        const existing = await this.getByServerId(serverJournal.id);

        if (existing) {
          // Compare timestamps - only update if server is newer
          const serverTime = new Date(serverJournal.updated_at).getTime();
          const localTime = new Date(existing.updated_at).getTime();

          if (serverTime > localTime) {
            // Server version is newer - update local
            const updateQuery = `
              UPDATE user_journals SET
                title = ?, content = ?, content_html = ?,
                mood_score = ?, mood_label = ?, collection_id = ?,
                updated_at = ?, needs_sync = 0, synced_at = ?
              WHERE id = ?;
            `;

            await db.run(updateQuery, [
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

            console.log('[JournalsRepo] Updated from server:', existing.id, '(server was newer)');
            stats.updated++;
          } else {
            // Local version is newer or same - skip (will be uploaded later)
            console.log('[JournalsRepo] Local version is newer, skipping:', existing.id);
            stats.skipped++;
          }
        } else {
          // New journal from server - insert
          const insertQuery = `
            INSERT INTO user_journals (
              id, server_id, user_id, collection_id, title, content, content_html,
              mood_score, mood_label, created_at, updated_at, needs_sync, synced_at, is_deleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0);
          `;

          await db.run(insertQuery, [
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
          stats.inserted++;
        }
      } catch (error) {
        console.error('[JournalsRepo] Error syncing journal:', serverJournal.id, error);
        stats.skipped++;
      }
    }

    // Persist all changes to IndexedDB (web platform)
    await this.persistToStore();

    console.log('[JournalsRepo] Server sync complete:', stats);
    return stats;
  }

  /**
   * Get count of journals pending sync
   */
  async getPendingSyncCount(userId: string): Promise<number> {
    const db = this.getDb();
    
    const query = `
      SELECT COUNT(*) as count FROM user_journals 
      WHERE user_id = ? AND needs_sync = 1;
    `;
    
    const result = await db.query(query, [userId]);
    return result.values?.[0]?.count || 0;
  }

  /**
   * Get all server IDs for existing journals (for deduplication check)
   */
  async getAllServerIds(userId: string): Promise<string[]> {
    const db = this.getDb();
    
    const query = `
      SELECT server_id FROM user_journals 
      WHERE user_id = ? AND server_id IS NOT NULL AND is_deleted = 0;
    `;
    
    const result = await db.query(query, [userId]);
    return result.values?.map(row => row.server_id) || [];
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
