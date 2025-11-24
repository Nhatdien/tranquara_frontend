# 📊 Database Schema Overview - TheraPrep

> Complete database schema documentation for all TheraPrep features

---

## 📑 Table of Contents

- [Schema Architecture](#schema-architecture)
- [User & Authentication](#user--authentication)
- [Journaling System](#journaling-system)
- [Learning & Therapy Prep](#learning--therapy-prep)
- [Metrics & Analytics](#metrics--analytics)
- [Relationships](#relationships)
- [Migration Notes](#migration-notes)

---

## 🏗️ Schema Architecture

### Technology Stack
- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Vector Store**: Qdrant (separate service)

### Design Principles
1. **UUID Primary Keys**: All tables use UUID for distributed scalability
2. **User ID from Keycloak**: `user_id` comes from authentication token, not FK
3. **JSONB for Flexibility**: Settings, metrics, and dynamic content use JSONB
4. **Timestamp Tracking**: All tables track creation with `created_at`
5. **Soft Deletes**: Consider soft deletes for user data (future enhancement)

---

## 👤 User & Authentication

### `user_informations`

Stores user metadata and preferences. `user_id` is **UUID from Keycloak**, not a foreign key.

| Column      | Type          | Constraints | Description                        |
|-------------|---------------|-------------|------------------------------------|
| `user_id`   | UUID          | PK          | From Keycloak authentication token |
| `name`      | TEXT          | NOT NULL    | Full name or preferred name        |
| `age_range` | VARCHAR(50)   |             | Age range (e.g., "25-34")         |
| `gender`    | TEXT          |             | Male/Female/Other/Prefer not to say|
| `kyc_answers` | JSONB       |             | Onboarding questionnaire answers   |
| `settings`  | JSONB         |             | User preferences and settings      |
| `created_at`| TIMESTAMP     | DEFAULT NOW()| Registration date                 |

#### `settings` JSONB Structure

```json
{
  "notifications": {
    "daily_reminder": true,
    "reminder_time": "09:00",
    "weekly_summary": true
  },
  "preferences": {
    "theme": "auto",
    "language": "en",
    "ai_voice_enabled": false
  },
  "privacy": {
    "data_collection": true,
    "analytics": true
  }
}
```

#### `kyc_answers` JSONB Structure

```json
{
  "journey_type": "understand_myself",
  "support_intensity": "light_reflections",
  "goals": ["build_habit", "prepare_therapy"],
  "onboarding_completed_at": "2025-11-21T10:30:00Z"
}
```

---

## ✍️ Journaling System

### `user_journals`

Stores individual journal entries.

| Column      | Type        | Constraints | Description                  |
|-------------|-------------|-------------|------------------------------|
| `id`        | UUID        | PK          | Unique journal entry ID      |
| `user_id`   | UUID        | NOT NULL    | From Keycloak token          |
| `template_id`| UUID       |             | FK to journal template (if used) |
| `title`     | TEXT        |             | User-provided or AI-generated|
| `content`   | TEXT        | NOT NULL    | Full journal content         |
| `mood_score`| FLOAT       |             | Self-reported mood (1-10)    |
| `tags`      | TEXT[]      |             | User or AI-generated tags    |
| `created_at`| TIMESTAMP   | DEFAULT NOW()| When journal was written    |
| `updated_at`| TIMESTAMP   |             | Last modification time       |

**Indexes:**
- `idx_user_journals_user_id` on `user_id`
- `idx_user_journals_created_at` on `created_at`
- `idx_user_journals_tags` on `tags` (GIN index for array search)

---

### `ai_guider_chatlog`

Stores conversation between user and AI during journaling sessions.

| Column      | Type        | Constraints | Description              |
|-------------|-------------|-------------|--------------------------|
| `id`        | UUID        | PK          | Unique message ID        |
| `journal_id`| UUID        | FK, NOT NULL| References `user_journals.id` |
| `user_id`   | UUID        | NOT NULL    | From Keycloak token      |
| `sender_type`| VARCHAR(10)|NOT NULL     | 'user' or 'ai'           |
| `message`   | TEXT        | NOT NULL    | Chat message content     |
| `metadata`  | JSONB       |             | Extra data (emotion hints, etc.) |
| `created_at`| TIMESTAMP   | DEFAULT NOW()| Message timestamp       |

**Indexes:**
- `idx_chatlog_journal_id` on `journal_id`
- `idx_chatlog_created_at` on `created_at`

**Relationships:**
- Many-to-one with `user_journals`
- Cascade delete when journal is deleted

---

### `user_streaks`

Tracks user activity streaks for gamification.

| Column         | Type      | Constraints | Description                      |
|----------------|-----------|-------------|----------------------------------|
| `user_id`      | UUID      | PK          | From Keycloak token              |
| `current_streak`| INTEGER  | DEFAULT 0   | Current consecutive active days  |
| `longest_streak`| INTEGER  | DEFAULT 0   | All-time best streak             |
| `last_active`  | DATE      | NOT NULL    | Last activity date               |
| `total_entries`| INTEGER   | DEFAULT 0   | Lifetime journal count           |
| `updated_at`   | TIMESTAMP | DEFAULT NOW()| Last update timestamp           |

**Logic:**
- Updated daily when user creates journal entry
- Streak breaks if `last_active` is > 1 day old
- `longest_streak` only increases, never decreases

---

## 📚 Learning & Therapy Prep

### `collections`

Groups related lessons/slide groups by topic or purpose.

| Column        | Type         | Constraints | Description                           |
|---------------|--------------|-------------|---------------------------------------|
| `id`          | UUID         | PK          | Unique collection ID                  |
| `title`       | VARCHAR(255) | NOT NULL    | Collection title                      |
| `category`    | VARCHAR(50)  | NOT NULL    | Category (e.g., "mindfulness", "CBT")|
| `description` | TEXT         |             | Short summary                         |
| `type`        | VARCHAR(50)  | NOT NULL    | 'learn' or 'prepare'                  |
| `thumbnail_url`| TEXT        |             | Cover image URL                       |
| `position`    | INTEGER      |             | Display order                         |
| `created_at`  | TIMESTAMP    | DEFAULT NOW()| Creation timestamp                   |

**Types:**
- `learn`: Educational micro-lessons about psychology
- `prepare`: Therapy preparation content

**Indexes:**
- `idx_collections_type` on `type`
- `idx_collections_category` on `category`

---

### `slide_groups`

Individual lessons within a collection, composed of multiple slides.

| Column          | Type         | Constraints | Description                      |
|-----------------|--------------|-------------|----------------------------------|
| `id`            | UUID         | PK          | Unique lesson ID                 |
| `collection_id` | UUID         | FK, NOT NULL| Parent collection                |
| `title`         | VARCHAR(255) | NOT NULL    | Lesson title                     |
| `description`   | TEXT         |             | Short description                |
| `content`       | JSONB        | NOT NULL    | Slide content (see schema below) |
| `position`      | INTEGER      | NOT NULL    | Order within collection          |
| `estimated_duration`| INTEGER  |             | Minutes to complete              |
| `created_at`    | TIMESTAMP    | DEFAULT NOW()| Creation timestamp              |

**Relationships:**
- Many-to-one with `collections` (ON DELETE CASCADE)

#### `content` JSONB Structure

See **[Content Type Schemas Design](./CONTENT_SCHEMAS.md)** for detailed slide type specifications.

**Indexes:**
- `idx_slide_groups_collection` on `collection_id`
- `idx_slide_groups_position` on `position`

---

### `user_learned_lessons`

Tracks which lessons users have completed.

| Column        | Type      | Constraints | Description                    |
|---------------|-----------|-------------|--------------------------------|
| `id`          | UUID      | PK          | Unique completion record       |
| `user_id`     | UUID      | NOT NULL    | From Keycloak token            |
| `slide_group_id`| UUID    | FK, NOT NULL| References `slide_groups.id`   |
| `collection_id`| UUID     | FK          | Denormalized for quick queries |
| `topic`       | VARCHAR(50)|            | Denormalized category          |
| `completed_at`| TIMESTAMP | DEFAULT NOW()| Completion timestamp          |

**Indexes:**
- `idx_user_learned_user_id` on `user_id`
- `idx_user_learned_completed` on `completed_at`
- Unique constraint on `(user_id, slide_group_id)` to prevent duplicates

---

## 📈 Metrics & Analytics

### `journal_metrics_daily`

Daily aggregated metrics for user journaling activity and emotional data.

| Column                | Type      | Constraints | Description                           |
|-----------------------|-----------|-------------|---------------------------------------|
| `id`                  | UUID      | PK          | Unique daily metric ID                |
| `user_id`             | UUID      | NOT NULL    | From Keycloak token                   |
| `date`                | DATE      | NOT NULL    | The day these metrics represent       |
| `entry_count`         | INTEGER   | DEFAULT 0   | Number of entries that day            |
| `streak_days`         | INTEGER   | DEFAULT 0   | Active streak count on that day       |
| `avg_sentiment`       | FLOAT     |             | Average sentiment score (-1 to +1)    |
| `emotion_variety_index`| FLOAT    |             | Diversity of emotions (0-1)          |
| `emotional_intensity` | FLOAT     |             | Average emotion intensity             |
| `dominant_emotions`   | TEXT[]    |             | Most frequent emotions                |
| `emotion_word_freq`   | JSONB     |             | {"calm":3, "anxious":2, ...}         |
| `mood_stability_index`| FLOAT     |             | Consistency of mood (higher = stable)|
| `updated_at`          | TIMESTAMP | DEFAULT NOW()| Last calculation time                |

**Unique Constraint:** `(user_id, date)`

**Purpose:**
- Powers trend charts and emotion heatmaps
- Feeds into weekly/monthly summaries
- Provides AI with temporal context

---

### `user_metrics`

Weekly/monthly aggregated summary metrics.

| Column                  | Type        | Constraints | Description                    |
|-------------------------|-------------|-------------|--------------------------------|
| `id`                    | UUID        | PK          | Unique metric summary ID       |
| `user_id`               | UUID        | NOT NULL    | From Keycloak token            |
| `metric_period`         | VARCHAR(10) | NOT NULL    | 'weekly' or 'monthly'          |
| `start_date`            | DATE        | NOT NULL    | Period start                   |
| `end_date`              | DATE        | NOT NULL    | Period end                     |
| `mood_avg`              | FLOAT       |             | Mean mood score                |
| `sentiment_trend`       | FLOAT       |             | Slope of sentiment over period |
| `top_emotions`          | TEXT[]      |             | Most frequent emotions         |
| `emotion_diversity_score`| FLOAT      |             | Aggregated variety index       |
| `stability_score`       | FLOAT       |             | Aggregated mood stability      |
| `streak_score`          | INTEGER     |             | Weighted streak activity       |
| `theme_counts`          | JSONB       |             | {"stress":4, "sleep":3, ...}  |
| `created_at`            | TIMESTAMP   | DEFAULT NOW()| Creation timestamp            |

**Indexes:**
- `idx_user_metrics_user_period` on `(user_id, metric_period, start_date)`

**Derived From:** `journal_metrics_daily` via scheduled jobs

---

### `lesson_progress_metrics`

Aggregated learning progress for dashboard display.

| Column              | Type      | Constraints | Description                      |
|---------------------|-----------|-------------|----------------------------------|
| `id`                | UUID      | PK          | Unique metric ID                 |
| `user_id`           | UUID      | PK          | From Keycloak token              |
| `total_lessons`     | INTEGER   | DEFAULT 0   | Total lessons completed          |
| `topic_distribution`| JSONB     |             | {"mindfulness":6, "stress":3}   |
| `last_completed_at` | TIMESTAMP |             | Most recent lesson completion    |
| `updated_at`        | TIMESTAMP | DEFAULT NOW()| Last recalculation              |

**Purpose:** Fast dashboard queries without scanning `user_learned_lessons`

---

## 🔗 Relationships

### Entity Relationship Diagram

```
user_informations (Keycloak UUID)
    │
    ├──< user_journals
    │       ├──< ai_guider_chatlog
    │       └──< journal_metrics_daily
    │
    ├──< user_streaks
    │
    ├──< user_learned_lessons
    │       └──> slide_groups
    │               └──> collections
    │
    ├──< user_metrics
    │
    └──< lesson_progress_metrics
```

### Key Relationships

1. **User to Journals**: One-to-many
   - User can have unlimited journals
   - Journals soft-deleted (optional future enhancement)

2. **Journal to Chatlog**: One-to-many
   - Each journal session has conversation history
   - Cascade delete when journal deleted

3. **Collections to Slide Groups**: One-to-many
   - Collections organize lessons
   - Cascade delete slide groups when collection deleted

4. **User to Learned Lessons**: Many-to-many (via junction)
   - Tracks completion status
   - Unique constraint prevents duplicate completions

5. **Metrics**: Denormalized aggregations
   - No direct foreign keys (performance optimization)
   - Recalculated on schedule

---

## 🚀 Migration Notes

### Initial Setup

```bash
# Generate migration
npx drizzle-kit generate:pg

# Run migration
npx drizzle-kit push:pg
```

### Migration Strategy

1. **User Data**: Never delete, only soft-delete or archive
2. **Metrics**: Can be regenerated from source tables
3. **Content**: Use versioning for slide_groups content updates
4. **Indexes**: Add as needed based on query patterns

### Performance Considerations

- **Partitioning**: Consider partitioning `journal_metrics_daily` by date range (future)
- **Archiving**: Move old journals to archive table after 2+ years
- **Caching**: Use Redis for frequently accessed metrics
- **Vector Store**: Qdrant handles semantic search separately from PostgreSQL

---

## 🔍 Querying Examples

### Get User's Recent Journals

```sql
SELECT id, title, content, created_at
FROM user_journals
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 10;
```

### Calculate Current Streak

```sql
SELECT 
  CASE 
    WHEN CURRENT_DATE - last_active <= 1 THEN current_streak
    ELSE 0
  END as active_streak
FROM user_streaks
WHERE user_id = $1;
```

### Get Weekly Emotion Trends

```sql
SELECT date, avg_sentiment, dominant_emotions
FROM journal_metrics_daily
WHERE user_id = $1
  AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date ASC;
```

---

## 📚 Related Documentation

- **[Content Type Schemas](./CONTENT_SCHEMAS.md)** - Slide content structure
- **[Database Design V2](./database-design-v2.md)** - Evolution and comparisons
- **[Architecture Considerations](./architecture-notes.md)** - Scalability and performance
- **[Feature Documentation](../README.md)** - Feature-specific data models

---

**Last Updated**: November 21, 2025  
**Schema Version**: 1.0.0
