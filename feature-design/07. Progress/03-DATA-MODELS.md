# 📊 Progress Tracking - Data Models

## Overview

This document details the data sources used by the Progress feature. Unlike a traditional backend-aggregated approach, **Progress metrics are computed client-side** from local SQLite data. Only streak data comes from the backend PostgreSQL database.

---

## 🗄️ Backend Database Tables (PostgreSQL)

### `user_streaks` ✅ Exists

Tracks journaling streak data. This is the **only backend table** directly used by the Progress page.

| Column           | Type      | Constraints   | Description                      |
|------------------|-----------|---------------|----------------------------------|
| `user_id`        | UUID      | PK            | From Keycloak token              |
| `current_streak` | INTEGER   | DEFAULT 0     | Current consecutive active days  |
| `longest_streak` | INTEGER   | DEFAULT 0     | All-time best streak             |
| `last_active`    | DATE      | NOT NULL      | Last activity date               |
| `total_entries`  | INTEGER   | DEFAULT 0     | Lifetime journal count           |
| `updated_at`     | TIMESTAMP | DEFAULT NOW() | Last update timestamp            |

**Backend API**:
- `GET /v1/user_streaks` — Fetch streak for authenticated user
- `PUT /v1/user_streaks` — Update streak (called when user journals)

**Go Model**: `internal/data/user_streaks.go`
- `Get(userID)` → returns streak record
- `Insert(streak)` → creates new streak record
- `UpdateOrReset(streak)` → increments or resets streak based on last_active date

**Frontend Store**: `stores/stores/user_streak.ts` (`useUserStreakStore`)
- Fetches from backend via `TranquaraSDK.getInstance().getUserStreak()`
- Getters: `currentStreak`, `longestStreak`, `totalEntries`, `isStreakActive`, `hasJournaledToday`

---

### `emotion_logs` ✅ Exists

Basic emotion tracking. Can be used to enhance emotion distribution data.

| Column        | Type      | Constraints        | Description                    |
|---------------|-----------|--------------------|--------------------------------|
| `id`          | UUID      | PK, DEFAULT gen    | Unique log ID                  |
| `user_id`     | UUID      | NOT NULL           | From Keycloak token            |
| `emotion`     | TEXT      | NOT NULL           | Emotion name (calm, anxious)   |
| `source`      | TEXT      |                    | Source context                 |
| `context`     | TEXT      |                    | Additional context             |
| `created_at`  | TIMESTAMP | DEFAULT NOW()      | When logged                    |

**Backend API**:
- `GET /v1/emotion_log` — Fetch emotion logs for user (with pagination)
- `POST /v1/emotion_log` — Create new emotion log

---

### `user_learned_slide_groups` ✅ Exists

Tracks completed learning slide groups. Used for future learning progress section.

| Column           | Type      | Constraints                    | Description                    |
|------------------|-----------|--------------------------------|--------------------------------|
| `id`             | UUID      | PK, DEFAULT gen                | Unique completion record       |
| `user_id`        | UUID      | NOT NULL                       | From Keycloak token            |
| `collection_id`  | UUID      | FK → journal_templates         | Parent collection              |
| `slide_group_id` | VARCHAR   | NOT NULL                       | Slide group identifier         |
| `completed_at`   | TIMESTAMP | DEFAULT NOW()                  | Completion timestamp           |

**Unique Constraint**: `(user_id, collection_id, slide_group_id)`

**Frontend Store**: `stores/stores/user_learned.ts` (`useLearnedStore`)
- Offline-first via SQLite (`LearnedRepository`)
- Getters: `completedByCollection`, `getProgress`

---

## 📱 Local Data Sources (SQLite / Pinia Stores)

### Journal Data — Primary Metric Source

**Store**: `stores/stores/user_journal.ts` (`userJournalStore`)
**Repository**: `services/sqlite/journals_repository.ts`

Journals stored locally in SQLite contain all the data needed for Progress metrics:

| Field         | Type      | Used For                                    |
|---------------|-----------|---------------------------------------------|
| `id`          | string    | Unique identifier                           |
| `content`     | string    | Word count (strip HTML/TipTap JSON)         |
| `mood_score`  | number    | Average mood label (1-10 scale)             |
| `emotion_log` | string    | Emotion distribution chart                  |
| `created_at`  | string    | Completed days count, heatmap calendar      |
| `is_deleted`  | boolean   | Filter out deleted journals                 |

**Computed Metrics from Journals**:

| Metric                | Computation                                          | Status |
|-----------------------|------------------------------------------------------|--------|
| `totalCompletedDays`  | Count unique dates from `created_at`                 | ✅     |
| `totalWordsWritten`   | Strip HTML/JSON → split whitespace → count           | ✅     |
| `averageMoodLabel`    | Avg `mood_score` → round → map to label (1-10)      | ✅     |
| `emotionDistribution` | Group `emotion_log` by emotion → count frequency     | 🔜     |
| `heatmapData`         | Count journals per day → calendar grid               | 🔜     |

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────┐
│              Progress Page                   │
│           pages/progress.vue                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─── Vue Computed Properties ───┐          │
│  │                               │          │
│  │  totalCompletedDays           │          │
│  │  totalWordsWritten            │          │
│  │  averageMoodLabel             │          │
│  │  emotionDistribution  🔜     │          │
│  │  heatmapData          🔜     │          │
│  │                               │          │
│  └──────────┬────────────────────┘          │
│             │                               │
│     ┌───────▼────────┐  ┌──────────────┐   │
│     │ userJournalStore│  │ streakStore  │   │
│     │ (SQLite local) │  │ (Backend API)│   │
│     └───────┬────────┘  └──────┬───────┘   │
│             │                  │            │
└─────────────┼──────────────────┼────────────┘
              │                  │
    ┌─────────▼──────┐  ┌───────▼────────┐
    │  Local SQLite  │  │  PostgreSQL    │
    │  (journals)    │  │  user_streaks  │
    └────────────────┘  └────────────────┘
```

---

## 📝 Notes

### Tables NOT Used (Removed from Original Plan)

The original design proposed several backend aggregation tables that are **not needed** because metrics are computed client-side:

- ~~`journal_metrics_daily`~~ — Not needed (client computes from local journals)
- ~~`user_metrics`~~ — Not needed (no weekly/monthly backend aggregation)
- ~~`lesson_progress_metrics`~~ — Not needed (client computes from learned store)
- ~~`user_journal_responses`~~ — Not needed (sleep/emotion data in journal fields)

### Why Client-Side Works

1. **Data size**: Even 1000+ journals is < 5MB — fast to compute in-memory
2. **Offline-first**: Works without internet connection
3. **No sync lag**: Metrics update immediately after saving a journal
4. **Simpler architecture**: No background workers, no aggregation tables, no metric calculation queue

### When to Reconsider Backend Aggregation

Backend aggregation might become necessary if:
- Users have 10,000+ journal entries (unlikely for therapy app)
- Complex cross-user analytics are needed (admin dashboard)
- AI-generated insights require historical aggregation
- Multi-device metric consistency becomes critical

---

**Last Updated**: February 28, 2026
