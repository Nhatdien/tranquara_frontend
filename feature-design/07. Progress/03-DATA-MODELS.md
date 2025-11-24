# 📊 Progress Tracking - Data Models

## Overview

This document details the database schemas for the Progress feature. Most tables already exist in the database (created by Journaling and Learning features) - this documentation consolidates them for Progress screen queries.

---

## 🗄️ PostgreSQL Schemas

### Journaling Metrics Tables

#### `journal_metrics_daily`

Daily aggregated metrics for journaling activity and emotional data.

| Column                  | Type      | Constraints   | Description                           |
|-------------------------|-----------|---------------|---------------------------------------|
| `id`                    | UUID      | PK            | Unique daily metric ID                |
| `user_id`               | UUID      | NOT NULL      | From Keycloak token                   |
| `date`                  | DATE      | NOT NULL      | The day these metrics represent       |
| `entry_count`           | INTEGER   | DEFAULT 0     | Number of entries that day            |
| `streak_days`           | INTEGER   | DEFAULT 0     | Active streak count on that day       |
| `avg_sentiment`         | FLOAT     |               | Average sentiment score (-1 to +1)    |
| `emotion_variety_index` | FLOAT     |               | Diversity of emotions (0-1)           |
| `emotional_intensity`   | FLOAT     |               | Average emotion intensity             |
| `dominant_emotions`     | TEXT[]    |               | Most frequent emotions                |
| `emotion_word_freq`     | JSONB     |               | `{"calm":3, "anxious":2, ...}`       |
| `mood_stability_index`  | FLOAT     |               | Consistency of mood (higher = stable) |
| `updated_at`            | TIMESTAMP | DEFAULT NOW() | Last calculation time                 |

**Unique Constraint**: `(user_id, date)`

**Indexes**:
- `idx_jmd_user_date` on `(user_id, date)`
- `idx_jmd_date_range` on `(user_id, date DESC)` for time-range queries

---

##### `emotion_word_freq` JSONB Example

_[JSON code implementation removed - to be added during development]_

**Purpose**: Track frequency of each emotion word mentioned in journals for that day.

---

##### Example Rows

_[SQL code implementation removed - to be added during development]_

---

#### `user_streaks`

Tracks journaling streak data.

| Column           | Type      | Constraints   | Description                      |
|------------------|-----------|---------------|----------------------------------|
| `user_id`        | UUID      | PK            | From Keycloak token              |
| `current_streak` | INTEGER   | DEFAULT 0     | Current consecutive active days  |
| `longest_streak` | INTEGER   | DEFAULT 0     | All-time best streak             |
| `last_active`    | DATE      | NOT NULL      | Last activity date               |
| `total_entries`  | INTEGER   | DEFAULT 0     | Lifetime journal count           |
| `updated_at`     | TIMESTAMP | DEFAULT NOW() | Last update timestamp            |

**Purpose**: Fast access to streak data without scanning `journal_metrics_daily`.

---

##### Example Row

_[SQL code implementation removed - to be added during development]_

**Update Logic**:

_[SQL code implementation removed - to be added during development]_

---

#### `user_metrics`

Weekly/monthly aggregated summary metrics (optional, for historical trends).

| Column                    | Type        | Constraints   | Description                    |
|---------------------------|-------------|---------------|--------------------------------|
| `id`                      | UUID        | PK            | Unique metric summary ID       |
| `user_id`                 | UUID        | NOT NULL      | From Keycloak token            |
| `metric_period`           | VARCHAR(10) | NOT NULL      | 'weekly' or 'monthly'          |
| `start_date`              | DATE        | NOT NULL      | Period start                   |
| `end_date`                | DATE        | NOT NULL      | Period end                     |
| `mood_avg`                | FLOAT       |               | Mean mood score                |
| `sentiment_trend`         | FLOAT       |               | Slope of sentiment over period |
| `top_emotions`            | TEXT[]      |               | Most frequent emotions         |
| `emotion_diversity_score` | FLOAT       |               | Aggregated variety index       |
| `stability_score`         | FLOAT       |               | Aggregated mood stability      |
| `streak_score`            | INTEGER     |               | Weighted streak activity       |
| `theme_counts`            | JSONB       |               | `{"stress":4, "sleep":3, ...}` |
| `created_at`              | TIMESTAMP   | DEFAULT NOW() | Creation timestamp             |

**Indexes**:
- `idx_user_metrics_user_period` on `(user_id, metric_period, start_date)`

**Purpose**: Pre-computed summaries for faster weekly/monthly views.

**Note**: Optional for v1.0 - can calculate on-the-fly from `journal_metrics_daily` for now.

---

### Learning Metrics Tables

#### `lesson_progress_metrics`

Aggregated learning progress for dashboard display.

| Column                | Type      | Constraints   | Description                      |
|-----------------------|-----------|---------------|----------------------------------|
| `user_id`             | UUID      | PK            | From Keycloak token              |
| `total_lessons`       | INTEGER   | DEFAULT 0     | Total lessons completed          |
| `topic_distribution`  | JSONB     |               | Category breakdown               |
| `last_completed_at`   | TIMESTAMP |               | Most recent lesson completion    |
| `updated_at`          | TIMESTAMP | DEFAULT NOW() | Last recalculation               |

**Purpose**: Fast dashboard queries without scanning `user_learned_lessons`.

---

##### `topic_distribution` JSONB Example

_[JSON code implementation removed - to be added during development]_

---

##### Example Row

_[SQL code implementation removed - to be added during development]_

**Update Trigger**: After `INSERT` into `user_learned_lessons`.

_[SQL code implementation removed - to be added during development]_

---

#### `user_learned_lessons`

Tracks individual lesson completions (for "Recently Completed" list).

| Column           | Type      | Constraints   | Description                    |
|------------------|-----------|---------------|--------------------------------|
| `id`             | UUID      | PK            | Unique completion record       |
| `user_id`        | UUID      | NOT NULL      | From Keycloak token            |
| `slide_group_id` | UUID      | FK, NOT NULL  | References `slide_groups.id`   |
| `collection_id`  | UUID      | FK            | Denormalized for quick queries |
| `topic`          | VARCHAR(50)|              | Denormalized category          |
| `completed_at`   | TIMESTAMP | DEFAULT NOW() | Completion timestamp           |

**Indexes**:
- `idx_ull_user_completed` on `(user_id, completed_at DESC)` for recent list

**Query for Recently Completed** (used in Progress screen):

_[SQL code implementation removed - to be added during development]_

---

### Supporting Tables (for Sleep & Sentiment)

#### `user_journal_responses` (NEW - Optional)

Stores individual slide responses from journal sessions (for sleep_check, emotion_log).

| Column        | Type      | Constraints   | Description                      |
|---------------|-----------|---------------|----------------------------------|
| `id`          | UUID      | PK            | Unique response ID               |
| `user_id`     | UUID      | NOT NULL      | From Keycloak token              |
| `journal_id`  | UUID      | FK            | References `user_journals.id`    |
| `slide_type`  | VARCHAR(50)| NOT NULL     | 'sleep_check', 'emotion_log'     |
| `response`    | JSONB     | NOT NULL      | Slide-specific data              |
| `created_at`  | TIMESTAMP | DEFAULT NOW() | Response timestamp               |

**Indexes**:
- `idx_ujr_user_type` on `(user_id, slide_type, created_at)`

---

##### `response` JSONB Examples

**Sleep Check**:

_[JSON code implementation removed - to be added during development]_

**Emotion Log**:

_[JSON code implementation removed - to be added during development]_

---

##### Example Rows

_[SQL code implementation removed - to be added during development]_

---

## 📊 Progress Screen Queries

### Query 1: Fetch Last 30 Days Summary

_[SQL code implementation removed - to be added during development]_

---

### Query 2: Fetch Learning Metrics

_[SQL code implementation removed - to be added during development]_

---

### Query 3: Time Period Toggle

**Daily** (today only):

_[SQL code implementation removed - to be added during development]_

**Weekly** (last 7 days):

_[SQL code implementation removed - to be added during development]_

**Monthly** (last 30 days - DEFAULT):

_[SQL code implementation removed - to be added during development]_

**All Time**:

_[SQL code implementation removed - to be added during development]_

---

## 🔄 Data Flow Diagram

```
User Journals
    ↓
user_journals table
    ↓
RabbitMQ → Metric Calculator
    ↓
AI Service (sentiment/emotion extraction)
    ↓
Update journal_metrics_daily (today's record)
    ↓
Update user_streaks (check consecutive days)
    ↓
WebSocket → Frontend
    ↓
Progress Screen Refreshes
```

```
User Completes Lesson
    ↓
user_learned_lessons table
    ↓
Trigger: Update lesson_progress_metrics
    ↓
Increment total_lessons
    ↓
Update topic_distribution[category]
    ↓
Frontend Polls/WebSocket
    ↓
Progress Screen Refreshes
```

---

## 🗃️ Sample Data Export (for Testing)

_[SQL code implementation removed - to be added during development]_

---

## 📈 Database Indexes (Summary)

_[SQL code implementation removed - to be added during development]_

---

**Last Updated**: November 23, 2025
