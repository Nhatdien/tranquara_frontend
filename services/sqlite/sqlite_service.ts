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
      console.log('[SQLite] Initializing database...', this.platform);

      // Initialize SQLite plugin (required for web platform)
      if (this.platform === 'web') {
        // Wait for jeep-sqlite custom element to be defined
        await customElements.whenDefined('jeep-sqlite');
        console.log('[SQLite] jeep-sqlite element is defined');
        
        const jeepSqliteEl = document.querySelector('jeep-sqlite');
        if (!jeepSqliteEl) {
          throw new Error('jeep-sqlite element not found in DOM');
        }
        
        await this.sqliteConnection.initWebStore();
        console.log('[SQLite] initWebStore completed');
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
      console.log('[SQLite] Database opened');

      // Check if tables exist, if not force migration
      const tablesExist = await this.checkTablesExist();
      if (!tablesExist) {
        console.log('[SQLite] Tables do not exist - resetting version and running migrations');
        await this.db.execute('PRAGMA user_version = 0;');
      }

      // Run migrations
      await this.runMigrations();

      // Verify tables were created
      const tablesCreated = await this.checkTablesExist();
      if (!tablesCreated) {
        throw new Error('Tables were not created after migrations');
      }

      // Save to IndexedDB on web platform by closing and reopening the connection
      if (this.platform === 'web') {
        try {
          // Close the connection to persist to IndexedDB
          await this.sqliteConnection.closeConnection(DB_NAME, false);
          console.log('[SQLite] Connection closed to persist to IndexedDB');
          
          // Reopen the connection
          this.db = await this.sqliteConnection.createConnection(
            DB_NAME,
            false,
            'no-encryption',
            DB_VERSION,
            false
          );
          await this.db.open();
          console.log('[SQLite] Connection reopened');
        } catch (saveError) {
          console.warn('[SQLite] Could not persist to store:', saveError);
        }
      }

      this.isInitialized = true;
      console.log('[SQLite] Database initialized successfully');
    } catch (error) {
      console.error('[SQLite] Initialization error:', error);
      throw new Error(`Failed to initialize SQLite database: ${error}`);
    }
  }

  /**
   * Check if required tables exist
   */
  private async checkTablesExist(): Promise<boolean> {
    if (!this.db) return false;
    
    try {
      const result = await this.db.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='user_journals';"
      );
      const exists = (result.values?.length || 0) > 0;
      console.log('[SQLite] user_journals table exists:', exists);
      return exists;
    } catch (error) {
      console.error('[SQLite] Error checking tables:', error);
      return false;
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
          console.log(`[SQLite] Applying migration v${version}... (${migrationScripts.length} scripts)`);
          
          for (let i = 0; i < migrationScripts.length; i++) {
            const script = migrationScripts[i];
            console.log(`[SQLite] Running script ${i + 1}/${migrationScripts.length}...`);
            try {
              const shouldSkip = await this.shouldSkipScript(script);
              if (shouldSkip) {
                console.log(`[SQLite] Script ${i + 1} skipped (already applied)`);
                continue;
              }

              await this.db.execute(script);
              console.log(`[SQLite] Script ${i + 1} completed`);
            } catch (scriptError) {
              console.error(`[SQLite] Script ${i + 1} failed:`, script.substring(0, 100), scriptError);
              throw scriptError;
            }
          }

          // Update version
          await this.db.execute(`PRAGMA user_version = ${version};`);
          console.log(`[SQLite] Migration v${version} completed`);
        }
      }

      console.log('[SQLite] All migrations completed');
    } catch (error) {
      console.error('[SQLite] Migration error:', error);
      throw error;
    }
  }

  /**
   * Skip idempotent migration scripts when the schema already contains the target column.
   * Currently supports: ALTER TABLE <table> ADD COLUMN <column> ...
   */
  private async shouldSkipScript(script: string): Promise<boolean> {
    if (!this.db) return false;

    const match = script.match(/^\s*ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)/i);
    if (!match) return false;

    const table = match[1];
    const column = match[2];

    try {
      const result = await this.db.query(`PRAGMA table_info(${table});`);
      const exists = (result.values || []).some((row: any) => row.name === column);
      return exists;
    } catch (error) {
      console.warn('[SQLite] Failed to check column existence:', table, column, error);
      return false;
    }
  }

  /**
   * Save database to IndexedDB store (required for web platform persistence)
   * Uses close/reopen pattern as saveToStore API has issues with connection tracking
   */
  public async saveToStore(): Promise<void> {
    if (this.platform === 'web' && this.db && this.isInitialized) {
      try {
        // Close connection to persist to IndexedDB
        await this.sqliteConnection.closeConnection(DB_NAME, false);
        
        // Reopen the connection
        this.db = await this.sqliteConnection.createConnection(
          DB_NAME,
          false,
          'no-encryption',
          DB_VERSION,
          false
        );
        await this.db.open();
        console.log('[SQLite] Database persisted to IndexedDB');
      } catch (error) {
        console.error('[SQLite] Error persisting to store:', error);
      }
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
