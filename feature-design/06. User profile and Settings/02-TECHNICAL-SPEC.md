# ⚙️ Settings - Technical Specification

This document provides implementation details for the Settings feature, including architecture, APIs, security patterns, notification scheduling, data sync, and third-party integrations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Settings Sync Strategy](#settings-sync-strategy)
3. [Theme System](#theme-system)
4. [Notification Scheduling](#notification-scheduling)
5. [Security: PIN & Biometric](#security-pin--biometric)
6. [AI Memory Generation](#ai-memory-generation)
7. [Data Export/Import](#data-exportimport)
8. [Account Deletion](#account-deletion)
9. [API Endpoints](#api-endpoints)
10. [Performance Targets](#performance-targets)
11. [Third-Party Libraries](#third-party-libraries)

---

## Architecture Overview

### Component Structure

```
Settings Feature
│
├── UI Layer (Nuxt 3 + Vue 3 + Capacitor)
│   ├── SettingsScreen.vue          - Main settings container
│   ├── AccountSection.vue           - Name, email, join date
│   ├── NotificationSettings.vue     - Morning/evening reminders
│   ├── SecuritySettings.vue         - PIN, biometric, auto-lock
│   ├── PersonalizationSettings.vue  - Theme, language, font
│   ├── AIPrivacySettings.vue        - AI toggle, Your Story, memory viewer
│   ├── DataManagementSettings.vue   - Export, import, delete
│   └── AIMemoryScreen.vue           - Full-screen AI memory view
│
├── State Management (Pinia)
│   ├── useSettingsStore.ts          - Global settings state
│   ├── useThemeStore.ts             - Theme state + system detection
│   └── useNotificationStore.ts      - Notification permissions + schedule
│
├── Services (Composables)
│   ├── useSettingsService.ts        - CRUD for settings
│   ├── useSyncService.ts            - Background sync to cloud
│   ├── useNotificationService.ts    - Schedule/cancel notifications (Capacitor Local Notifications)
│   ├── useSecurityService.ts        - PIN hashing, biometric auth (Capacitor Biometric)
│   ├── useExportService.ts          - Generate JSON exports
│   ├── useImportService.ts          - Validate and merge imports
│   └── useAIMemoryService.ts        - Fetch/clear AI memory
│
└── Storage (Capacitor)
    ├── Capacitor Preferences (Local Storage)
    │   ├── settings_global            - Synced settings (theme, language)
    │   ├── settings_local             - Device-specific (notification times)
    │   └── ai_memory_cache            - Cached AI memory
    │
    └── Capacitor SecureStorage (Encrypted)
        ├── pin_hash                   - Hashed PIN
        ├── biometric_enabled          - Boolean flag
        ├── keycloak_access_token      - Keycloak JWT (15min)
        └── keycloak_refresh_token     - Keycloak refresh token (30d)
```

---

## Settings Sync Strategy

### Storage Architecture Note

**Settings uses Capacitor Preferences (NOT SQLite)** because:
- ✅ Small data volume (< 1KB of key-value pairs)
- ✅ Simple read/write operations (no complex queries)
- ✅ Low frequency updates (user changes settings occasionally)
- ✅ Perfect for key-value storage

**For comparison**: Journal entries and lessons use SQLite (`@capacitor-community/sqlite`) due to high data volume and complex querying needs.

### Global vs Device-Specific Settings

**Global Settings** (synced across devices):
- `theme` (light/dark/auto)
- `language` (en, es, fr, etc.)
- `ai_enabled` (AI personalization on/off)
- `your_story` (user-provided context)
- `data_collection` (analytics opt-in)
- `font_size` (small/medium/large)
- `reduce_motion` (accessibility)

**Device-Specific Settings** (local only):
- `notification_times` (morning_time, evening_time)
- `auto_lock_timeout` (immediate, 1min, 5min, etc.)
- `biometric_enabled` (device biometric availability varies)
- `pin_hash` (device-specific security)

### Sync Mechanism

**When to Sync**:
- User changes a global setting → Immediate sync
- App enters background → Debounced sync (30s delay)
- App reopens → Pull latest settings from cloud
- Conflict resolution: Last-write-wins (timestamp-based)

**Sync Process**:
_[TYPESCRIPT code implementation removed - to be added during development]_

**Backend Storage** (PostgreSQL):
_[SQL code implementation removed - to be added during development]_

---

## Theme System

### Implementation

**Theme Detection Flow**:
_[TYPESCRIPT code implementation removed - to be added during development]_

**Theme Variables** (CSS):
```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --accent: #4A90E2;
}

.dark {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2A2A2A;
  --text-primary: #FFFFFF;
  --text-secondary: #AAAAAA;
  --accent: #6AB0F3;
}
```

**Platform-Specific**:
- **iOS**: Respects system theme via Capacitor Preferences
- **Android**: Respects system theme via Capacitor Preferences
- **Web**: Respects system theme via `window.matchMedia('(prefers-color-scheme: dark)')`

---

## Notification Scheduling

### Platform Implementation

**Capacitor Local Notifications Plugin** (Cross-platform):
_[TYPESCRIPT code implementation removed - to be added during development]_

**Platform-Specific Notes**:
- **iOS**: Uses UNUserNotificationCenter
- **Android**: Uses NotificationCompat with AlarmManager
- **Web**: Uses Web Notifications API (requires permission)

**Weekly Summary Notification**:
_[TYPESCRIPT code implementation removed - to be added during development]_

### Notification Permissions

**Check and Request** (Capacitor):
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## Security: PIN & Biometric

### PIN Implementation

**Hashing Algorithm** (bcrypt):
_[TYPESCRIPT code implementation removed - to be added during development]_

### Biometric Authentication

**Capacitor Biometric Plugin** (iOS/Android):
_[TYPESCRIPT code implementation removed - to be added during development]_

**Platform Support**:
- **iOS**: Face ID / Touch ID
- **Android**: Fingerprint / Face Unlock
- **Web**: WebAuthn (future enhancement)

### App Lock Flow

**On App Launch**:
_[TYPESCRIPT code implementation removed - to be added during development]_

### Forgot PIN Recovery

**Flow** (aligns with login pattern):
_[TYPESCRIPT code implementation removed - to be added during development]_

**Future Enhancement**: Email/SMS recovery
_[TYPESCRIPT code implementation removed - to be added during development]_

---

## AI Memory Generation

### Overview

AI Memories are short, factual insights the AI extracts from the user's journal entries over time. They represent what the AI "knows" about the user — values, habits, relationships, struggles, goals, and preferences. Users can view and delete individual memories from the **About You** settings page.

**Examples**:
- *"I value my family."* (category: values)
- *"Sleep quality drops when stressed about deadlines."* (category: patterns)
- *"Making progress on setting boundaries with coworkers."* (category: growth)

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AI Memory Pipeline                              │
│                                                                     │
│  ┌─────────┐   12h cron    ┌──────────────┐   extract    ┌───────┐ │
│  │ Journals │──────────────▶│ AI Processor │─────────────▶│ GPT   │ │
│  │ (Qdrant) │              │ (Python)     │◀─────────────│ 4o-m  │ │
│  └─────────┘               └──────┬───────┘  memories    └───────┘ │
│                                   │                                 │
│                    ┌──────────────┼──────────────┐                  │
│                    ▼              ▼              ▼                  │
│              ┌──────────┐  ┌──────────┐  ┌───────────┐             │
│              │PostgreSQL│  │  Qdrant  │  │ RabbitMQ  │             │
│              │(CRUD/    │  │(RAG      │  │(notify Go │             │
│              │ source   │  │ inject)  │  │ backend)  │             │
│              │ of truth)│  │          │  │           │             │
│              └────┬─────┘  └──────────┘  └─────┬─────┘             │
│                   │                            │                    │
│                   ▼                            ▼                    │
│              ┌──────────┐              ┌──────────────┐            │
│              │ Go API   │◀─────────────│ Go Backend   │            │
│              │ GET/DEL  │              │ (stores in   │            │
│              │ memories │              │  PostgreSQL) │            │
│              └────┬─────┘              └──────────────┘            │
│                   │                                                 │
│                   ▼                                                 │
│              ┌──────────┐                                          │
│              │ Frontend │                                          │
│              │ (About   │                                          │
│              │  You)    │                                          │
│              └──────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Model

```python
# Memory record
{
    "id": "uuid",                           # Unique memory ID
    "user_id": "uuid",                      # Owner
    "content": "I value my family.",        # The insight (short sentence)
    "category": "values",                   # One of: values, habits, relationships,
                                            #         goals, struggles, preferences, patterns, growth
    "source_journal_ids": ["uuid1", "uuid2"], # Journals this was derived from
    "confidence": 0.85,                     # AI confidence score (0.0 - 1.0)
    "created_at": "2026-03-04T12:00:00Z",
    "updated_at": "2026-03-04T12:00:00Z"
}
```

### Periodic Generation Job (Every 12 Hours)

**Trigger**: APScheduler cron job in the Python AI service (runs at 00:00 and 12:00 UTC).

**Process**:
1. Fetch list of active user IDs from Go backend (`GET /api/internal/active-users`)
2. For each user:
   a. Retrieve journals created/updated since the last memory generation run
   b. If no new journals → skip user
   c. Fetch existing memories for the user from PostgreSQL (via Go backend)
   d. Send journal content + existing memories to GPT-4o-mini with extraction prompt
   e. GPT returns a list of new candidate memories
   f. **Deduplication**: For each candidate, compute semantic similarity against existing memories using embeddings. If similarity > 0.85 → skip (duplicate)
   g. Store new unique memories → PostgreSQL (via Go backend) + Qdrant (for RAG)
3. Log summary: `[memories] User {id}: {n} new memories extracted, {m} duplicates skipped`

**Failure Handling**:
- Per-user failures don't block other users
- Failed users are retried in the next 12h cycle
- Max 3 retries per user per cycle before logging and skipping

### AI Memory Extraction Prompt

```
You are analyzing journal entries to extract factual insights about the user.

Extract SHORT, FACTUAL statements about the user. Each statement should be:
- Written in first person or third person observation (e.g., "I value..." or "Values family")
- One sentence maximum
- A genuine insight, NOT a summary of what they wrote
- Categorized as one of: values, habits, relationships, goals, struggles, preferences, patterns, growth

EXISTING MEMORIES (do NOT duplicate these):
{existing_memories}

JOURNAL ENTRIES TO ANALYZE:
{journal_entries}

Return a JSON array of new insights only:
[
  {"content": "I value my family.", "category": "values", "confidence": 0.9},
  {"content": "Sleep quality drops when stressed about deadlines.", "category": "patterns", "confidence": 0.75}
]

Rules:
- Only extract genuinely new insights not already covered by existing memories
- Confidence should reflect how clearly the journal supports this insight (0.5-1.0)
- Prefer fewer high-quality insights over many shallow ones
- Maximum 5 new insights per batch
- If no new insights can be extracted, return an empty array []
```

### Deduplication Strategy

**Semantic deduplication** using OpenAI embeddings:
1. Embed each candidate memory using `text-embedding-ada-002`
2. Compare cosine similarity against all existing user memories
3. If any existing memory has similarity ≥ 0.85 → candidate is a duplicate, skip it
4. This catches paraphrases (e.g., "I love my family" ≈ "I value my family")

### Dual Storage Strategy

**PostgreSQL** (source of truth for CRUD):
- User can list all memories via `GET /api/ai-memories`
- User can delete individual memories via `DELETE /api/ai-memories/:id`
- Hard delete — permanently removed, AI may regenerate from future journals
- Supports cross-device sync via existing sync pipeline

**Qdrant** (for RAG injection):
- Memories indexed into a `user_memories` collection (separate from `journal_entries`)
- When generating follow-up questions, RAG retrieves both past journals AND memories
- Memories provide stable, distilled context (vs. raw journal text)
- When a memory is deleted from PostgreSQL → also deleted from Qdrant

### Frontend Caching

**Pinia store** with simple fetch-on-mount:
- Memories loaded when user opens the "About You" page
- No TTL cache — always fetches fresh from API (memories change infrequently)
- Optimistic delete: remove from local state immediately, API call in background
- Error handling: re-add to local state if API delete fails

### RAG Integration

When generating journal follow-up questions, the AI processor now retrieves:
1. **Past journal vectors** from `journal_entries` collection (existing)
2. **Memory vectors** from `user_memories` collection (NEW)

Both are injected into the prompt context. Memories provide stable, high-level user understanding while journals provide specific recent context.

---

## Data Export/Import

### Export Implementation

**Backend API** (Go):
_[GO code implementation removed - to be added during development]_

**Large Export Handling** (Background Job):
_[GO code implementation removed - to be added during development]_

### Import Implementation

**Backend API** (Go):
_[GO code implementation removed - to be added during development]_

**Duplicate Detection**:
_[GO code implementation removed - to be added during development]_

---

## Account Deletion

### Immediate Deletion

**Backend API**:
_[GO code implementation removed - to be added during development]_

### Grace Period Deletion

**Mark for Deletion**:
_[GO code implementation removed - to be added during development]_

**Cron Job for Permanent Deletion**:
_[GO code implementation removed - to be added during development]_

**Account Recovery**:
_[GO code implementation removed - to be added during development]_

---

## API Endpoints

### Settings CRUD

```
GET    /api/settings                 - Get user settings
PUT    /api/settings                 - Update settings (global)
PUT    /api/settings/device          - Update device-specific settings
GET    /api/settings/sync            - Pull latest settings from cloud
```

### Notifications

```
POST   /api/notifications/schedule   - Schedule notification
DELETE /api/notifications/:id        - Cancel notification
GET    /api/notifications             - List scheduled notifications
```

### Security

```
POST   /api/security/pin              - Set PIN
PUT    /api/security/pin              - Change PIN (requires current PIN)
DELETE /api/security/pin              - Remove PIN
POST   /api/security/biometric        - Enable biometric
DELETE /api/security/biometric        - Disable biometric
```

### AI Memory

```
GET    /api/ai-memories               - List all memories for authenticated user
                                        Query params: ?category=values (optional filter)
                                        Response: { memories: [...], total: 12 }

DELETE /api/ai-memories/:id           - Hard delete a single memory
                                        Also removes from Qdrant

PUT    /api/ai-memory/story           - Update "Your Story" (unchanged)
```

### AI Memory (Internal — AI Service → Go Backend)

```
POST   /api/internal/ai-memories/batch  - Batch create memories (called by Python AI service)
                                          Body: { user_id, memories: [...] }
                                          Handles dedup check server-side as fallback

GET    /api/internal/ai-memories/:user_id - Get existing memories for a user
                                            Used by Python service for dedup context

GET    /api/internal/active-users       - Get list of user IDs with recent journal activity
                                          Query: ?since=2026-03-04T00:00:00Z
```

### Data Management

```
POST   /api/export                    - Generate data export
GET    /api/export/:job_id/status     - Check export job status
POST   /api/import                    - Import data from JSON
```

### Account

```
DELETE /api/account                   - Delete account (with grace period option)
POST   /api/account/recover           - Recover deleted account
GET    /api/account/deletion-status   - Check deletion status
```

---

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Settings screen load | < 500ms | Cached locally, no API call |
| Theme change | < 100ms | Instant UI update, sync in background |
| Save setting | < 200ms | Optimistic UI, background sync |
| Notification schedule | < 1s | Platform API call |
| PIN verification | < 500ms | bcrypt comparison |
| Biometric auth | < 2s | Device API + fallback |
| AI memory fetch | < 1s | REST API, no cache TTL |
| AI memory delete | < 500ms | Optimistic UI, background API |
| Memory generation (per user) | < 30s | GPT extraction + dedup + storage |
| Memory generation (full cycle) | < 10min | All active users, parallel batches |
| Export generation | < 5s (< 1000 entries) | Background job for larger |
| Import validation | < 2s | File parsing + duplicate check |
| Account deletion | < 3s | Immediate, or grace period marker |

---

## Third-Party Libraries

### Frontend (Nuxt 3 + Capacitor)

**Core Framework**:
- `nuxt`: ^3.x - Meta-framework for Vue 3
- `vue`: ^3.x - Progressive JavaScript framework
- `@capacitor/core`: ^6.x - Native bridge
- `@capacitor/ios`: ^6.x - iOS platform
- `@capacitor/android`: ^6.x - Android platform

**Capacitor Plugins**:
- `@capacitor/preferences`: ^6.x - Local storage
- `@capacitor/secure-storage`: ^6.x - Encrypted storage (use Preferences with encryption wrapper)
- `@capacitor/local-notifications`: ^6.x - Notification scheduling
- `@capacitor/biometric-auth`: ^1.x - Biometric authentication
- `@capacitor/filesystem`: ^6.x - File export/import
- `@capacitor/share`: ^6.x - System share dialog

**State & UI**:
- `pinia`: ^2.x - State management
- `@nuxtjs/tailwindcss`: ^6.x - Styling
- `@nuxtjs/color-mode`: ^3.x - Theme management

### Backend

_[GO code implementation removed - to be added during development]_

### Python (AI Service)

```txt
# requirements.txt (relevant additions)
langchain-openai              # OpenAI GPT-4o-mini + embeddings
qdrant-client                 # Qdrant vector database client
langchain-qdrant              # LangChain ↔ Qdrant integration
pika                          # RabbitMQ consumer
apscheduler==3.10.4           # Periodic job scheduler (12h memory generation)
httpx                         # Async HTTP client (calls Go backend internal APIs)
```

---

**Last Updated**: March 4, 2026
