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
  type TEXT NOT NULL DEFAULT 'journal',
  slide_groups TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  cached_at TEXT NOT NULL,
  title_vi TEXT,
  description_vi TEXT,
  slide_groups_vi TEXT
);`;

export const CREATE_JOURNAL_TEMPLATES_INDEX_CATEGORY = `
CREATE INDEX IF NOT EXISTS idx_templates_category ON journal_templates(category);`;

export const CREATE_JOURNAL_TEMPLATES_INDEX_ACTIVE = `
CREATE INDEX IF NOT EXISTS idx_templates_active ON journal_templates(is_active);`;

export const CREATE_JOURNAL_TEMPLATES_INDEX_TYPE = `
CREATE INDEX IF NOT EXISTS idx_templates_type ON journal_templates(type);`;

// User Learned Slide Groups table schema (progress tracking for learn-type collections)
export const CREATE_USER_LEARNED_SLIDE_GROUPS_TABLE = `
CREATE TABLE IF NOT EXISTS user_learned_slide_groups (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  slide_group_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  UNIQUE(user_id, collection_id, slide_group_id)
);`;

export const CREATE_USER_LEARNED_INDEX_USER_ID = `
CREATE INDEX IF NOT EXISTS idx_learned_user_id ON user_learned_slide_groups(user_id);`;

export const CREATE_USER_LEARNED_INDEX_COLLECTION = `
CREATE INDEX IF NOT EXISTS idx_learned_collection ON user_learned_slide_groups(user_id, collection_id);`;

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

// Therapy Sessions table schema (Phase 2 — Session Tracker)
export const CREATE_THERAPY_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT NOT NULL,
  session_date TEXT,
  status TEXT DEFAULT 'scheduled',
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  talking_points TEXT,
  session_priority TEXT,
  prep_pack_id TEXT,
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  key_takeaways TEXT,
  session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  is_deleted INTEGER DEFAULT 0
);`;

export const CREATE_THERAPY_SESSIONS_INDEX_USER = `
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON therapy_sessions(user_id);`;

export const CREATE_THERAPY_SESSIONS_INDEX_DATE = `
CREATE INDEX IF NOT EXISTS idx_sessions_date ON therapy_sessions(session_date);`;

// Homework Items table schema (Phase 2 — Session Tracker)
export const CREATE_HOMEWORK_ITEMS_TABLE = `
CREATE TABLE IF NOT EXISTS homework_items (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  FOREIGN KEY (session_id) REFERENCES therapy_sessions(id)
);`;

export const CREATE_HOMEWORK_ITEMS_INDEX_SESSION = `
CREATE INDEX IF NOT EXISTS idx_homework_session ON homework_items(session_id);`;

export const CREATE_HOMEWORK_ITEMS_INDEX_USER = `
CREATE INDEX IF NOT EXISTS idx_homework_user ON homework_items(user_id);`;

// Prep Packs cache table schema (Phase 3 — AI Prep Pack)
export const CREATE_PREP_PACKS_TABLE = `
CREATE TABLE IF NOT EXISTS prep_packs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date_range_start TEXT NOT NULL,
  date_range_end TEXT NOT NULL,
  mood_overview TEXT,
  key_themes TEXT,
  emotional_highlights TEXT,
  patterns TEXT,
  discussion_points TEXT,
  growth_moments TEXT,
  personal_notes TEXT,
  journal_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT
);`;

export const CREATE_PREP_PACKS_INDEX_USER = `
CREATE INDEX IF NOT EXISTS idx_prep_packs_user ON prep_packs(user_id);`;

export const CREATE_PREP_PACKS_INDEX_CREATED = `
CREATE INDEX IF NOT EXISTS idx_prep_packs_created ON prep_packs(created_at DESC);`;

// User affirmations table schema (local-only)
export const CREATE_USER_AFFIRMATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS user_affirmations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_favorite INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);`;

export const CREATE_USER_AFFIRMATIONS_INDEX_USER = `
CREATE INDEX IF NOT EXISTS idx_affirmations_user ON user_affirmations(user_id);`;

export const CREATE_USER_AFFIRMATIONS_INDEX_FAVORITE = `
CREATE INDEX IF NOT EXISTS idx_affirmations_favorite ON user_affirmations(is_favorite);`;

// AI Memories cache table schema
export const CREATE_AI_MEMORIES_TABLE = `
CREATE TABLE IF NOT EXISTS ai_memories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  source_journal_ids TEXT,
  confidence REAL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  cached_at TEXT NOT NULL
);`;

export const CREATE_AI_MEMORIES_INDEX_USER = `
CREATE INDEX IF NOT EXISTS idx_ai_memories_user ON ai_memories(user_id);`;

export const CREATE_AI_MEMORIES_INDEX_CATEGORY = `
CREATE INDEX IF NOT EXISTS idx_ai_memories_category ON ai_memories(user_id, category);`;

// Database version tracking
export const DB_VERSION = 8;
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
  CREATE_JOURNAL_TEMPLATES_INDEX_TYPE,
  CREATE_SYNC_QUEUE_TABLE,
  CREATE_USER_LEARNED_SLIDE_GROUPS_TABLE,
  CREATE_USER_LEARNED_INDEX_USER_ID,
  CREATE_USER_LEARNED_INDEX_COLLECTION,
];

/**
 * Migration scripts for future schema updates
 * Add new migrations here as array items
 */
export const MIGRATIONS: Record<number, string[]> = {
  1: INITIALIZATION_SCRIPTS,
  // v2: Add type column to templates + user_learned_slide_groups table
  2: [
    `ALTER TABLE journal_templates ADD COLUMN type TEXT NOT NULL DEFAULT 'journal';`,
    CREATE_JOURNAL_TEMPLATES_INDEX_TYPE,
    CREATE_USER_LEARNED_SLIDE_GROUPS_TABLE,
    CREATE_USER_LEARNED_INDEX_USER_ID,
    CREATE_USER_LEARNED_INDEX_COLLECTION,
  ],
  // v3: Add multi-language columns for template title/description
  3: [
    `ALTER TABLE journal_templates ADD COLUMN title_vi TEXT;`,
    `ALTER TABLE journal_templates ADD COLUMN description_vi TEXT;`,
  ],
  // v4: Add slide_groups_vi column for Vietnamese slide content
  4: [
    `ALTER TABLE journal_templates ADD COLUMN slide_groups_vi TEXT;`,
  ],
  // v5: Add therapy toolkit tables (sessions + homework)
  5: [
    CREATE_THERAPY_SESSIONS_TABLE,
    CREATE_THERAPY_SESSIONS_INDEX_USER,
    CREATE_THERAPY_SESSIONS_INDEX_DATE,
    CREATE_HOMEWORK_ITEMS_TABLE,
    CREATE_HOMEWORK_ITEMS_INDEX_SESSION,
    CREATE_HOMEWORK_ITEMS_INDEX_USER,
  ],
  // v6: Add prep packs cache table
  6: [
    CREATE_PREP_PACKS_TABLE,
    CREATE_PREP_PACKS_INDEX_USER,
    CREATE_PREP_PACKS_INDEX_CREATED,
  ],
  // v7: Add user affirmations table
  7: [
    CREATE_USER_AFFIRMATIONS_TABLE,
    CREATE_USER_AFFIRMATIONS_INDEX_USER,
    CREATE_USER_AFFIRMATIONS_INDEX_FAVORITE,
  ],
  // v8: Add AI memories cache table
  8: [
    CREATE_AI_MEMORIES_TABLE,
    CREATE_AI_MEMORIES_INDEX_USER,
    CREATE_AI_MEMORIES_INDEX_CATEGORY,
  ],
};
