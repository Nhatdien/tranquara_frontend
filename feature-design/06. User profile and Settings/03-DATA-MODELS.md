# ⚙️ Settings - Data Models

This document defines all database schemas, local storage structures, and data relationships for the Settings feature.

---

## Table of Contents

1. [Database Schema (PostgreSQL)](#database-schema-postgresql)
2. [Local Storage (Capacitor Preferences + IndexedDB)](#local-storage-capacitor-preferences--indexeddb)
3. [Secure Storage (Keychain/Keystore)](#secure-storage-keychainKeystore)
4. [Sample Queries](#sample-queries)
5. [Indexes and Performance](#indexes-and-performance)
6. [Data Migration](#data-migration)

---

## Database Schema (PostgreSQL)

### 1. `user_informations` Table (Extended)

Settings stored in JSONB column for flexibility.

_[SQL code implementation removed - to be added during development]_

**Example Row**:
_[JSON code implementation removed - to be added during development]_

---

### 2. `ai_memories` Table (NEW)

Stores AI-generated insights about the user, extracted periodically from journals.

```sql
CREATE TABLE IF NOT EXISTS ai_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_informations(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,                    -- Short factual statement (e.g., "I value my family.")
    category VARCHAR(50) NOT NULL DEFAULT 'preferences',
        -- One of: values, habits, relationships, goals, struggles, preferences, patterns, growth
    source_journal_ids UUID[] DEFAULT '{}',   -- Journals this insight was derived from
    confidence REAL NOT NULL DEFAULT 0.5,     -- AI confidence score (0.0 - 1.0)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_memories_user_id ON ai_memories(user_id);
CREATE INDEX idx_ai_memories_category ON ai_memories(user_id, category);
CREATE INDEX idx_ai_memories_created ON ai_memories(user_id, created_at DESC);
```

**Category Enum Values**:
| Category | Description | Example |
|----------|-------------|---------|
| `values` | Core personal values | "I value my family." |
| `habits` | Behavioral patterns | "I journal most in the evenings." |
| `relationships` | Social connections | "I have a close relationship with my sister." |
| `goals` | Aspirations and objectives | "I want to manage anxiety better." |
| `struggles` | Challenges and difficulties | "I tend to suppress emotions at work." |
| `preferences` | Likes and dislikes | "I enjoy learning new things." |
| `patterns` | Observed behavioral/emotional patterns | "Sleep quality drops when stressed about deadlines." |
| `growth` | Progress and positive changes | "Making progress on setting boundaries." |

**Example Rows**:
```json
[
  {
    "id": "a1b2c3d4-...",
    "user_id": "user-uuid-...",
    "content": "I value my family.",
    "category": "values",
    "source_journal_ids": ["journal-1", "journal-5"],
    "confidence": 0.92,
    "created_at": "2026-03-04T00:00:00Z",
    "updated_at": "2026-03-04T00:00:00Z"
  },
  {
    "id": "e5f6g7h8-...",
    "user_id": "user-uuid-...",
    "content": "Sleep quality drops when stressed about deadlines.",
    "category": "patterns",
    "source_journal_ids": ["journal-3", "journal-7", "journal-12"],
    "confidence": 0.78,
    "created_at": "2026-03-04T12:00:00Z",
    "updated_at": "2026-03-04T12:00:00Z"
  }
]
```

### Qdrant Collection: `user_memories`

Memories are also indexed into Qdrant for RAG injection during journal follow-up question generation.

```python
# Collection config
MEMORY_COLLECTION = "user_memories"
VECTOR_SIZE = 1536          # OpenAI text-embedding-ada-002
DISTANCE_METRIC = "Cosine"

# Document structure indexed into Qdrant
{
    "page_content": "I value my family.",     # Embedded text
    "metadata": {
        "memory_id": "uuid",                  # PostgreSQL primary key
        "user_id": "uuid",                    # For filtering
        "category": "values",
        "confidence": 0.92,
        "created_at": "2026-03-04T00:00:00Z",
        "type": "memory"                      # Distinguishes from journal vectors
    }
}
```

**RAG Retrieval**: When generating follow-up questions, the AI processor queries BOTH:
- `journal_entries` collection → past journal context
- `user_memories` collection → stable user insights

---

### 3. `notification_schedules` Table (NEW)

Tracks scheduled notifications per device (device-specific times).

_[SQL code implementation removed - to be added during development]_

**Example Rows** (same user, 2 devices):
_[JSON code implementation removed - to be added during development]_

---

### 4. `export_jobs` Table (NEW)

Tracks background export jobs for large data exports.

_[SQL code implementation removed - to be added during development]_

**Example Row**:
_[JSON code implementation removed - to be added during development]_

---

## Local Storage (Capacitor Preferences + IndexedDB)

### Mobile (Capacitor Preferences)

**Storage**: Capacitor Preferences API (secure key-value storage)

**Table: `settings_global`** (synced settings)
_[JSON code implementation removed - to be added during development]_

**Table: `settings_local`** (device-specific, not synced)
_[JSON code implementation removed - to be added during development]_

**Table: `ai_memory_cache`** (cached AI memories — fetched from API on demand)

```typescript
// Pinia store state (no local persistence — always fetched fresh)
interface AIMemory {
  id: string;
  user_id: string;
  content: string;
  category: 'values' | 'habits' | 'relationships' | 'goals' | 'struggles' | 'preferences' | 'patterns' | 'growth';
  source_journal_ids: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
}

interface MemoriesState {
  memories: AIMemory[];
  loading: boolean;
  lastFetchedAt: string | null;
}
```

### Web (IndexedDB)

**Object Store: `settingsGlobal`**
_[TYPESCRIPT code implementation removed - to be added during development]_

**Object Store: `settingsLocal`**
_[TYPESCRIPT code implementation removed - to be added during development]_

**Object Store: `aiMemoryCache`**
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## Secure Storage (Keychain/Keystore)

### iOS Keychain

_[TYPESCRIPT code implementation removed - to be added during development]_

**Keychain Items**:
- `pin_hash` (string): bcrypt-hashed PIN
- `biometric_enabled` (string): "true" or "false"
- `last_unlock_time` (string): Unix timestamp
- `access_token` (string): User session token

### Android Keystore

Same API as iOS via Capacitor SecureStorage, backed by Android Keystore system.

**Security Features**:
- Hardware-backed encryption (if available)
- Data tied to app signing key
- Cannot be extracted without device unlock
- Survives app uninstall/reinstall (optional)

---

## Sample Queries

### 1. Get User Settings

_[SQL code implementation removed - to be added during development]_

**Result**:
_[JSON code implementation removed - to be added during development]_

---

### 2. Update Specific Setting (JSONB Path)

_[SQL code implementation removed - to be added during development]_

_[SQL code implementation removed - to be added during development]_

_[SQL code implementation removed - to be added during development]_

---

### 3. Get AI Memories (All, by User)

```sql
SELECT id, content, category, source_journal_ids, confidence, created_at, updated_at
FROM ai_memories
WHERE user_id = $1
ORDER BY created_at DESC;
```

### 4. Get AI Memories (Filtered by Category)

```sql
SELECT id, content, category, source_journal_ids, confidence, created_at, updated_at
FROM ai_memories
WHERE user_id = $1 AND category = $2
ORDER BY created_at DESC;
```

### 5. Delete Single AI Memory (Hard Delete)

```sql
DELETE FROM ai_memories WHERE id = $1 AND user_id = $2;
```

**Note**: Also requires deletion from Qdrant `user_memories` collection by `memory_id`.

### 6. Batch Insert AI Memories

```sql
INSERT INTO ai_memories (user_id, content, category, source_journal_ids, confidence)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT DO NOTHING
RETURNING id, content, category;
```

---

### 5. Schedule Notification (Device-Specific)

_[SQL code implementation removed - to be added during development]_

---

### 6. Get Notification Schedules for Device

_[SQL code implementation removed - to be added during development]_

---

### 7. Mark Account for Deletion (Grace Period)

_[SQL code implementation removed - to be added during development]_

---

### 8. Recover Deleted Account (Within Grace Period)

_[SQL code implementation removed - to be added during development]_

---

### 9. Find Accounts for Permanent Deletion (Cron Job)

_[SQL code implementation removed - to be added during development]_

---

### 10. Create Export Job

_[SQL code implementation removed - to be added during development]_

---

### 11. Update Export Job Status

_[SQL code implementation removed - to be added during development]_

---

### 12. Get Settings Changed Since Last Sync

_[SQL code implementation removed - to be added during development]_

---

## Indexes and Performance

### Primary Indexes

_[SQL code implementation removed - to be added during development]_

### JSONB Indexes (for complex queries)

_[SQL code implementation removed - to be added during development]_

**Query using JSONB index**:
_[SQL code implementation removed - to be added during development]_

---

## Data Migration

### v1.0 → v1.1 (Add AI Memories Support)

```sql
-- UP migration
CREATE TABLE IF NOT EXISTS ai_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_informations(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'preferences',
    source_journal_ids UUID[] DEFAULT '{}',
    confidence REAL NOT NULL DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_memories_user_id ON ai_memories(user_id);
CREATE INDEX idx_ai_memories_category ON ai_memories(user_id, category);
CREATE INDEX idx_ai_memories_created ON ai_memories(user_id, created_at DESC);

-- DOWN migration
DROP TABLE IF EXISTS ai_memories;
```

### v1.1 → v1.2 (Add Device-Specific Notifications)

_[SQL code implementation removed - to be added during development]_

### v1.2 → v1.3 (Add Account Deletion Tracking)

_[SQL code implementation removed - to be added during development]_

---

## Sample Data Sets

### Test User 1: Default Settings

_[JSON code implementation removed - to be added during development]_

### Test User 2: Privacy-Focused

_[JSON code implementation removed - to be added during development]_

### Test User 3: High Engagement

_[JSON code implementation removed - to be added during development]_

---

**Last Updated**: March 4, 2026
