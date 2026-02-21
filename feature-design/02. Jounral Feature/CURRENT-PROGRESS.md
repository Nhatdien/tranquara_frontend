# 📊 Journaling Feature - Current Progress Report

**Document Created**: February 8, 2026  
**Last Updated**: February 8, 2026  
**Status**: 🟡 In Development  

---

## 📋 Executive Summary

The journaling feature is a core component of TheraPrep that enables AI-assisted emotion journaling with offline-first capabilities. The implementation spans three services:

| Service | Progress | Description |
|---------|----------|-------------|
| **Frontend (Nuxt 3)** | 🟢 75% | SQLite storage, sync, UI components, TipTap editor |
| **Core Service (Go)** | 🟢 80% | CRUD API endpoints, PostgreSQL models, templates |
| **AI Service (Python)** | 🟢 70% | "Go Deeper" question generation, LangChain integration |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Nuxt 3)                           │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Pages          │  │ Components   │  │ Services                │  │
│  │ - index.vue    │  │ - Slide/*    │  │ - SQLiteService         │  │
│  │ - [id].vue     │  │ - Journal/*  │  │ - JournalsRepository    │  │
│  │                │  │ - TipTap/*   │  │ - SyncService           │  │
│  └───────┬────────┘  └──────────────┘  │ - NetworkMonitor        │  │
│          │                             └───────────┬─────────────┘  │
│          ▼                                         │                │
│  ┌────────────────────────────────────────────────▼─────────────┐  │
│  │           Pinia Store (user_journal.ts)                      │  │
│  │  - Offline-first data management                             │  │
│  │  - Bi-directional sync orchestration                         │  │
│  │  - Template & journal caching                                │  │
│  └────────────────────────────┬─────────────────────────────────┘  │
│                               │                                     │
│  ┌────────────────────────────▼─────────────────────────────────┐  │
│  │           TranquaraSDK (API Client)                          │  │
│  │  - getJournals(), createJournal(), syncJournal()             │  │
│  │  - getAllTemplates()                                         │  │
│  │  - analyzeJournal() → AI Service                             │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────────┐  ┌───────────────────────┐
│  CORE SERVICE (Go)   │  │   AI SERVICE (Python) │
│  Port: 4000          │  │   FastAPI + LangChain │
│  ────────────────    │  │   ─────────────────── │
│  Endpoints:          │  │   Endpoints:          │
│  GET /v1/journals    │  │   POST /analyze       │
│  POST /v1/journal    │  │   WS /ws/{user_uuid}  │
│  PUT /v1/journal     │  │                       │
│  DELETE /v1/journal  │  │   Features:           │
│  GET /v1/tempalte-   │  │   - "Go Deeper"       │
│      gallary         │  │     questions         │
│                      │  │   - 5 reflection      │
│  Database:           │  │     directions        │
│  - PostgreSQL        │  │   - Prompt templates  │
│  - user_journals     │  │                       │
│  - journal_templates │  │   LLM: GPT-4o-mini    │
└──────────────────────┘  └───────────────────────┘
```

---

## ✅ Completed Components

### Frontend (tranquara_frontend)

#### 1. Pinia Store (`stores/stores/user_journal.ts`)
**Status**: ✅ Complete

| Feature | Status | Description |
|---------|--------|-------------|
| `initializeDatabase()` | ✅ | Initialize SQLite + Network Monitor + Sync Service |
| `loadTemplatesFromLocal()` | ✅ | Load cached templates from SQLite |
| `refreshTemplatesFromServer()` | ✅ | Fetch templates from API and cache |
| `loadJournalsFromLocal()` | ✅ | Load journals from SQLite by user ID |
| `syncDownloadFromServer()` | ✅ | Pull journals from server to local |
| `fullBiDirectionalSync()` | ✅ | Complete sync: download → upload → reload |
| `createJournal()` | ✅ | Offline-first create with sync queue |
| `updateJournal()` | ✅ | Offline-first update with sync queue |
| `deleteJournal()` | ✅ | Soft delete with sync pending |
| `searchJournals()` | ✅ | Full-text search in SQLite |
| `getJournalsByCollection()` | ✅ | Filter journals by template |

**State Properties**:
```typescript
state: {
  templates: LocalTemplate[],      // Cached templates
  journals: LocalJournal[],        // User's journals
  currentWritingContent: {},       // Draft content per slide
  currentMoodScore: 5,             // 1-10 scale
  currentMoodLabel: "Okay",        // Text label
  currentJournal: LocalJournal,    // Currently editing
  isInitialized: boolean,          // DB ready flag
  isSyncing: boolean,              // Sync in progress
  isOnline: boolean,               // Network status
}
```

#### 2. SQLite Repository (`services/sqlite/journals_repository.ts`)
**Status**: ✅ Complete

| Method | Status | Description |
|--------|--------|-------------|
| `create()` | ✅ | Insert with client-generated UUID |
| `getById()` | ✅ | Get by local ID |
| `getByServerId()` | ✅ | Get by server UUID |
| `getAllByUserId()` | ✅ | List with pagination |
| `getByCollectionId()` | ✅ | Filter by template |
| `update()` | ✅ | Update + mark needs_sync=1 |
| `delete()` | ✅ | Soft delete (is_deleted=1) |
| `hardDelete()` | ✅ | Physical removal after sync |
| `getPendingSync()` | ✅ | Get journals needing upload |
| `markAsSynced()` | ✅ | Update server_id + clear needs_sync |
| `upsertFromServer()` | ✅ | Merge server data with conflict resolution |
| `syncFromServer()` | ✅ | Batch sync with stats |
| `search()` | ✅ | Full-text search with LIKE |

**SQLite Schema**:
```sql
CREATE TABLE user_journals (
  id TEXT PRIMARY KEY,           -- Client UUID
  server_id TEXT,                -- Server UUID (after sync)
  user_id TEXT NOT NULL,
  collection_id TEXT,
  title TEXT,
  content TEXT NOT NULL,         -- TipTap JSON
  content_html TEXT,
  mood_score INTEGER,            -- 1-10
  mood_label TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  is_deleted INTEGER DEFAULT 0
);
```

#### 3. Sync Services (`services/sync/`)
**Status**: ✅ Complete

| Service | Status | Description |
|---------|--------|-------------|
| `SyncService` | ✅ | Orchestrates background sync with batching |
| `SyncQueue` | ✅ | Manages pending items with retry logic |
| `NetworkMonitor` | ✅ | Capacitor Network plugin wrapper |

**Sync Flow**:
1. Journal created → saved to SQLite with `needs_sync=1`
2. Added to `SyncQueue`
3. If online, `SyncService.syncAll()` triggered
4. On success, `markAsSynced()` updates record
5. On failure, retry with exponential backoff (max 3 retries)

#### 4. TypeScript Types (`types/user_journal.ts`)
**Status**: ✅ Complete

```typescript
// Core types implemented:
- Journal              // Server model
- LocalJournal         // Local with sync metadata
- JournalTemplate      // Collection definition
- LocalTemplate        // Cached template
- SlideGroup           // Group of slides
- SlideData            // Individual slide config
- CreateJournalRequest // API request body
- TipTapNode           // Rich text content
```

#### 5. UI Pages
**Status**: ✅ Complete

| Page | Status | Features |
|------|--------|----------|
| `pages/journaling/index.vue` | ✅ | Free-form journaling with TipTap |
| `pages/journaling/[id].vue` | ✅ | Edit existing journal (free-form or template) |

**UI Components**:
- Header with title input + save button
- Date display
- TipTap markdown editor
- Mood picker (EmotionSliderV2, 1-10 scale)
- "Go Deeper" AI button with loading state
- Auto-save status indicator

#### 6. Journal Components (`components/Journal/`)
**Status**: ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `ChatScreen.vue` | ✅ | AI chat interface |
| `CollectionList.vue` | ✅ | Browse template collections |
| `EditModalContents.vue` | ✅ | Edit slide-based journals |
| `GoDeepDirections.vue` | ✅ | 5 reflection direction picker |
| `ModalContents.vue` | ✅ | New journal modal |
| `ResumeJournaling.vue` | ✅ | Resume incomplete sessions |
| `TemplateCard.vue` | ✅ | Template display card |
| `TemplateCardV2.vue` | ✅ | Updated template card |
| `TemplateList.vue` | ✅ | Template list view |
| `TemplateListV2.vue` | ✅ | Updated template list |

#### 7. Slide Components (`components/Slide/`)
**Status**: ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `MoodSlide.vue` | ✅ | Emotion log (1-10 slider) |
| `SleepCheck.vue` | ✅ | Sleep hours (0-12) |
| `JournalPrompt.vue` | ✅ | Text input with AI |
| `Document.vue` | ✅ | Educational content |
| `CTA.vue` | ✅ | Call to action slide |
| `FurtherReading.vue` | ✅ | Additional resources |

---

### Core Service (tranquara_core_service)

#### 1. API Handlers (`cmd/api/user_journal.go`)
**Status**: ✅ Complete

| Endpoint | Method | Handler | Status |
|----------|--------|---------|--------|
| `/v1/journal` | GET | `GetUserJournal` | ✅ |
| `/v1/journals` | GET | `GetUserJournals` | ✅ |
| `/v1/journal` | POST | `CreateUserJournal` | ✅ |
| `/v1/journal` | PUT | `UpdateUserJournal` | ✅ |
| `/v1/journal` | DELETE | `DeleteUserJournal` | ✅ |
| `/v1/tempalte-gallary` | GET | `GetAllTemplates` | ✅ |

#### 2. Data Models (`internal/data/user_journal.go`)
**Status**: ✅ Complete

```go
type UserJournal struct {
  ID           uuid.UUID   `json:"id"`
  UserID       uuid.UUID   `json:"user_id"`
  CollectionID *uuid.UUID  `json:"collection_id,omitempty"`
  Title        string      `json:"title"`
  Content      string      `json:"content"`
  ContentHTML  *string     `json:"content_html,omitempty"`
  MoodScore    *int        `json:"mood_score,omitempty"`
  MoodLabel    *string     `json:"mood_label,omitempty"`
  CreatedAt    time.Time   `json:"created_at"`
  UpdatedAt    time.Time   `json:"updated_at"`
}

type JournalTemplate struct {
  ID          uuid.UUID       `json:"id"`
  Title       string          `json:"title"`
  Description *string         `json:"description,omitempty"`
  Category    string          `json:"category"`
  SlideGroups json.RawMessage `json:"slide_groups"` // JSONB
  IsActive    bool            `json:"is_active"`
  CreatedAt   time.Time       `json:"created_at"`
  UpdatedAt   time.Time       `json:"updated_at"`
}
```

#### 3. Database Operations
**Status**: ✅ Complete

| Method | Status | Description |
|--------|--------|-------------|
| `Get()` | ✅ | Get journal by ID + user ID |
| `GetList()` | ✅ | List all user journals |
| `GetAllTemplates()` | ✅ | List active templates |
| `Insert()` | ✅ | Create with RETURNING |
| `Update()` | ✅ | Update with RETURNING |
| `Delete()` | ✅ | Hard delete |

#### 4. Database Migrations
**Status**: ✅ Complete

| Migration | Status | Description |
|-----------|--------|-------------|
| `000010_create_user_journals_table` | ✅ | Core journals table |
| `000014_create_journal_templates_table` | ✅ | Templates table |
| `000015_update_user_journals_schema` | ✅ | Add mood_score, mood_label, content_html |
| `000016_update_journal_templates_schema` | ✅ | Add slide_groups JSONB |
| `000017_seed_journal_templates` | ✅ | Initial template data |

---

### AI Service (tranquara_ai_service)

#### 1. AI Processor (`service/ai_service_processor.py`)
**Status**: ✅ Complete

| Method | Status | Description |
|--------|--------|-------------|
| `call_model()` | ✅ | LangGraph model invocation |
| `response_chat()` | ✅ | WebSocket chat response |
| `generate_journal_question()` | ✅ | "Go Deeper" question generation |

**"Go Deeper" Features**:
- Accepts current journal content
- Mood score context (1-10)
- Slide prompt context (for templates)
- Full slide group context
- 5 reflection directions:
  - `why` - Understand causes (CBT-based)
  - `emotions` - Explore feelings (DBT-based)
  - `patterns` - Recognize themes
  - `challenge` - Reframe thinking
  - `growth` - Action-oriented

#### 2. Prompt System (`service/prompts.py`)
**Status**: ✅ Complete

**Base System Prompt** (Lumi AI persona):
- Warm, empathetic AI companion
- Generates thoughtful follow-up questions
- Non-judgmental, no clinical diagnoses
- Open-ended questions for reflection

**Direction Prompts**:
- Each direction has therapeutic foundation
- Specific question focus areas
- Examples of appropriate questions

#### 3. Models (`models/journal.py`)
**Status**: 🟡 Basic

```python
class UserJournal(BaseModel):
    title: str
    content: str
```

*Note: Model is minimal, actual processing uses inline parameters.*

---

## 🔄 Data Flow Diagrams

### Journal Creation Flow (Offline-First)

```
User Types → TipTap Editor → Vue Reactive Binding
                                    │
                                    ▼
                        Pinia Store Action
                        createJournal()
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            JournalsRepo     Update Store     SyncQueue
            .create()        journals[]       .addToQueue()
                    │                               │
                    ▼                               │
              SQLite DB                             │
           (needs_sync=1)                           │
                                                    │
                    ◄───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │           Online?             │
                    ▼                               ▼
              [Yes] Sync                    [No] Queue for later
            SyncService.syncAll()           NetworkMonitor waits
                    │
                    ▼
           TranquaraSDK
           .createJournal()
                    │
                    ▼
           Core Service API
           POST /v1/journal
                    │
                    ▼
           PostgreSQL Insert
                    │
                    ▼
           Response: {id: uuid}
                    │
                    ▼
           JournalsRepo
           .markAsSynced(clientId, serverId)
                    │
                    ▼
           SQLite Update
           (server_id=uuid, needs_sync=0)
```

### "Go Deeper" Flow

```
User taps "Go Deeper" button
            │
            ▼
    TranquaraSDK.analyzeJournal({
      content: "...",
      mood_score: 7,
      slide_prompt: "...",
      direction: "emotions"  // optional
    })
            │
            ▼
    AI Service: POST /analyze
            │
            ▼
    AIProcessor.generate_journal_question()
            │
            ├─► Get system prompt (with direction)
            ├─► Build context (slide group, collection)
            ├─► Call GPT-4o-mini
            │
            ▼
    Response: "What emotions came up when...?"
            │
            ▼
    TipTap Editor: Insert AI question
    (gray italic text with 💭 emoji)
            │
            ▼
    User continues writing...
```

---

## 📊 Implementation Status by Feature

### Core Journaling Features

| Feature | Frontend | Backend | AI | Overall |
|---------|----------|---------|-----|---------|
| Free-form journaling | ✅ | ✅ | ✅ | ✅ 100% |
| Template-based journaling | ✅ | ✅ | ✅ | ✅ 100% |
| Mood tracking (1-10) | ✅ | ✅ | ✅ | ✅ 100% |
| Auto-save drafts | ✅ | N/A | N/A | ✅ 100% |
| "Go Deeper" AI | ✅ | N/A | ✅ | ✅ 100% |
| 5 Reflection directions | ✅ | N/A | ✅ | ✅ 100% |
| Speech input | 🟡 | N/A | N/A | 🟡 50% |
| Offline-first | ✅ | ✅ | N/A | ✅ 100% |
| Bi-directional sync | ✅ | ✅ | N/A | ✅ 100% |

### Template System

| Feature | Frontend | Backend | Overall |
|---------|----------|---------|---------|
| Template gallery | ✅ | ✅ | ✅ 100% |
| Slide groups | ✅ | ✅ | ✅ 100% |
| Emotion log slides | ✅ | ✅ | ✅ 100% |
| Sleep check slides | ✅ | ✅ | ✅ 100% |
| Journal prompt slides | ✅ | ✅ | ✅ 100% |
| Doc/info slides | ✅ | ✅ | ✅ 100% |
| Template caching | ✅ | N/A | ✅ 100% |

### Data Management

| Feature | Frontend | Backend | Overall |
|---------|----------|---------|---------|
| SQLite local storage | ✅ | N/A | ✅ 100% |
| PostgreSQL cloud storage | N/A | ✅ | ✅ 100% |
| Conflict resolution | ✅ | 🟡 | 🟡 75% |
| Soft delete | ✅ | ❌ | 🟡 50% |
| Search journals | ✅ | ❌ | 🟡 50% |
| Filter by collection | ✅ | 🟡 | 🟡 75% |

---

## ❌ Not Yet Implemented

### High Priority

| Feature | Description | Effort |
|---------|-------------|--------|
| Speech-to-text | Native voice input integration | Medium |
| Server-side search | PostgreSQL full-text search | Medium |
| Streak tracking | Daily journaling streaks | Medium |
| Session feedback | Rate helpfulness after session | Low |

### Medium Priority

| Feature | Description | Effort |
|---------|-------------|--------|
| Emotion trends chart | Visualize mood over time | High |
| Sleep pattern analysis | Chart sleep data | Medium |
| Journal export | PDF/text export | Medium |
| Word count tracking | Track journaling volume | Low |

### Low Priority (Future)

| Feature | Description | Effort |
|---------|-------------|--------|
| Therapist sharing | Share entries with therapist | High |
| Collaborative journals | Shared entries | High |
| Audio journals | Voice recordings | High |
| Vector search (Qdrant) | Semantic search in AI service | High |

---

## 🐛 Known Issues & TODOs

### Frontend

1. **Template Gallery Route Typo**: Backend has `/v1/tempalte-gallary` (typo)
2. **Speech Input**: TapToSpeak component exists but integration incomplete
3. **Conflict UI**: No user-facing conflict resolution UI

### Core Service

1. **Soft Delete**: Backend uses hard delete, frontend uses soft delete
2. **Search Endpoint**: No server-side search API
3. **Pagination**: `/v1/journals` returns all, no limit/offset

### AI Service

1. **Qdrant Integration**: Vector store initialized but not fully used
2. **Chat History**: Summary logic exists but may need tuning
3. **Rate Limiting**: No request throttling on AI endpoints

---

## 📁 Key File Locations

### Frontend
```
stores/stores/user_journal.ts       → Main Pinia store
stores/tranquara_sdk.ts             → API client
services/sqlite/journals_repository.ts → SQLite CRUD
services/sync/sync_service.ts       → Background sync
types/user_journal.ts               → TypeScript types
pages/journaling/index.vue          → New journal page
pages/journaling/[id].vue           → Edit journal page
components/Journal/*                → Journal UI components
components/Slide/*                  → Slide type components
```

### Core Service
```
cmd/api/user_journal.go             → HTTP handlers
cmd/api/router.go                   → Route definitions
internal/data/user_journal.go       → Database models
migrations/000010-000017*           → Journal migrations
```

### AI Service
```
service/ai_service_processor.py     → LangChain processor
service/prompts.py                  → System prompts
models/journal.py                   → Pydantic models
```

### Documentation
```
feature-design/02. Jounral Feature/
  ├── 00-OVERVIEW.md                → Feature summary
  ├── 01-JOURNALING-FLOWS.md        → User flows
  ├── 03-DATA-MODELS.md             → Database schemas
  ├── IMPLEMENTATION-GUIDE-NEW.md   → Implementation guide
  └── CURRENT-PROGRESS.md           → This document
```

---

## 🚀 Next Steps

### Immediate (This Sprint)

1. [ ] Fix template gallery route typo in backend
2. [ ] Add server-side pagination to journals endpoint
3. [ ] Implement streak tracking

### Short-term (Next 2 Sprints)

1. [ ] Complete speech-to-text integration
2. [ ] Add server-side full-text search
3. [ ] Build emotion trends visualization
4. [ ] Add session feedback component

### Long-term (Backlog)

1. [ ] Qdrant vector search for semantic journal queries
2. [ ] Journal export (PDF/text)
3. [ ] Therapist sharing feature
4. [ ] Audio journal support

---

## 📚 Related Documentation

- [00-OVERVIEW.md](./00-OVERVIEW.md) - Feature overview and purpose
- [01-JOURNALING-FLOWS.md](./01-JOURNALING-FLOWS.md) - User journey diagrams
- [03-DATA-MODELS.md](./03-DATA-MODELS.md) - Complete database schema
- [IMPLEMENTATION-GUIDE-NEW.md](./IMPLEMENTATION-GUIDE-NEW.md) - Step-by-step implementation
- [../00-DATABASE/](../00-DATABASE/) - Full database documentation
- [../../copilot-instructions.md](../../../.github/copilot-instructions.md) - Project conventions

---

*This document should be updated as features are completed or requirements change.*
