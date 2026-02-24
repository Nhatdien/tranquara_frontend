# Journaling Feature - Data Models

**Status**: 🟡 In Progress  
**Version**: 1.0  
**Last Updated**: 2025-12-09

---

## 📋 Overview

This document defines all data models for the journaling feature across:
- **PostgreSQL Database** (cloud storage)
- **SQLite Database** (offline-first local storage)
- **TypeScript Interfaces** (frontend type safety)
- **TipTap JSON Structure** (rich text content)

---

## 🗄️ Database Schema

### PostgreSQL Schema (Cloud)

#### Table: `user_journals`

Primary table for storing journal entries with embedded mood tracking and AI interactions.

```sql
CREATE TABLE user_journals (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    collection_id UUID,                    -- Renamed from template_id
    title VARCHAR(255),
    content TEXT NOT NULL,                 -- TipTap JSON with embedded emotions + AI
    content_html TEXT,                     -- Rendered HTML preview
    mood VARCHAR(50),                      -- Extracted from emotion_log slide
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(collection_id) REFERENCES journal_templates(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_journals_user_id ON user_journals(user_id);
CREATE INDEX idx_user_journals_created_at ON user_journals(created_at DESC);
CREATE INDEX idx_user_journals_collection_id ON user_journals(collection_id);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, server-generated |
| `user_id` | UUID | Foreign key to `users` table |
| `collection_id` | UUID | Reference to journal template/collection (nullable for free-form) |
| `title` | VARCHAR(255) | Auto-generated or user-entered title |
| `content` | TEXT | TipTap JSON containing slides, emotions, AI questions |
| `content_html` | TEXT | Rendered HTML for previews/search |
| `mood` | VARCHAR(50) | Extracted mood value (1-10 or label like "Partly Cloudy") |
| `created_at` | TIMESTAMP | Entry creation timestamp |
| `updated_at` | TIMESTAMP | Last modification timestamp |

---

#### Table: `journal_templates` (Collections)

Stores predefined collections with structured slide groups. Collections are split into two types for display in the Library page.

```sql
CREATE TABLE journal_templates (
    id UUID DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),                 -- e.g., "anxiety", "gratitude", "therapy_prep"
    type VARCHAR(50) NOT NULL DEFAULT 'journal',  -- 'learn' or 'journal'
    slide_groups JSONB NOT NULL,           -- Array of slide group definitions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE INDEX idx_journal_templates_category ON journal_templates(category);
CREATE INDEX idx_journal_templates_type ON journal_templates(type);
CREATE INDEX idx_journal_templates_type_category ON journal_templates(type, category);
CREATE INDEX idx_journal_templates_active ON journal_templates(is_active);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | Collection name (e.g., "Understanding Anxiety") |
| `description` | TEXT | What this collection is for |
| `category` | VARCHAR(100) | Grouping category (e.g., "anxiety", "emotions", "gratitude") |
| `type` | VARCHAR(50) | **`'learn'`** = Educational content (Library "Collections" section) · **`'journal'`** = Journaling prompts (Library "Categories" section) |
| `slide_groups` | JSONB | Structured slide definitions (see JSONB structure below) |
| `is_active` | BOOLEAN | Whether collection is available to users |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last modification timestamp |

**`type` Values:**

| Value | Description | Library Section | Example Collections |
|-------|-------------|-----------------|---------------------|
| `learn` | Educational micro-lessons | **"Collections"** — horizontal scroll cards with chapter count & progress | Understanding Anxiety, Understanding Emotions, Introduction to Journaling |
| `journal` | Journaling prompt templates | **"All Categories"** — grouped by category tabs, shows slide groups as cards | Daily Reflection, Gratitude Practice, Stress Journaling |

**`category` Values (shared by both types):**

- `anxiety`, `emotions`, `gratitude`, `mental_health`, `mindfulness`, `relationships`, `self_care`, `sleep`, `therapy_prep`, `journaling_basics`, `stress_management`

Both `learn` and `journal` type collections can share the same category values. For example:
- `type='learn', category='anxiety'` → "Understanding Anxiety" (educational)
- `type='journal', category='anxiety'` → "Anxiety Journaling Prompts" (journaling)

**`slide_groups` JSONB Structure:**

```json
[
  {
    "id": "morning-prep",
    "title": "Morning Preparation",
    "description": "Start your day with intention",
    "slides": [
      {
        "id": "mood-check",
        "type": "emotion_log",
        "question": "How are you feeling this morning?",
        "config": {
          "scale": "1-10",
          "labels": ["Storm", "Rain", "Cloudy", "Partly Cloudy", "Sunny"]
        }
      },
      {
        "id": "sleep-quality",
        "type": "sleep_check",
        "question": "How many hours did you sleep?",
        "config": {
          "min": 0,
          "max": 12
        }
      },
      {
        "id": "intentions",
        "type": "journal_prompt",
        "question": "What are your intentions for today?",
        "config": {
          "allowAI": true,
          "minLength": 20
        }
      },
      {
        "id": "mindfulness-tip",
        "type": "doc",
        "title": "Mindfulness Tip",
        "content": "<h3>Morning Mindfulness</h3><p>Take 3 deep breaths...</p>",
        "source": "https://example.com/mindfulness"
      }
    ]
  }
]
```

---

### SQLite Schema (Local Offline Storage)

SQLite mirrors PostgreSQL schema with additional sync metadata.

#### Table: `user_journals` (Local)

```sql
CREATE TABLE user_journals (
    id TEXT PRIMARY KEY,                   -- Local UUID
    server_id TEXT,                        -- UUID from server after sync
    user_id TEXT NOT NULL,
    collection_id TEXT,
    title TEXT,
    content TEXT NOT NULL,                 -- TipTap JSON
    content_html TEXT,
    mood TEXT,
    created_at TEXT NOT NULL,              -- ISO 8601 format
    updated_at TEXT NOT NULL,
    needs_sync INTEGER DEFAULT 1,          -- 0 = synced, 1 = needs upload
    synced_at TEXT,                        -- ISO 8601 when last synced
    is_deleted INTEGER DEFAULT 0           -- Soft delete flag
);

CREATE INDEX idx_local_journals_user_id ON user_journals(user_id);
CREATE INDEX idx_local_journals_needs_sync ON user_journals(needs_sync);
CREATE INDEX idx_local_journals_created_at ON user_journals(created_at DESC);
```

**Sync Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `server_id` | TEXT | UUID from server (NULL until first sync) |
| `needs_sync` | INTEGER | 0 = synced, 1 = needs upload to server |
| `synced_at` | TEXT | ISO 8601 timestamp of last successful sync |
| `is_deleted` | INTEGER | 0 = active, 1 = deleted (sync then remove) |

---

#### Table: `journal_templates` (Local Cache)

```sql
CREATE TABLE journal_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    type TEXT NOT NULL DEFAULT 'journal',  -- 'learn' or 'journal'
    slide_groups TEXT NOT NULL,            -- JSON string
    is_active INTEGER DEFAULT 1,
    created_at TEXT,
    updated_at TEXT,
    cached_at TEXT                         -- When downloaded from server
);

CREATE INDEX idx_local_templates_category ON journal_templates(category);
CREATE INDEX idx_local_templates_type ON journal_templates(type);
CREATE INDEX idx_local_templates_active ON journal_templates(is_active);
```

---

#### Table: `user_learned_slide_groups` (Learning Progress)

Tracks which slide groups a user has completed within `type='learn'` collections.

**PostgreSQL Schema:**

```sql
CREATE TABLE user_learned_slide_groups (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    collection_id UUID NOT NULL REFERENCES journal_templates(id) ON DELETE CASCADE,
    slide_group_id TEXT NOT NULL,           -- Matches slide_group.id within JSONB
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (user_id, collection_id, slide_group_id)  -- Prevent duplicate completions
);

CREATE INDEX idx_learned_user_id ON user_learned_slide_groups(user_id);
CREATE INDEX idx_learned_collection ON user_learned_slide_groups(collection_id);
CREATE INDEX idx_learned_completed ON user_learned_slide_groups(completed_at);
```

**SQLite Schema (Local):**

```sql
CREATE TABLE user_learned_slide_groups (
    id TEXT PRIMARY KEY,
    server_id TEXT,                         -- UUID from server after sync
    user_id TEXT NOT NULL,
    collection_id TEXT NOT NULL,
    slide_group_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,             -- ISO 8601
    needs_sync INTEGER DEFAULT 1,
    synced_at TEXT,
    UNIQUE (user_id, collection_id, slide_group_id)
);

CREATE INDEX idx_local_learned_user ON user_learned_slide_groups(user_id);
CREATE INDEX idx_local_learned_collection ON user_learned_slide_groups(collection_id);
CREATE INDEX idx_local_learned_sync ON user_learned_slide_groups(needs_sync);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | User who completed the slide group |
| `collection_id` | UUID | FK to `journal_templates.id` (the parent collection) |
| `slide_group_id` | TEXT | The `id` field from within the collection's `slide_groups` JSONB |
| `completed_at` | TIMESTAMP | When the user finished the slide group |

**Usage:**
- Calculate collection progress: `completed slide groups / total slide groups`
- Show progress bar on collection cards in the Library page
- "Chapters read" count per collection

---

## 📦 TypeScript Interfaces

### Frontend Data Models

```typescript
// stores/types/journal.types.ts

/**
 * Journal Entry Model
 */
export interface JournalEntry {
  id: string;                              // Local UUID
  serverId?: string;                       // Server UUID after sync
  userId: string;
  collectionId?: string;                   // NULL for free-form journals
  title: string;
  content: TipTapJSON;                     // TipTap document structure
  contentHtml: string;                     // Rendered HTML
  mood?: string;                           // "7" or "Partly Cloudy"
  createdAt: string;                       // ISO 8601
  updatedAt: string;
  needsSync: boolean;
  syncedAt?: string;
  isDeleted: boolean;
}

/**
 * TipTap JSON Document
 */
export interface TipTapJSON {
  type: 'doc';
  content: TipTapNode[];
}

/**
 * TipTap Node (Union Type)
 */
export type TipTapNode = 
  | SlideResponseNode 
  | AIQuestionNode 
  | ParagraphNode 
  | HeadingNode
  | BulletListNode;

/**
 * Slide Response Node (Mood, Sleep, Journal Prompt)
 */
export interface SlideResponseNode {
  type: 'slideResponse';
  attrs: {
    slideId: string;
    slideType: 'emotion_log' | 'sleep_check' | 'journal_prompt';
    question: string;
    moodScore?: number;                    // 1-10 for emotion_log
    moodLabel?: string;                    // "Sunny", "Cloudy", etc.
    sleepHours?: number;                   // 0-12 for sleep_check
    userAnswer?: string;                   // Text for journal_prompt
    timestamp: string;                     // ISO 8601
  };
}

/**
 * AI Question Node (Go Deeper Results)
 */
export interface AIQuestionNode {
  type: 'aiQuestion';
  attrs: {
    question: string;
    timestamp: string;                     // ISO 8601
    model?: string;                        // "gpt-4-mini"
    direction?: 'why' | 'emotions' | 'patterns' | 'challenge' | 'growth';  // Reflection direction used
  };
}

/**
 * Standard TipTap Paragraph Node
 */
export interface ParagraphNode {
  type: 'paragraph';
  content?: TextNode[];
}

export interface TextNode {
  type: 'text';
  text: string;
  marks?: Array<{
    type: 'bold' | 'italic' | 'underline' | 'strike';
  }>;
}

/**
 * Heading Node
 */
export interface HeadingNode {
  type: 'heading';
  attrs: {
    level: 1 | 2 | 3;
  };
  content?: TextNode[];
}

/**
 * Bullet List Node
 */
export interface BulletListNode {
  type: 'bulletList';
  content: ListItemNode[];
}

export interface ListItemNode {
  type: 'listItem';
  content: ParagraphNode[];
}
```

---

### Collection & Slide Models

```typescript
/**
 * Collection Type
 * - 'learn': Educational content (Library "Collections" section)
 * - 'journal': Journaling prompts (Library "Categories" section)
 */
export type CollectionType = 'learn' | 'journal';

/**
 * Journal Collection (Template)
 */
export interface JournalCollection {
  id: string;
  title: string;
  description: string;
  category: string;
  type: CollectionType;                    // 'learn' or 'journal'
  slideGroups: SlideGroup[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cachedAt?: string;                       // Local cache timestamp
}

/**
 * Learning Progress Record
 * Tracks which slide groups a user has completed in learn-type collections.
 */
export interface LearnedSlideGroup {
  id: string;
  userId: string;
  collectionId: string;
  slideGroupId: string;                    // Matches SlideGroup.id within collection
  completedAt: string;                     // ISO 8601
}
```

/**
 * Slide Group (e.g., "Morning Prep", "Evening Reflection")
 */
export interface SlideGroup {
  id: string;
  title: string;
  description: string;
  slides: Slide[];
}

/**
 * Slide (Union Type)
 */
export type Slide = 
  | EmotionLogSlide 
  | SleepCheckSlide 
  | JournalPromptSlide 
  | DocSlide;

/**
 * Emotion Log Slide (Mood Tracking)
 */
export interface EmotionLogSlide {
  id: string;
  type: 'emotion_log';
  question: string;
  config: {
    scale: '1-10';
    labels: string[];                      // ["Storm", "Rain", "Cloudy", ...]
  };
}

/**
 * Sleep Check Slide
 */
export interface SleepCheckSlide {
  id: string;
  type: 'sleep_check';
  question: string;
  config: {
    min: number;
    max: number;
  };
}

/**
 * Journal Prompt Slide (Rich Text Editor)
 */
export interface JournalPromptSlide {
  id: string;
  type: 'journal_prompt';
  question: string;
  config: {
    allowAI: boolean;                      // Show "Go Deeper" button
    minLength?: number;                    // Minimum character count
    placeholder?: string;
  };
}

/**
 * Doc Slide (Educational Content)
 */
export interface DocSlide {
  id: string;
  type: 'doc';
  title: string;
  content: string;                         // HTML content
  source?: string;                         // Attribution URL
}
```

---

### API Request/Response Models

```typescript
/**
 * Create Journal Request
 */
export interface CreateJournalRequest {
  collectionId?: string;
  title: string;
  content: TipTapJSON;
  contentHtml: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Journal Response
 */
export interface CreateJournalResponse {
  id: string;                              // Server UUID
  userId: string;
  collectionId?: string;
  title: string;
  content: TipTapJSON;
  contentHtml: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * AI "Go Deeper" Request
 */
export interface GoDeepperRequest {
  currentText: string;
  slideContext: string;                    // The prompt question
  userId: string;
  journalId?: string;                      // Optional: link to existing journal
  direction?: 'why' | 'emotions' | 'patterns' | 'challenge' | 'growth';  // Reflection direction
}

/**
 * AI "Go Deeper" Response
 */
export interface GoDeepperResponse {
  question: string;
  model: string;                           // "gpt-4-mini"
  timestamp: string;
  direction?: string;                      // Echo back the selected direction
}

/**
 * Sync Queue Item
 */
export interface SyncQueueItem {
  localId: string;
  type: 'journal';
  action: 'create' | 'update' | 'delete';
  data: JournalEntry;
  retryCount: number;
  lastAttempt?: string;
}
```

---

## 🔄 Data Transformation Examples

### Example 1: Collection-Based Journal Entry

**User completes "Morning Preparation" slide group:**

```json
{
  "type": "doc",
  "content": [
    {
      "type": "slideResponse",
      "attrs": {
        "slideId": "mood-check",
        "slideType": "emotion_log",
        "question": "How are you feeling this morning?",
        "moodScore": 7,
        "moodLabel": "Partly Cloudy",
        "timestamp": "2025-12-09T08:30:00Z"
      }
    },
    {
      "type": "slideResponse",
      "attrs": {
        "slideId": "sleep-quality",
        "slideType": "sleep_check",
        "question": "How many hours did you sleep?",
        "sleepHours": 7,
        "timestamp": "2025-12-09T08:31:00Z"
      }
    },
    {
      "type": "slideResponse",
      "attrs": {
        "slideId": "intentions",
        "slideType": "journal_prompt",
        "question": "What are your intentions for today?",
        "userAnswer": "I want to focus on finishing the project presentation and take a lunch break outside.",
        "timestamp": "2025-12-09T08:35:00Z"
      }
    },
    {
      "type": "aiQuestion",
      "attrs": {
        "question": "What would make your lunch break feel truly restorative?",
        "timestamp": "2025-12-09T08:36:00Z",
        "model": "gpt-4-mini"
      }
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Maybe finding a quiet park bench away from screens. I notice I feel calmer when I'm around trees."
        }
      ]
    }
  ]
}
```

**Stored in `user_journals` table:**

```sql
INSERT INTO user_journals (
  id, user_id, collection_id, title, content, content_html, mood, created_at, updated_at
) VALUES (
  'a1b2c3d4-...',
  'user-uuid-...',
  'morning-prep-collection-id',
  'Morning Check-in - Dec 9, 2025',
  '{"type":"doc","content":[...]}',  -- Full TipTap JSON
  '<div>Mood: Partly Cloudy (7/10)...</div>',
  '7',
  '2025-12-09T08:30:00Z',
  '2025-12-09T08:36:00Z'
);
```

---

### Example 2: Free-Form Journal Entry

**User creates blank journal with AI assistance:**

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Had a tough conversation with my manager today about workload. I feel overwhelmed."
        }
      ]
    },
    {
      "type": "aiQuestion",
      "attrs": {
        "question": "What part of the workload feels most overwhelming right now?",
        "timestamp": "2025-12-09T15:45:00Z",
        "model": "gpt-4-mini"
      }
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "The constant context switching. I barely finish one task before another urgent request comes in."
        }
      ]
    },
    {
      "type": "aiQuestion",
      "attrs": {
        "question": "When you imagine a day without constant switching, what would that look like?",
        "timestamp": "2025-12-09T15:47:00Z",
        "model": "gpt-4-mini"
      }
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "I'd block 2-hour chunks for deep work. No Slack, no emails. Just focused time."
        }
      ]
    }
  ]
}
```

**Stored in `user_journals` table:**

```sql
INSERT INTO user_journals (
  id, user_id, collection_id, title, content, content_html, mood, created_at, updated_at
) VALUES (
  'f5e6d7c8-...',
  'user-uuid-...',
  NULL,  -- No collection (free-form)
  'Work Stress - Dec 9, 2025',
  '{"type":"doc","content":[...]}',
  '<p>Had a tough conversation...</p>',
  NULL,  -- No mood slide in free-form
  '2025-12-09T15:42:00Z',
  '2025-12-09T15:48:00Z'
);
```

---

## 🔍 Data Extraction Patterns

### Extract Mood from Journal Content

```typescript
function extractMood(content: TipTapJSON): string | null {
  const emotionSlide = content.content.find(
    (node): node is SlideResponseNode => 
      node.type === 'slideResponse' && 
      node.attrs.slideType === 'emotion_log'
  );
  
  return emotionSlide?.attrs.moodScore?.toString() || 
         emotionSlide?.attrs.moodLabel || 
         null;
}
```

### Extract All AI Questions

```typescript
function extractAIQuestions(content: TipTapJSON): string[] {
  return content.content
    .filter((node): node is AIQuestionNode => node.type === 'aiQuestion')
    .map(node => node.attrs.question);
}
```

### Generate Title from Content

```typescript
function generateTitle(content: TipTapJSON, collectionTitle?: string): string {
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  if (collectionTitle) {
    return `${collectionTitle} - ${date}`;
  }
  
  // Extract first paragraph text
  const firstParagraph = content.content.find(
    (node): node is ParagraphNode => node.type === 'paragraph'
  );
  
  const firstText = firstParagraph?.content?.[0]?.text || 'Journal Entry';
  const truncated = firstText.substring(0, 50);
  
  return `${truncated}${firstText.length > 50 ? '...' : ''} - ${date}`;
}
```

---

## 📊 Database Migrations Checklist

### Required Migrations

- [x] `000010_create_user_journals_table.up.sql` - ✅ Exists
- [x] `000015_update_user_journals_schema.up.sql` - ✅ Exists (content_html, updated_at, collection_id)
- [x] `000016_update_journal_templates_schema.up.sql` - ✅ Exists (slide_groups JSONB, description, is_active)
- [ ] **TODO**: `000021` - Add `type` column to `journal_templates` (default `'journal'`)
- [ ] **TODO**: `000022` - Create `user_learned_slide_groups` table (learning progress tracking)
- [x] ~~`000012_create_emotion_logs_table.up.sql`~~ - ❌ No longer needed (embedded in content)
- [x] ~~`000013_create_guider_chatlog_table.up.sql`~~ - ❌ No longer needed (embedded in content)

### Migration: Add `type` to `journal_templates`

```sql
-- migrations/000021_add_type_to_journal_templates.up.sql
ALTER TABLE journal_templates ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'journal';

-- Create indexes for type-based queries
CREATE INDEX idx_journal_templates_type ON journal_templates(type);
CREATE INDEX idx_journal_templates_type_category ON journal_templates(type, category);
```

```sql
-- migrations/000021_add_type_to_journal_templates.down.sql
DROP INDEX IF EXISTS idx_journal_templates_type_category;
DROP INDEX IF EXISTS idx_journal_templates_type;
ALTER TABLE journal_templates DROP COLUMN type;
```

### Migration: Create `user_learned_slide_groups`

```sql
-- migrations/000022_create_user_learned_slide_groups.up.sql
CREATE TABLE user_learned_slide_groups (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    collection_id UUID NOT NULL REFERENCES journal_templates(id) ON DELETE CASCADE,
    slide_group_id TEXT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (user_id, collection_id, slide_group_id)
);

CREATE INDEX idx_learned_user_id ON user_learned_slide_groups(user_id);
CREATE INDEX idx_learned_collection ON user_learned_slide_groups(collection_id);
CREATE INDEX idx_learned_completed ON user_learned_slide_groups(completed_at);
```

```sql
-- migrations/000022_create_user_learned_slide_groups.down.sql
DROP TABLE IF EXISTS user_learned_slide_groups;
```

---

## ✅ Validation Rules

### Journal Entry Validation

```typescript
export const JournalEntrySchema = {
  title: {
    maxLength: 255,
    required: false,
  },
  content: {
    required: true,
    validate: (content: TipTapJSON) => {
      // Must have at least one content node
      return content.content && content.content.length > 0;
    }
  },
  mood: {
    pattern: /^([1-9]|10|Storm|Rain|Cloudy|Partly Cloudy|Sunny)$/,
    required: false,
  }
};
```

### Collection Validation

```typescript
export const CollectionSchema = {
  title: {
    minLength: 3,
    maxLength: 255,
    required: true,
  },
  slideGroups: {
    minLength: 1,
    required: true,
    validate: (groups: SlideGroup[]) => {
      // Each group must have at least one slide
      return groups.every(group => group.slides.length > 0);
    }
  }
};
```

---

## 📚 Related Documentation

- [00-OVERVIEW.md](./00-OVERVIEW.md) - Feature overview
- [01-JOURNALING-FLOWS.md](./01-JOURNALING-FLOWS.md) - User flows
- [IMPLEMENTATION-GUIDE-NEW.md](./IMPLEMENTATION-GUIDE-NEW.md) - Complete implementation guide
- [TipTap Documentation](https://tiptap.dev/docs/editor/introduction) - Rich text editor
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html) - JSON storage

---

**Next Steps:**
1. Run migration `000021` to add `type` column to `journal_templates`
2. Run migration `000022` to create `user_learned_slide_groups` table
3. Update Go model (`JournalTemplate`) to include `Type` field
4. Update TypeScript type (`JournalTemplate`) to include `type` field
5. Update frontend Library page to filter by `type`
6. Implement learning progress tracking (mark slide group as completed)
7. Update seed data to include `type` values for existing templates
