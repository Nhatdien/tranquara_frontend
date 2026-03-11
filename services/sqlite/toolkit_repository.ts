/**
 * Toolkit Repository
 *
 * SQLite CRUD operations for therapy_sessions and homework_items tables.
 * Implements offline-first pattern with sync metadata.
 */

import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { TherapySession, HomeworkItem, PrepPack, UserAffirmation } from '~/types/therapy_toolkit';
import SQLiteService from './sqlite_service';

export class ToolkitRepository {
  private getDb(): SQLiteDBConnection {
    const service = SQLiteService;
    if (!service.isReady()) {
      throw new Error('Database not initialized');
    }
    return service.getConnection();
  }

  private async persistToStore(): Promise<void> {
    await SQLiteService.saveToStore();
  }

  // ─── Sessions ───────────────────────────

  async createSession(session: TherapySession): Promise<TherapySession> {
    const db = this.getDb();

    await db.run(
      `INSERT INTO therapy_sessions
       (id, user_id, session_date, status, mood_before, talking_points, session_priority, prep_pack_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.user_id,
        session.session_date || null,
        session.status,
        session.mood_before || null,
        session.talking_points || null,
        session.session_priority || null,
        session.prep_pack_id || null,
        session.created_at,
        session.updated_at,
      ]
    );

    await this.persistToStore();
    console.log('[ToolkitRepo] Created session:', session.id);
    return session;
  }

  async updateSession(session: Partial<TherapySession> & { id: string }): Promise<void> {
    const db = this.getDb();
    const fields: string[] = [];
    const values: any[] = [];

    const updatable = [
      'session_date', 'status', 'mood_before', 'talking_points',
      'session_priority', 'prep_pack_id', 'mood_after', 'key_takeaways', 'session_rating',
    ] as const;

    for (const key of updatable) {
      if ((session as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push((session as any)[key]);
      }
    }

    if (fields.length === 0) return;

    fields.push('updated_at = ?', 'needs_sync = 1');
    values.push(new Date().toISOString());
    // session.id goes last as the WHERE clause parameter
    values.push(session.id);

    await db.run(
      `UPDATE therapy_sessions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    await this.persistToStore();
    console.log('[ToolkitRepo] Updated session:', session.id);
  }

  async getSessionsByUser(userId: string): Promise<TherapySession[]> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM therapy_sessions WHERE user_id = ? AND is_deleted = 0 ORDER BY session_date DESC`,
      [userId]
    );
    return (result.values || []) as TherapySession[];
  }

  async getSessionById(id: string): Promise<TherapySession | null> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM therapy_sessions WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    if (!result.values || result.values.length === 0) return null;
    return result.values[0] as TherapySession;
  }

  async deleteSession(id: string): Promise<void> {
    const db = this.getDb();
    await db.run(
      `UPDATE therapy_sessions SET is_deleted = 1, needs_sync = 1, updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    );
    await this.persistToStore();
    console.log('[ToolkitRepo] Soft-deleted session:', id);
  }

  async getPendingSyncSessions(userId: string): Promise<TherapySession[]> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM therapy_sessions WHERE user_id = ? AND needs_sync = 1`,
      [userId]
    );
    return (result.values || []) as TherapySession[];
  }

  async markSessionSynced(localId: string, serverId: string): Promise<void> {
    const db = this.getDb();
    await db.run(
      `UPDATE therapy_sessions SET server_id = ?, needs_sync = 0, synced_at = ? WHERE id = ?`,
      [serverId, new Date().toISOString(), localId]
    );
    await this.persistToStore();
  }

  // ─── Homework ───────────────────────────

  async createHomework(item: HomeworkItem): Promise<HomeworkItem> {
    const db = this.getDb();

    await db.run(
      `INSERT INTO homework_items (id, session_id, user_id, content, completed, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [item.id, item.session_id, item.user_id, item.content, item.created_at]
    );

    await this.persistToStore();
    console.log('[ToolkitRepo] Created homework:', item.id);
    return item;
  }

  async toggleHomework(id: string, completed: boolean): Promise<void> {
    const db = this.getDb();
    await db.run(
      `UPDATE homework_items SET completed = ?, completed_at = ?, needs_sync = 1 WHERE id = ?`,
      [completed ? 1 : 0, completed ? new Date().toISOString() : null, id]
    );
    await this.persistToStore();
  }

  async deleteHomework(id: string): Promise<void> {
    const db = this.getDb();
    await db.run(`DELETE FROM homework_items WHERE id = ?`, [id]);
    await this.persistToStore();
  }

  async getHomeworkBySession(sessionId: string): Promise<HomeworkItem[]> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM homework_items WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId]
    );
    return (result.values || []) as HomeworkItem[];
  }

  async getHomeworkByUser(userId: string): Promise<HomeworkItem[]> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM homework_items WHERE user_id = ? ORDER BY created_at ASC`,
      [userId]
    );
    return (result.values || []) as HomeworkItem[];
  }

  async getPendingSyncHomework(userId: string): Promise<HomeworkItem[]> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM homework_items WHERE user_id = ? AND needs_sync = 1`,
      [userId]
    );
    return (result.values || []) as HomeworkItem[];
  }

  async markHomeworkSynced(localId: string, serverId: string): Promise<void> {
    const db = this.getDb();
    await db.run(
      `UPDATE homework_items SET server_id = ?, needs_sync = 0, synced_at = ? WHERE id = ?`,
      [serverId, new Date().toISOString(), localId]
    );
    await this.persistToStore();
  }

  // ─── Prep Packs ─────────────────────────

  async savePrepPack(pack: PrepPack): Promise<void> {
    const db = this.getDb();

    await db.run(
      `INSERT OR REPLACE INTO prep_packs
       (id, user_id, date_range_start, date_range_end, mood_overview, key_themes,
        emotional_highlights, patterns, discussion_points, growth_moments,
        personal_notes, journal_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pack.id,
        pack.user_id,
        pack.date_range_start,
        pack.date_range_end,
        JSON.stringify(pack.mood_overview),
        JSON.stringify(pack.key_themes),
        JSON.stringify(pack.emotional_highlights),
        JSON.stringify(pack.patterns),
        JSON.stringify(pack.discussion_points),
        JSON.stringify(pack.growth_moments),
        pack.personal_notes || null,
        pack.journal_count,
        pack.created_at,
      ]
    );

    await this.persistToStore();
    console.log('[ToolkitRepo] Saved prep pack:', pack.id);
  }

  async getPrepPacksByUser(userId: string): Promise<PrepPack[]> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM prep_packs WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    return (result.values || []).map((row: any) => ({
      ...row,
      mood_overview: row.mood_overview ? JSON.parse(row.mood_overview) : null,
      key_themes: row.key_themes ? JSON.parse(row.key_themes) : [],
      emotional_highlights: row.emotional_highlights ? JSON.parse(row.emotional_highlights) : [],
      patterns: row.patterns ? JSON.parse(row.patterns) : [],
      discussion_points: row.discussion_points ? JSON.parse(row.discussion_points) : [],
      growth_moments: row.growth_moments ? JSON.parse(row.growth_moments) : [],
    })) as PrepPack[];
  }

  async getPrepPackById(id: string): Promise<PrepPack | null> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM prep_packs WHERE id = ?`,
      [id]
    );

    if (!result.values || result.values.length === 0) return null;

    const row = result.values[0] as any;
    return {
      ...row,
      mood_overview: row.mood_overview ? JSON.parse(row.mood_overview) : null,
      key_themes: row.key_themes ? JSON.parse(row.key_themes) : [],
      emotional_highlights: row.emotional_highlights ? JSON.parse(row.emotional_highlights) : [],
      patterns: row.patterns ? JSON.parse(row.patterns) : [],
      discussion_points: row.discussion_points ? JSON.parse(row.discussion_points) : [],
      growth_moments: row.growth_moments ? JSON.parse(row.growth_moments) : [],
    } as PrepPack;
  }

  async deletePrepPack(id: string): Promise<void> {
    const db = this.getDb();
    await db.run(`DELETE FROM prep_packs WHERE id = ?`, [id]);
    await this.persistToStore();
    console.log('[ToolkitRepo] Deleted prep pack:', id);
  }

  // --- Affirmations (local-only)

  async getAffirmationsByUser(userId: string): Promise<UserAffirmation[]> {
    const db = this.getDb();
    const result = await db.query(
      `SELECT * FROM user_affirmations WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return (result.values || []).map((row: any) => ({
      ...row,
      is_favorite: !!row.is_favorite,
    })) as UserAffirmation[];
  }

  async addAffirmation(affirmation: UserAffirmation): Promise<UserAffirmation> {
    const db = this.getDb();
    await db.run(
      `INSERT INTO user_affirmations (id, user_id, content, is_favorite, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        affirmation.id,
        affirmation.user_id,
        affirmation.content,
        affirmation.is_favorite ? 1 : 0,
        affirmation.created_at,
      ]
    );
    await this.persistToStore();
    console.log('[ToolkitRepo] Added affirmation:', affirmation.id);
    return affirmation;
  }

  async toggleAffirmationFavorite(id: string, isFavorite: boolean): Promise<void> {
    const db = this.getDb();
    await db.run(
      `UPDATE user_affirmations SET is_favorite = ? WHERE id = ?`,
      [isFavorite ? 1 : 0, id]
    );
    await this.persistToStore();
  }

  async deleteAffirmation(id: string): Promise<void> {
    const db = this.getDb();
    await db.run(`DELETE FROM user_affirmations WHERE id = ?`, [id]);
    await this.persistToStore();
    console.log('[ToolkitRepo] Deleted affirmation:', id);
  }
}
