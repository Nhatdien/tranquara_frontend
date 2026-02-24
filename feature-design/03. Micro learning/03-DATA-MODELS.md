# 📊 Micro Learning - Data Models

## Overview

This document details the data models for the micro-learning feature. 

> **⚠️ Important**: Learning content shares the same database table (`journal_templates`) as journaling collections, distinguished by the `type` column. See [Journal Feature Data Models](../02.%20Jounral%20Feature/03-DATA-MODELS.md) for the canonical schema definition.

---

## 🗄️ Database Architecture

### Shared Table: `journal_templates`

Both learning and journaling content live in the same `journal_templates` table, filtered by `type`:

| `type` Value | Description | Library Section |
|-------------|-------------|-----------------|
| `'learn'` | Educational micro-lessons | "Collections" — horizontal scroll cards with chapter count & progress |
| `'journal'` | Journaling prompt templates | "All Categories" — grouped by category tabs, shows slide groups |

**Slide groups are stored as JSONB** within `journal_templates.slide_groups` — there is no separate `slide_groups` table. Each element in the JSONB array represents one lesson/chapter.

For the full `journal_templates` schema, see: [Journal Feature 03-DATA-MODELS.md](../02.%20Jounral%20Feature/03-DATA-MODELS.md#table-journal_templates-collections)

#### `category` Values (for `type = 'learn'`)

- `anxiety`, `emotions`, `gratitude`, `mental_health`, `mindfulness`
- `relationships`, `self_care`, `sleep`, `therapy_prep`
- `journaling_basics`, `stress_management`, `communication`, `self_compassion`

---

### Learning Progress: `user_learned_slide_groups`

Tracks which slide groups (chapters) a user has completed within `type='learn'` collections.

For the full schema, see: [Journal Feature 03-DATA-MODELS.md](../02.%20Jounral%20Feature/03-DATA-MODELS.md#table-user_learned_slide_groups-learning-progress)

**Key queries:**

```sql
-- Collection progress: how many chapters completed out of total
SELECT collection_id, COUNT(*) as completed
FROM user_learned_slide_groups
WHERE user_id = $1
GROUP BY collection_id;

-- Check if specific slide group is completed
SELECT EXISTS(
  SELECT 1 FROM user_learned_slide_groups
  WHERE user_id = $1 AND collection_id = $2 AND slide_group_id = $3
);
```

---

### Slide Group `content` JSONB Structure

Array of slide objects, each with a `type` field determining its schema.

**Supported Slide Types:**
- `doc` - Text content
- `cta` - Interactive component
- `journal_prompt` - Journaling question
- `further_reading` - External resources
- `emotion_log` - Emotion slider
- `sleep_check` - Sleep quality slider

See **[Content Type Schemas Design](../02.%20Jounral%20Feature/Content%20type%20schemas%20design.md)** for detailed specifications.

_[SQL code implementation removed - to be added during development]_

---

> **Note**: The old `user_learned_lessons`, `lesson_progress_metrics`, `local_collections`, and `local_slide_groups` tables from the earlier design have been **replaced** by:
> - `user_learned_slide_groups` — tracking table (see [Journal Feature 03-DATA-MODELS.md](../02.%20Jounral%20Feature/03-DATA-MODELS.md))
> - `journal_templates` (local cache) — same table used by journaling, with `type='learn'`
>
> This simplifies the architecture: one table for all collections, one table for all progress tracking.

---

## 📱 Client-Side: SQLite Schema

Learning content reuses the same local SQLite tables as journaling:

- **`journal_templates`** (local cache) — includes `type` column to filter `'learn'` vs `'journal'`
- **`user_learned_slide_groups`** (local) — offline progress tracking with sync support

See [Journal Feature 03-DATA-MODELS.md](../02.%20Jounral%20Feature/03-DATA-MODELS.md) for full local SQLite schemas.

---

## 🔗 Common Queries

### 1. Get All Learning Collections by Category

```sql
SELECT * FROM journal_templates
WHERE type = 'learn' AND category = $1 AND is_active = true
ORDER BY created_at;
```

### 2. Get User's Completed Slide Groups for a Collection

```sql
SELECT slide_group_id, completed_at
FROM user_learned_slide_groups
WHERE user_id = $1 AND collection_id = $2;
```

### 3. Get Collection Progress (completed / total)

```sql
-- Total slide groups per collection comes from JSONB array length:
SELECT jsonb_array_length(slide_groups) as total
FROM journal_templates WHERE id = $1;

-- Completed count:
SELECT COUNT(*) as completed
FROM user_learned_slide_groups
WHERE user_id = $1 AND collection_id = $2;
```

### 4. Get All Learning Collections Grouped by Category (for "See All" page)

```sql
SELECT category, json_agg(
  json_build_object('id', id, 'title', title, 'description', description, 'slide_groups', slide_groups)
) as collections
FROM journal_templates
WHERE type = 'learn' AND is_active = true
GROUP BY category
ORDER BY category;
```

---

## 📊 Data Flow: Completing a Lesson

```
User Completes Slide Group (taps "Finish")
         │
         ▼
┌─────────────────────┐
│ Frontend            │
│ - Mark completed    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Local SQLite        │
│ INSERT INTO         │
│ user_learned_       │
│ slide_groups        │
│ (needs_sync = 1)    │
└──────────┬──────────┘
           │
           │ When Online
           ▼
┌──────────────────────────┐
│ Backend API              │
│ POST /v1/learned/        │
│ {collection_id,          │
│  slide_group_id}         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ PostgreSQL                           │
│ INSERT INTO user_learned_slide_groups│
└──────────────────────────────────────┘
```

---

**Last Updated**: February 24, 2026
