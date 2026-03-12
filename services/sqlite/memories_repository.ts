/**
 * AI Memories Repository
 * 
 * SQLite operations for ai_memories cache table.
 * Provides offline-first access to AI-generated memories.
 * Memories are server-authoritative — local is a read cache only.
 */

import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import SQLiteService from './sqlite_service';

export interface LocalAIMemory {
  id: string;
  user_id: string;
  content: string;
  category: string;
  source_journal_ids: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
  cached_at: string;
}

export class MemoriesRepository {
  private getDb(): SQLiteDBConnection {
    if (!SQLiteService.isReady()) {
      throw new Error('Database not initialized');
    }
    return SQLiteService.getConnection();
  }

  /**
   * Get all cached memories for a user, optionally filtered by category
   */
  async getAll(userId: string, category?: string): Promise<LocalAIMemory[]> {
    const db = this.getDb();

    let query: string;
    let params: string[];

    if (category) {
      query = `SELECT * FROM ai_memories WHERE user_id = ? AND category = ? ORDER BY updated_at DESC;`;
      params = [userId, category];
    } else {
      query = `SELECT * FROM ai_memories WHERE user_id = ? ORDER BY updated_at DESC;`;
      params = [userId];
    }

    const result = await db.query(query, params);
    if (!result.values || result.values.length === 0) return [];
    return result.values.map(row => this.mapRow(row));
  }

  /**
   * Replace all cached memories with fresh server data.
   * This is a full cache refresh (delete + insert).
   */
  async cacheAll(userId: string, memories: any[]): Promise<void> {
    const db = this.getDb();
    const now = new Date().toISOString();

    // Clear existing cache for this user
    await db.run('DELETE FROM ai_memories WHERE user_id = ?;', [userId]);

    // Insert new memories
    for (const memory of memories) {
      const sourceIds = Array.isArray(memory.source_journal_ids)
        ? JSON.stringify(memory.source_journal_ids)
        : memory.source_journal_ids || '[]';

      await db.run(
        `INSERT OR REPLACE INTO ai_memories 
          (id, user_id, content, category, source_journal_ids, confidence, created_at, updated_at, cached_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          memory.id,
          userId,
          memory.content,
          memory.category,
          sourceIds,
          memory.confidence ?? 0,
          memory.created_at || now,
          memory.updated_at || now,
          now,
        ]
      );
    }

    // Persist to IndexedDB on web
    await SQLiteService.saveToStore();
  }

  /**
   * Remove a single memory from local cache
   */
  async deleteById(memoryId: string): Promise<void> {
    const db = this.getDb();
    await db.run('DELETE FROM ai_memories WHERE id = ?;', [memoryId]);
    await SQLiteService.saveToStore();
  }

  /**
   * Clear all memories for a user (e.g., on logout)
   */
  async clearAll(userId: string): Promise<void> {
    const db = this.getDb();
    await db.run('DELETE FROM ai_memories WHERE user_id = ?;', [userId]);
    await SQLiteService.saveToStore();
  }

  /**
   * Get count of cached memories
   */
  async getCount(userId: string): Promise<number> {
    const db = this.getDb();
    const result = await db.query(
      'SELECT COUNT(*) as count FROM ai_memories WHERE user_id = ?;',
      [userId]
    );
    return result.values?.[0]?.count || 0;
  }

  /**
   * Map a database row to LocalAIMemory
   */
  private mapRow(row: any): LocalAIMemory {
    let sourceIds: string[] = [];
    try {
      sourceIds = typeof row.source_journal_ids === 'string'
        ? JSON.parse(row.source_journal_ids)
        : row.source_journal_ids || [];
    } catch {
      sourceIds = [];
    }

    return {
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      category: row.category,
      source_journal_ids: sourceIds,
      confidence: row.confidence ?? 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      cached_at: row.cached_at,
    };
  }
}

// Export singleton instance
export default new MemoriesRepository();
