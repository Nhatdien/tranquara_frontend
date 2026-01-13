/**
 * SQLite Service
 * 
 * Manages SQLite database initialization, connections, and migrations
 * Singleton pattern for app-wide database access
 */

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { DB_NAME, DB_VERSION, MIGRATIONS } from './schema';

export class SQLiteService {
  private static instance: SQLiteService;
  private sqliteConnection: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;
  private platform: string;

  private constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    this.platform = Capacitor.getPlatform();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }

  /**
   * Initialize database connection and run migrations
   * Should be called after user logs in
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized && this.db) {
      console.log('[SQLite] Already initialized');
      return;
    }

    try {
      console.log('[SQLite] Initializing database...');

      // Initialize SQLite plugin (required for web platform)
      if (this.platform === 'web') {
        await this.sqliteConnection.initWebStore();
      }

      // Create/open database connection
      const ret = await this.sqliteConnection.checkConnectionsConsistency();
      const isConn = (await this.sqliteConnection.isConnection(DB_NAME, false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqliteConnection.retrieveConnection(DB_NAME, false);
      } else {
        this.db = await this.sqliteConnection.createConnection(
          DB_NAME,
          false, // encrypted
          'no-encryption', // mode
          DB_VERSION,
          false // readonly
        );
      }

      // Open database
      await this.db.open();

      // Run migrations
      await this.runMigrations();

      this.isInitialized = true;
      console.log('[SQLite] Database initialized successfully');
    } catch (error) {
      console.error('[SQLite] Initialization error:', error);
      throw new Error(`Failed to initialize SQLite database: ${error}`);
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    try {
      // Get current database version
      const result = await this.db.query('PRAGMA user_version;');
      const currentVersion = result.values?.[0]?.user_version || 0;

      console.log(`[SQLite] Current DB version: ${currentVersion}, Target: ${DB_VERSION}`);

      // Apply migrations
      for (let version = currentVersion + 1; version <= DB_VERSION; version++) {
        const migrationScripts = MIGRATIONS[version];
        if (migrationScripts) {
          console.log(`[SQLite] Applying migration v${version}...`);
          
          for (const script of migrationScripts) {
            await this.db.execute(script);
          }

          // Update version
          await this.db.execute(`PRAGMA user_version = ${version};`);
        }
      }

      console.log('[SQLite] Migrations completed');
    } catch (error) {
      console.error('[SQLite] Migration error:', error);
      throw error;
    }
  }

  /**
   * Get database connection
   * Throws error if not initialized
   */
  public getConnection(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Close database connection
   * Call when user logs out
   */
  public async close(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.close();
      await this.sqliteConnection.closeConnection(DB_NAME, false);
      this.db = null;
      this.isInitialized = false;
      console.log('[SQLite] Database closed');
    } catch (error) {
      console.error('[SQLite] Error closing database:', error);
    }
  }

  /**
   * Clear all local data (for testing or logout)
   * CAUTION: This deletes all offline data!
   */
  public async clearAllData(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.execute('DELETE FROM user_journals;');
      await this.db.execute('DELETE FROM journal_templates;');
      await this.db.execute('DELETE FROM sync_queue;');
      console.log('[SQLite] All data cleared');
    } catch (error) {
      console.error('[SQLite] Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Get database statistics for debugging
   */
  public async getStats(): Promise<{
    journalCount: number;
    templateCount: number;
    pendingSyncCount: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const journals = await this.db.query('SELECT COUNT(*) as count FROM user_journals WHERE is_deleted = 0;');
      const templates = await this.db.query('SELECT COUNT(*) as count FROM journal_templates;');
      const pending = await this.db.query('SELECT COUNT(*) as count FROM user_journals WHERE needs_sync = 1;');

      return {
        journalCount: journals.values?.[0]?.count || 0,
        templateCount: templates.values?.[0]?.count || 0,
        pendingSyncCount: pending.values?.[0]?.count || 0,
      };
    } catch (error) {
      console.error('[SQLite] Error getting stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default SQLiteService.getInstance();
