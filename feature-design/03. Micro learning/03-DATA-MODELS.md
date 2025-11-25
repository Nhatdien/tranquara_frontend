# 📊 Micro Learning - Data Models

## Overview

This document details the database schemas for the micro-learning feature, covering both **server-side (PostgreSQL)** and **client-side (SQLite via @capacitor-community/sqlite)** data models.

---

## 🗄️ Server-Side: PostgreSQL Schema

### `collections`

Groups related lessons by topic or purpose. Both learning content and therapy prep use this table.

| Column          | Type         | Constraints | Description                           |
|-----------------|--------------|-------------|---------------------------------------|
| `id`            | UUID         | PK          | Unique collection ID                  |
| `title`         | VARCHAR(255) | NOT NULL    | Collection title                      |
| `category`      | VARCHAR(50)  | NOT NULL    | Category slug                         |
| `description`   | TEXT         |             | Short summary                         |
| `type`          | VARCHAR(50)  | NOT NULL    | 'learn' or 'journal'                  |
| `thumbnail_url` | TEXT         |             | Cover image URL                       |
| `position`      | INTEGER      |             | Display order in library              |
| `created_at`    | TIMESTAMP    | DEFAULT NOW()| Creation timestamp                   |

#### `type` Values

- **`learn`**: Educational micro-lessons (includes therapy prep)
- **`journal`**: Journaling slide groups (daily prompts, templates)

#### `category` Values (for `type = 'learn'`)

- `mindfulness`
- `stress_management`
- `emotional_regulation`
- `therapy_prep` ← Therapy preparation lessons use this category
- `journaling_basics`
- `sleep_wellness`
- `communication`
- `self_compassion`

**Indexes:**
- `idx_collections_type` on `type`
- `idx_collections_category` on `category`
- `idx_collections_type_category` on `(type, category)` for filtered queries

---

#### Example Rows

_[SQL code implementation removed - to be added during development]_

---

### `slide_groups`

Individual lessons within a collection, composed of multiple slides.

| Column               | Type         | Constraints  | Description                      |
|----------------------|--------------|--------------|----------------------------------|
| `id`                 | UUID         | PK           | Unique lesson ID                 |
| `collection_id`      | UUID         | FK, NOT NULL | Parent collection                |
| `title`              | VARCHAR(255) | NOT NULL     | Lesson title                     |
| `description`        | TEXT         |              | Short description                |
| `content`            | JSONB        | NOT NULL     | Slide content array              |
| `position`           | INTEGER      | NOT NULL     | Order within collection          |
| `estimated_duration` | INTEGER      |              | Minutes to complete              |
| `created_at`         | TIMESTAMP    | DEFAULT NOW() | Creation timestamp              |

**Relationships:**
- Many-to-one with `collections` (ON DELETE CASCADE)

**Indexes:**
- `idx_slide_groups_collection` on `collection_id`
- `idx_slide_groups_position` on `position`
- GIN index on `content` for JSONB search: `CREATE INDEX idx_slide_groups_content ON slide_groups USING GIN(content);`

---

#### `content` JSONB Structure

Array of slide objects, each with a `type` field determining its schema.

**Supported Slide Types:**
- `doc` - Text content
- `cta` - Interactive component
- `journal_prompt` - Journaling question
- `further_reading` - External resources
- `emotion_log` - Emotion slider
- `sleep_check` - Sleep quality slider

See **[Content Type Schemas Design](../02.%20Jounral%20Feature/Content%20type%20schemas%20design.md)** for detailed specifications.

---

#### Example: Complete Lesson Content

_[JSON code implementation removed - to be added during development]_

**Full Row Example:**

_[SQL code implementation removed - to be added during development]_

---

### `user_learned_lessons`

Tracks which lessons users have completed.

| Column           | Type        | Constraints | Description                    |
|------------------|-------------|-------------|--------------------------------|
| `id`             | UUID        | PK          | Unique completion record       |
| `user_id`        | UUID        | NOT NULL    | From Keycloak token            |
| `slide_group_id` | UUID        | FK, NOT NULL| References `slide_groups.id`   |
| `collection_id`  | UUID        | FK          | Denormalized for quick queries |
| `topic`          | VARCHAR(50) |             | Denormalized category          |
| `completed_at`   | TIMESTAMP   | DEFAULT NOW()| Completion timestamp          |

**Constraints:**
- **Unique**: `(user_id, slide_group_id)` - Prevents duplicate completions
- **Foreign Keys**:
  - `slide_group_id` → `slide_groups.id` (ON DELETE CASCADE)
  - `collection_id` → `collections.id` (ON DELETE SET NULL)

**Indexes:**
- `idx_user_learned_user_id` on `user_id`
- `idx_user_learned_completed` on `completed_at`
- `idx_user_learned_topic` on `topic` for category filtering

---

#### Why Denormalize `collection_id` and `topic`?

**Performance**: Fast queries without joins.

_[SQL code implementation removed - to be added during development]_

**Trade-off**: Small redundancy for significant speed improvement on progress queries.

---

#### Example Rows

_[SQL code implementation removed - to be added during development]_

---

### `user_journals` (Updated for Lesson Integration)

Journal entries, **including those created from lesson prompts**.

| Column          | Type      | Constraints | Description                  |
|-----------------|-----------|-------------|------------------------------|
| `id`            | UUID      | PK          | Unique journal entry ID      |
| `user_id`       | UUID      | NOT NULL    | From Keycloak token          |
| `template_id`   | UUID      |             | FK to journal template (if used) |
| **`collection_id`** | **UUID** |         | **FK to collections (if from lesson)** ✨ NEW |
| **`source_type`**   | **VARCHAR(20)** | | **'standalone' or 'lesson'** ✨ NEW |
| `title`         | TEXT      |             | User-provided or AI-generated|
| `content`       | TEXT      | NOT NULL    | Full journal content         |
| `mood_score`    | FLOAT     |             | Self-reported mood (1-10)    |
| `tags`          | TEXT[]    |             | User or AI-generated tags    |
| `created_at`    | TIMESTAMP | DEFAULT NOW()| When journal was written    |
| `updated_at`    | TIMESTAMP |             | Last modification time       |

**New Fields for Lesson Integration:**

- **`collection_id`**: Links journal back to source lesson (NULL for standalone journals)
- **`source_type`**: 
  - `'standalone'` - Regular journaling (default)
  - `'lesson'` - Created from lesson journal_prompt slides

**Indexes:**
- Existing indexes remain
- **New**: `idx_user_journals_collection` on `collection_id`
- **New**: `idx_user_journals_source` on `source_type`

---

#### Example: Journal from Lesson

_[SQL code implementation removed - to be added during development]_

**UI Display in Journal History:**

```
┌─────────────────────────────────────────┐
│ Introduction to Journaling              │
│ Nov 20, 2025 • 8:35 AM                  │
│                                         │
│ 🧠 From lesson: Introduction to...     │  ← Badge with link
│                                         │
│ What brought you to journaling today?  │
│                                         │
│ I decided to start journaling because  │
│ I want to understand my emotions...    │
└─────────────────────────────────────────┘
```

---

### `lesson_progress_metrics` (Aggregated Progress)

Cached aggregation for fast dashboard queries.

| Column                | Type      | Constraints | Description                      |
|-----------------------|-----------|-------------|----------------------------------|
| `user_id`             | UUID      | PK          | From Keycloak token              |
| `total_lessons`       | INTEGER   | DEFAULT 0   | Total lessons completed          |
| `topic_distribution`  | JSONB     |             | Category breakdown               |
| `last_completed_at`   | TIMESTAMP |             | Most recent lesson completion    |
| `updated_at`          | TIMESTAMP | DEFAULT NOW()| Last recalculation              |

#### `topic_distribution` JSONB Example

_[JSON code implementation removed - to be added during development]_

**Purpose**: Avoid scanning `user_learned_lessons` on every dashboard load.

**Update Trigger**: Recalculate after each lesson completion.

_[SQL code implementation removed - to be added during development]_

---

## 📱 Client-Side: SQLite Schema (@capacitor-community/sqlite)

### Mobile & Web: SQLite Database

**Storage**: SQLite database via `@capacitor-community/sqlite`
- **Mobile (iOS/Android)**: Native SQLite
- **Web**: SQL.js (WASM-based SQLite)
- **Encryption**: Optional SQLite encryption available

#### `local_collections`

Stores collection metadata locally (including bundled lessons).

_[SQL code implementation removed - to be added during development]_

---

#### `local_slide_groups`

Stores lesson content locally.

_[SQL code implementation removed - to be added during development]_

---

#### `local_progress`

Tracks lesson completions locally (syncs to `user_learned_lessons` on server).

_[SQL code implementation removed - to be added during development]_

---

#### `sync_queue`

Tracks pending sync operations.

_[SQL code implementation removed - to be added during development]_

---

### Web Platform Note

**Web uses the same SQLite database** via SQL.js (WebAssembly):
- Same schema as mobile (consistency)
- Stored in browser's IndexedDB (for persistence)
- Automatic migration from mobile ↔ web

No separate IndexedDB schema needed - SQLite handles all platforms uniformly.

---

## 🔗 Relationships & Queries

### Common Queries

#### 1. Get All Learning Lessons by Category

_[SQL code implementation removed - to be added during development]_

---

#### 2. Get User's Completed Lessons

_[SQL code implementation removed - to be added during development]_

---

#### 3. Get Progress Counter

_[SQL code implementation removed - to be added during development]_

---

#### 4. Get Journals from Lessons

_[SQL code implementation removed - to be added during development]_

---

#### 5. Check if Lesson Already Completed

_[SQL code implementation removed - to be added during development]_

---

## 📊 Data Flow Diagram

```
User Completes Lesson
         │
         ▼
┌─────────────────────┐
│ Frontend            │
│ - User taps Finish  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Local Storage       │
│ INSERT INTO         │
│ local_progress      │
│ (synced = 0)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Sync Queue          │
│ Add completion task │
└──────────┬──────────┘
           │
           │ When Online
           ▼
┌─────────────────────┐
│ Backend API         │
│ POST /api/lessons/  │
│ :id/complete        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│ PostgreSQL                      │
│ INSERT INTO user_learned_lessons│
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Trigger                         │
│ UPDATE lesson_progress_metrics  │
└─────────────────────────────────┘
```

---

**Last Updated**: November 22, 2025
