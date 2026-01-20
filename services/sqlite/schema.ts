/**
 * SQLite Database Schema Definitions
 * 
 * Mirrors PostgreSQL schema with additional sync metadata for offline-first architecture
 */

// User Journals table schema
export const CREATE_USER_JOURNALS_TABLE = `
CREATE TABLE IF NOT EXISTS user_journals (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT NOT NULL,
  collection_id TEXT,
  title TEXT,
  content TEXT NOT NULL,
  content_html TEXT,
  mood_score INTEGER CHECK (mood_score >= 0 AND mood_score <= 10),
  mood_label TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  is_deleted INTEGER DEFAULT 0
);`;

export const CREATE_USER_JOURNALS_INDEX_USER_ID = `
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON user_journals(user_id);`;

export const CREATE_USER_JOURNALS_INDEX_NEEDS_SYNC = `
CREATE INDEX IF NOT EXISTS idx_journals_needs_sync ON user_journals(needs_sync);`;

export const CREATE_USER_JOURNALS_INDEX_CREATED_AT = `
CREATE INDEX IF NOT EXISTS idx_journals_created_at ON user_journals(created_at DESC);`;

export const CREATE_USER_JOURNALS_INDEX_SERVER_ID = `
CREATE INDEX IF NOT EXISTS idx_journals_server_id ON user_journals(server_id);`;

// Journal Templates (Collections) cache table schema
export const CREATE_JOURNAL_TEMPLATES_TABLE = `
CREATE TABLE IF NOT EXISTS journal_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  slide_groups TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  cached_at TEXT NOT NULL
);`;

export const CREATE_JOURNAL_TEMPLATES_INDEX_CATEGORY = `
CREATE INDEX IF NOT EXISTS idx_templates_category ON journal_templates(category);`;

export const CREATE_JOURNAL_TEMPLATES_INDEX_ACTIVE = `
CREATE INDEX IF NOT EXISTS idx_templates_active ON journal_templates(is_active);`;

// Sync Queue metadata table (optional - for advanced queue tracking)
export const CREATE_SYNC_QUEUE_TABLE = `
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(entity_type, entity_id)
);`;

// Database version tracking
export const DB_VERSION = 1;
export const DB_NAME = 'tranquara_journals.db';

/**
 * Initialize all tables and indexes
 */
export const INITIALIZATION_SCRIPTS = [
  CREATE_USER_JOURNALS_TABLE,
  CREATE_USER_JOURNALS_INDEX_USER_ID,
  CREATE_USER_JOURNALS_INDEX_NEEDS_SYNC,
  CREATE_USER_JOURNALS_INDEX_CREATED_AT,
  CREATE_USER_JOURNALS_INDEX_SERVER_ID,
  CREATE_JOURNAL_TEMPLATES_TABLE,
  CREATE_JOURNAL_TEMPLATES_INDEX_CATEGORY,
  CREATE_JOURNAL_TEMPLATES_INDEX_ACTIVE,
  CREATE_SYNC_QUEUE_TABLE,
];

/**
 * Migration scripts for future schema updates
 * Add new migrations here as array items
 */
export const MIGRATIONS: Record<number, string[]> = {
  1: INITIALIZATION_SCRIPTS,
  // Future migrations:
  // 2: ['ALTER TABLE ...', 'CREATE INDEX ...'],
};
