/**
 * Templates Repository
 * 
 * SQLite cache operations for journal_templates table
 * Implements read-only cache pattern (templates are server-managed)
 */

import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { LocalTemplate } from '~/types/user_journal';
import SQLiteService from './sqlite_service';

export class TemplatesRepository {
  private getDb(): SQLiteDBConnection {
    const service = SQLiteService;
    if (!service.isReady()) {
      throw new Error('Database not initialized');
    }
    return service.getConnection();
  }

  /**
   * Cache all templates from server
   * Replaces existing cache completely
   */
  async cacheAll(templates: any[]): Promise<void> {
    const db = this.getDb();
    
    try {
      // Clear existing cache
      await db.execute('DELETE FROM journal_templates;');

      // Insert all templates
      const query = `
        INSERT INTO journal_templates (
          id, title, description, category, type, slide_groups, 
          is_active, created_at, updated_at, cached_at,
          title_vi, description_vi, slide_groups_vi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      for (const template of templates) {
        await db.run(query, [
          template.id,
          template.title,
          template.description || null,
          template.category || null,
          template.type || 'journal', // Default to 'journal' for backwards compatibility
          JSON.stringify(template.slide_groups), // Store as JSON string
          template.is_active ? 1 : 0,
          template.created_at || null,
          template.updated_at || null,
          new Date().toISOString(),
          template.title_vi || null,
          template.description_vi || null,
          template.slide_groups_vi ? JSON.stringify(template.slide_groups_vi) : null,
        ]);
      }

      console.log(`[TemplatesRepo] Cached ${templates.length} templates`);
    } catch (error) {
      console.error('[TemplatesRepo] Error caching templates:', error);
      throw error;
    }
  }

  /**
   * Get single template by ID
   */
  async getById(id: string): Promise<LocalTemplate | null> {
    const db = this.getDb();
    
    const query = `SELECT * FROM journal_templates WHERE id = ? AND is_active = 1;`;
    const result = await db.query(query, [id]);

    if (!result.values || result.values.length === 0) {
      return null;
    }

    return this.mapRowToTemplate(result.values[0]);
  }

  /**
   * Get all active templates (sorted by title)
   */
  async getAll(): Promise<LocalTemplate[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM journal_templates 
      WHERE is_active = 1
      ORDER BY title ASC;
    `;
    
    const result = await db.query(query);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToTemplate(row));
  }

  /**
   * Get templates by category
   */
  async getByCategory(category: string): Promise<LocalTemplate[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM journal_templates 
      WHERE category = ? AND is_active = 1
      ORDER BY title ASC;
    `;
    
    const result = await db.query(query, [category]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToTemplate(row));
  }

  /**
   * Check if cache is stale (older than 24 hours)
   */
  async isCacheStale(): Promise<boolean> {
    const db = this.getDb();
    
    const query = `SELECT MAX(cached_at) as last_cached FROM journal_templates;`;
    const result = await db.query(query);

    if (!result.values || result.values.length === 0 || !result.values[0].last_cached) {
      return true; // No cache
    }

    const lastCached = new Date(result.values[0].last_cached);
    const now = new Date();
    const hoursSinceCache = (now.getTime() - lastCached.getTime()) / (1000 * 60 * 60);

    return hoursSinceCache > 24;
  }

  /**
   * Get cache age in hours
   */
  async getCacheAge(): Promise<number | null> {
    const db = this.getDb();
    
    const query = `SELECT MAX(cached_at) as last_cached FROM journal_templates;`;
    const result = await db.query(query);

    if (!result.values || result.values.length === 0 || !result.values[0].last_cached) {
      return null;
    }

    const lastCached = new Date(result.values[0].last_cached);
    const now = new Date();
    return (now.getTime() - lastCached.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Search templates by title or description
   */
  async search(searchText: string): Promise<LocalTemplate[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM journal_templates 
      WHERE is_active = 1
        AND (title LIKE ? OR description LIKE ?)
      ORDER BY title ASC;
    `;
    
    const searchPattern = `%${searchText}%`;
    const result = await db.query(query, [searchPattern, searchPattern]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToTemplate(row));
  }

  /**
   * Clear all cached templates
   */
  async clearCache(): Promise<void> {
    const db = this.getDb();
    
    await db.execute('DELETE FROM journal_templates;');
    console.log('[TemplatesRepo] Cache cleared');
  }

  /**
   * Get templates by type ('journal' or 'learn')
   */
  async getByType(type: 'journal' | 'learn'): Promise<LocalTemplate[]> {
    const db = this.getDb();
    
    const query = `
      SELECT * FROM journal_templates 
      WHERE type = ? AND is_active = 1
      ORDER BY category, title ASC;
    `;
    
    const result = await db.query(query, [type]);

    if (!result.values || result.values.length === 0) {
      return [];
    }

    return result.values.map(row => this.mapRowToTemplate(row));
  }

  /**
   * Helper: Map SQLite row to LocalTemplate type
   */
  private mapRowToTemplate(row: any): LocalTemplate {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: row.type || 'journal',
      slide_groups: JSON.parse(row.slide_groups), // Parse JSON string back to object
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
      cached_at: row.cached_at,
      title_vi: row.title_vi || undefined,
      description_vi: row.description_vi || undefined,
      slide_groups_vi: row.slide_groups_vi ? JSON.parse(row.slide_groups_vi) : undefined,
    };
  }
}

export default new TemplatesRepository();
