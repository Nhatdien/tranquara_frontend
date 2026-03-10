# Therapy Toolkit — Technical Specification

---

## Architecture Overview

The Therapy Toolkit integrates into the existing microservices architecture without requiring new services. It leverages:

- **Frontend**: New Nuxt pages + components under `/toolkit`
- **AI Service**: New endpoint for Prep Pack generation (extends existing RAG pipeline)
- **Core Service**: New REST endpoints for session tracker CRUD + prep pack storage
- **SQLite**: Local storage for session tracker, prep packs, affirmations, homework items
- **Qdrant**: Already indexes journals — Prep Pack queries the same vector store
- **Existing Collections**: 4 therapy-related collections **migrate from Library** to Toolkit (no new content needed)

```
┌────────────────────────────────────────────────────────────────┐
│                     Frontend (Nuxt 3)                          │
│                                                                │
│  /toolkit (main hub)                                           │
│  /toolkit/journey/[collectionId]          (preparation slides) │
│  /toolkit/journey/[collectionId]/[groupId](slide group detail) │
│  /toolkit/prep-pack (generation + view)                        │
│  /toolkit/session/new (session tracker)                        │
│  /toolkit/grounding/[exercise] (coping tools)                  │
│                                                                │
│  Store: therapy_toolkit_store.ts                               │
│  SQLite: toolkit_repository.ts                                 │
│  SDK Mixin: TherapyToolkit                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Core Service (Go)            AI Service (Python)              │
│  ├─ POST /api/sessions        ├─ POST /api/prep-pack          │
│  ├─ GET  /api/sessions        │   (uses existing              │
│  ├─ PUT  /api/sessions/:id    │    RAG + Memories)             │
│  ├─ DELETE /api/sessions/:id  │                                │
│  ├─ POST /api/prep-packs      │                                │
│  ├─ GET  /api/prep-packs      │                                │
│  └─ Homework endpoints        │                                │
│                                                                │
│  PostgreSQL                    Qdrant                          │
│  ├─ therapy_sessions           (existing journal               │
│  ├─ prep_packs                 vectors reused)                 │
│  └─ homework_items                                             │
└────────────────────────────────────────────────────────────────┘
```

---

## Library → Toolkit Collection Migration

### Collections That Move

These 4 collections are **removed from the Library page** and **displayed inside the Toolkit** as the "Preparation Journey":

| Collection | Type | ID | Content |
|---|---|---|---|
| Therapy Preparation (learn) | `learn` | `33333333-3333-3333-3333-333333333333` | Signs you need therapy, first session prep |
| Mental Health History | `prepare` | `88888888-8888-8888-8888-888888888888` | Diagnoses, past treatment, medications |
| Lifestyle and Support | `prepare` | `99999999-9999-9999-9999-999999999999` | Sleep, diet, social support, routines |
| Therapy Preparation (prepare) | `prepare` | `44444444-4444-4444-4444-444444444444` | Goals, past experience, concerns |

### Library Filtering Update

**File**: `pages/learn_and_prepare/index.vue`

The Library page currently filters by type. We need to additionally exclude migrated collections:

```typescript
// IDs of collections that moved to the Toolkit
const TOOLKIT_COLLECTION_IDS = [
  '33333333-3333-3333-3333-333333333333', // Therapy Preparation (learn)
  '88888888-8888-8888-8888-888888888888', // Mental Health History
  '99999999-9999-9999-9999-999999999999', // Lifestyle and Support
  '44444444-4444-4444-4444-444444444444', // Therapy Preparation (prepare)
];

// Updated Featured/Collections filter (was: t.type === 'learn')
const learnCollections = computed(() => {
  return journalStore.templates.filter(
    t => t.type === 'learn' && !TOOLKIT_COLLECTION_IDS.includes(t.id)
  );
});

// Updated Categories filter (was: t.type === 'journal' || !t.type)
const journalTemplates = computed(() => {
  return journalStore.templates.filter(
    t => (t.type === 'journal' || !t.type) && !TOOLKIT_COLLECTION_IDS.includes(t.id)
  );
});
```

> **Note**: `type === 'prepare'` collections were never displayed in the Library's current UI (Library only shows `learn` and `journal`/empty types). But the explicit ID exclusion is future-proof and makes intent clear.

### Preparation Journey Display in Toolkit

The Toolkit reuses the **existing slide/slide-group viewing infrastructure** from `learn_and_prepare/`:
- `pages/learn_and_prepare/collection/[id].vue` — collection detail page with slide groups
- `pages/learn_and_prepare/collection/[id]/[slideGroupId].vue` — individual slide group with swipeable slides

The Toolkit creates **its own wrapper pages** that filter to only the 4 therapy collections and present them in the journey order:

```typescript
// Toolkit Preparation Journey — ordered display
const JOURNEY_STEPS = [
  {
    collectionId: '33333333-3333-3333-3333-333333333333',
    step: 1,
    label: 'Learn About Therapy',
    description: 'Understanding therapy and what to expect',
    icon: 'book-open',
  },
  {
    collectionId: '88888888-8888-8888-8888-888888888888',
    step: 2,
    label: 'Reflect on Your History',
    description: 'Mental health background and past treatment',
    icon: 'history',
  },
  {
    collectionId: '99999999-9999-9999-9999-999999999999',
    step: 3,
    label: 'Understand Your Lifestyle',
    description: 'Sleep, diet, support system, daily routines',
    icon: 'heart',
  },
  {
    collectionId: '44444444-4444-4444-4444-444444444444',
    step: 4,
    label: 'Prepare for Your Session',
    description: 'Goals, concerns, and what your therapist should know',
    icon: 'clipboard-check',
  },
];
```

---

## Frontend Implementation

### 1. Pages Structure

```
pages/
  toolkit/
    index.vue                    → Main Toolkit hub (4 sections)
    journey/
      index.vue                  → Full preparation journey view (4-step timeline)
      [collectionId].vue         → Collection detail (reuses slide group list UI)
      [collectionId]/
        [slideGroupId].vue       → Slide group viewer (reuses existing slide viewer)
    prep-pack/
      index.vue                  → Prep Pack generation + list
      [id].vue                   → View specific prep pack
    session/
      new.vue                    → New session (before/after wizard)
      [id].vue                   → View/edit past session
    grounding/
      breathing.vue              → Box breathing exercise
      five-senses.vue            → 5-4-3-2-1 grounding
      body-scan.vue              → Body scan exercise
      affirmations.vue           → Safety affirmations
```

**Reuse Strategy**: The journey pages (`[collectionId].vue`, `[slideGroupId].vue`) reuse the same component logic as `pages/learn_and_prepare/collection/[id].vue` and `pages/learn_and_prepare/collection/[id]/[slideGroupId].vue`. The key difference is they filter to only `TOOLKIT_COLLECTION_IDS` and apply the journey step ordering + progress tracking UI.

### 2. Components

```
components/
  Toolkit/
    # Preparation Journey
    JourneyTimeline.vue          → Vertical 4-step timeline with progress
    JourneyStepCard.vue          → Single step card (icon, label, progress, lock state)
    JourneyProgressBar.vue       → Overall preparation progress (0-100%)

    # Prep Pack
    PrepPackCard.vue             → Hero card on main page
    PrepPackView.vue             → Full prep pack display

    # Session Tracker
    SessionCard.vue              → Session summary card (past sessions list)
    SessionBeforeForm.vue        → Before-session form
    SessionAfterForm.vue         → After-session form
    SessionMoodComparison.vue    → Before/after mood visual
    HomeworkItem.vue             → Checkbox homework item
    HomeworkList.vue             → List of homework items

    # Grounding Exercises
    GroundingToolGrid.vue        → Quick tools grid (main page)
    BreathingAnimation.vue       → Animated breathing circle
    FiveSensesFlow.vue           → Step-by-step 5-4-3-2-1
    BodyScanVisual.vue           → Body outline with focus areas
    AffirmationCard.vue          → Single affirmation display

    # Layout
    ToolkitEmptyState.vue        → First-time user welcome (with journey CTA)
    ToolkitSectionHeader.vue     → Section header with icon + "See all" link
```

### 3. Pinia Store

**File**: `stores/stores/therapy_toolkit_store.ts`

```typescript
interface TherapyToolkitState {
  // Preparation Journey
  journeyProgress: JourneyProgress;   // tracks completion of each step's slide groups
  
  // Prep Packs
  prepPacks: PrepPack[];
  currentPrepPack: PrepPack | null;
  isGeneratingPrepPack: boolean;
  
  // Sessions
  sessions: TherapySession[];
  currentSession: TherapySession | null;
  upcomingSession: TherapySession | null;
  
  // Homework
  homeworkItems: HomeworkItem[];
  
  // Grounding
  favoriteAffirmations: string[];
  breathingHistory: BreathingRecord[];
  
  // UI
  loading: boolean;
  error: string | null;
}

// Journey progress tracks which slide groups have been completed per collection
interface JourneyProgress {
  steps: {
    [collectionId: string]: {
      completedSlideGroups: string[];  // IDs of completed slide groups
      totalSlideGroups: number;
      lastAccessedAt: string;
    };
  };
  overallPercent: number;              // computed from all steps
}
```

**Key Store Actions**:
- `loadJourneyProgress()` — loads from `user_learned` store (reuses existing slide progress tracking)
- `getJourneyCollections()` — filters `journalStore.templates` to only `TOOLKIT_COLLECTION_IDS`, returns in journey order
- `computeJourneyPercent()` — calculates overall % from slide group completion across all 4 collections
- `generatePrepPack(dateRange)` — calls AI service
- `createSession() / updateSession()` — CRUD for session tracker
- `toggleHomework(id)` — mark homework complete/incomplete

### 4. SQLite Schema Extensions

**File**: `services/sqlite/schema.ts` — add new tables:

```sql
-- Therapy sessions (before/after notes)
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_date TEXT,
  status TEXT DEFAULT 'scheduled',           -- scheduled, before_completed, completed
  
  -- Before session
  mood_before INTEGER,                        -- 1-10
  talking_points TEXT,                        -- JSON or plain text
  session_priority TEXT,
  prep_pack_id TEXT,                          -- linked prep pack
  
  -- After session
  mood_after INTEGER,                         -- 1-10
  key_takeaways TEXT,
  session_rating INTEGER,                     -- 1-5
  
  -- Meta
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  synced INTEGER DEFAULT 0,
  
  FOREIGN KEY (prep_pack_id) REFERENCES prep_packs(id)
);

-- AI-generated prep packs
CREATE TABLE IF NOT EXISTS prep_packs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date_range_start TEXT NOT NULL,
  date_range_end TEXT NOT NULL,
  
  -- Generated content (stored as JSON)
  mood_overview TEXT,                         -- { average, trend, data_points }
  key_themes TEXT,                            -- ["work stress", "sleep", ...]
  emotional_highlights TEXT,                  -- [{ date, title, mood, excerpt }]
  patterns TEXT,                              -- [{ pattern, category, source }]
  discussion_points TEXT,                     -- ["...", "..."]
  growth_moments TEXT,                        -- ["...", "..."]
  
  -- User additions
  personal_notes TEXT,
  
  -- Meta
  journal_count INTEGER,                      -- how many journals were analyzed
  created_at TEXT DEFAULT (datetime('now')),
  synced INTEGER DEFAULT 0
);

-- Homework items from therapy sessions
CREATE TABLE IF NOT EXISTS homework_items (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  synced INTEGER DEFAULT 0,
  
  FOREIGN KEY (session_id) REFERENCES therapy_sessions(id)
);

-- User's custom affirmations
CREATE TABLE IF NOT EXISTS user_affirmations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_favorite INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### 5. SDK Mixin

**File**: `stores/therapy_toolkit/index.ts`

New mixin for `TranquaraSDK`:

```typescript
export const TherapyToolkit = {
  // Prep Packs
  generatePrepPack(dateRangeStart: string, dateRangeEnd: string, language?: string): Promise<PrepPack>;
  getPrepPacks(): Promise<PrepPack[]>;
  getPrepPack(id: string): Promise<PrepPack>;
  
  // Sessions
  createSession(session: CreateSessionInput): Promise<TherapySession>;
  updateSession(id: string, updates: Partial<TherapySession>): Promise<TherapySession>;
  getSessions(): Promise<TherapySession[]>;
  deleteSession(id: string): Promise<void>;
  
  // Homework
  getHomeworkItems(sessionId?: string): Promise<HomeworkItem[]>;
  toggleHomeworkItem(id: string, completed: boolean): Promise<void>;
  createHomeworkItem(sessionId: string, content: string): Promise<HomeworkItem>;
  deleteHomeworkItem(id: string): Promise<void>;
};
```

### 6. Bottom Navigation Update

**File**: `components/Common/bottomNavSchema.ts`

```typescript
// Change "Inspirations" to "Toolkit"
{
    titleKey: "nav.toolkit",      // was: "nav.inspirations"
    icon: "heart-handshake",      // was: "lightbulb"
    link: "/toolkit",             // was: "/inspirations"
}
```

**File**: `components/Common/BottomNavigation.vue`

```typescript
// Update icon imports
import { Home, HeartHandshake, BookOpen, Clock } from "lucide-vue-next";

const iconComponents = {
  "home": Home,
  "heart-handshake": HeartHandshake,  // was: "lightbulb": Lightbulb
  "book-open": BookOpen,
  "clock": Clock,
};
```

---

## AI Service Implementation

### New Endpoint: `POST /api/prep-pack`

**File**: `tranquara_ai_service/router/prep_pack.py`

**Request:**
```json
{
  "user_id": "uuid",
  "date_range_start": "2026-03-01",
  "date_range_end": "2026-03-10",
  "journal_entries": [
    {
      "id": "uuid",
      "title": "Work stress",
      "content": "Today was overwhelming...",
      "mood_score": 3,
      "created_at": "2026-03-08T14:30:00Z"
    }
  ],
  "memories": [
    { "content": "I struggle with work-life balance", "category": "struggles" }
  ],
  "language": "en"
}
```

**Response:**
```json
{
  "prep_pack": {
    "mood_overview": {
      "average": 5.2,
      "trend": "declining",
      "highest": { "score": 8, "date": "2026-03-03", "title": "Great day outdoors" },
      "lowest": { "score": 2, "date": "2026-03-07", "title": "Deadline panic" }
    },
    "key_themes": ["work pressure", "sleep disruption", "relationship tension"],
    "emotional_highlights": [
      {
        "date": "2026-03-07",
        "title": "Deadline panic",
        "mood": 2,
        "excerpt": "I couldn't breathe. The deadline felt impossible...",
        "significance": "Strongest negative emotional response this period"
      }
    ],
    "patterns": [
      {
        "pattern": "Mood drops significantly on days with work deadlines",
        "category": "triggers",
        "confidence": 0.85
      },
      {
        "pattern": "Sleep quality worsens 1-2 days before mood dips",
        "category": "patterns",
        "confidence": 0.7
      }
    ],
    "discussion_points": [
      "Your stress seems to peak around deadlines. What coping strategies have you tried?",
      "Sleep disruption appears connected to your anxiety. Worth exploring this cycle?",
      "You mentioned feeling unsupported at work twice this week. How does that affect you?"
    ],
    "growth_moments": [
      "You recognized your anxiety pattern on March 5 — that's a sign of increasing self-awareness",
      "You chose to journal instead of suppressing feelings on March 8"
    ]
  },
  "meta": {
    "journals_analyzed": 7,
    "date_range": "Mar 1 – Mar 10, 2026",
    "generated_at": "2026-03-10T10:30:00Z"
  }
}
```

### AI Prompt Design

The Prep Pack generation extends the existing `AIProcessor` class:

```python
PREP_PACK_PROMPT = """You are generating a Therapy Session Prep Pack for a user.

Analyze their recent journal entries and extract structured insights to help them
prepare for a therapy session.

PAST JOURNAL ENTRIES:
{journal_entries}

KNOWN PATTERNS ABOUT THIS USER (from AI Memories):
{memories}

Generate a comprehensive prep pack with:

1. MOOD OVERVIEW: Calculate average mood, identify trend (improving/declining/stable),
   note highest and lowest points with dates.

2. KEY THEMES: Extract 3-5 recurring topics across entries. Be specific
   (not "feelings" but "work deadline anxiety").

3. EMOTIONAL HIGHLIGHTS: Pick 2-3 most significant entries — biggest mood swings,
   breakthrough moments, or recurring pain points.

4. PATTERNS: Cross-reference with known memories and new patterns you detect.
   Include confidence level.

5. DISCUSSION POINTS: Suggest 2-3 open-ended questions the user could bring to
   their therapist. Frame them as invitations, not directives.

6. GROWTH MOMENTS: Identify positive changes, self-awareness moments, or healthy
   coping behaviors.

LANGUAGE: Respond in {language}.
Respond in valid JSON matching the PrepPack schema.
"""
```

---

## Core Service (Go) Implementation

### New Database Tables

**Migration**: `migrations/000015_create_therapy_toolkit_tables.up.sql`

```sql
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_date TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 10),
    talking_points TEXT,
    session_priority TEXT,
    prep_pack_id UUID REFERENCES prep_packs(id),
    mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 10),
    key_takeaways TEXT,
    session_rating INTEGER CHECK (session_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prep_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    content JSONB NOT NULL,
    journal_count INTEGER DEFAULT 0,
    personal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES therapy_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_therapy_sessions_user ON therapy_sessions(user_id);
CREATE INDEX idx_therapy_sessions_date ON therapy_sessions(session_date);
CREATE INDEX idx_prep_packs_user ON prep_packs(user_id);
CREATE INDEX idx_homework_items_session ON homework_items(session_id);
CREATE INDEX idx_homework_items_user ON homework_items(user_id);
```

### API Routes

**File**: `cmd/api/router.go` — add:

```go
// Therapy Toolkit
router.Route("/api/therapy", func(r chi.Router) {
    r.Use(app.requireAuth)
    
    // Sessions
    r.Post("/sessions", app.createSessionHandler)
    r.Get("/sessions", app.listSessionsHandler)
    r.Get("/sessions/{id}", app.getSessionHandler)
    r.Put("/sessions/{id}", app.updateSessionHandler)
    r.Delete("/sessions/{id}", app.deleteSessionHandler)
    
    // Prep Packs
    r.Post("/prep-packs", app.createPrepPackHandler)
    r.Get("/prep-packs", app.listPrepPacksHandler)
    r.Get("/prep-packs/{id}", app.getPrepPackHandler)
    
    // Homework
    r.Get("/homework", app.listHomeworkHandler)
    r.Post("/sessions/{id}/homework", app.addHomeworkHandler)
    r.Patch("/homework/{id}", app.toggleHomeworkHandler)
    r.Delete("/homework/{id}", app.deleteHomeworkHandler)
})
```

---

## Offline Strategy

| Feature | Offline Support | Strategy |
|---|---|---|
| Preparation Journey | ✅ Full | Collections/slides cached in SQLite (same as Library) |
| Grounding tools | ✅ Full | 100% local, no API needed |
| Affirmations | ✅ Full | Stored in SQLite, defaults bundled |
| View saved Prep Packs | ✅ Full | Cached in SQLite |
| Generate new Prep Pack | ❌ Online only | Requires AI Service |
| Session tracker (create/edit) | ✅ Full | SQLite first, sync when online |
| Homework tracking | ✅ Full | SQLite first, sync when online |

Sync follows existing pattern via `sync_service.ts` + `sync_queue.ts`.

---

## Implementation Phases

### Phase 1: Preparation Journey + Foundation
- [ ] Bottom nav update (Inspirations → Toolkit)
- [ ] Toolkit main page with 4-section layout
- [ ] **Migrate therapy collections from Library to Toolkit**
- [ ] Update Library filtering to exclude `TOOLKIT_COLLECTION_IDS`
- [ ] Preparation Journey timeline page (`/toolkit/journey/`)
- [ ] Journey collection + slide group viewer pages (reuse existing slide components)
- [ ] Journey progress tracking (integrates with existing `user_learned` store)
- [ ] Grounding tools (Box Breathing + 5-4-3-2-1 + Affirmations)
- [ ] SQLite schema for toolkit tables
- [ ] i18n keys for all Toolkit strings

### Phase 2: Session Tracker
- [ ] Session before/after flow
- [ ] Session list on Toolkit main page
- [ ] Homework items with checkboxes
- [ ] Homework card on Home page
- [ ] Core Service CRUD endpoints
- [ ] SQLite sync for sessions

### Phase 3: Prep Pack (AI)
- [ ] AI Service prep-pack endpoint
- [ ] Prep Pack generation UI
- [ ] Prep Pack view page
- [ ] Linking Prep Packs to sessions
- [ ] Prep Pack caching in SQLite

### Phase 4: Polish & Integration
- [ ] Session reminders (notification integration)
- [ ] Export/share Prep Pack
- [ ] Homework completion in Prep Pack summary
- [ ] Body Scan grounding tool
- [ ] Grounding tool usage tracking

---

## External References

### Frameworks & Libraries
- [Nuxt 3 Pages](https://nuxt.com/docs/guide/directory-structure/pages)
- [Capacitor SQLite](https://github.com/niceplugins/capacitor-community-sqlite)
- [LangChain Structured Output](https://python.langchain.com/docs/how_to/structured_output/)
- [Lucide Icons](https://lucide.dev/icons/) — for new Toolkit icons

### Design Inspiration
- [Therapy Notebook App](https://www.therapynotebook.com/) — session tracking patterns
- [Calm App](https://www.calm.com/) — breathing exercise animations
- [Woebot](https://woebothealth.com/) — CBT-based coping tools

### Mental Health Standards
- [OWASP Health Data Guidelines](https://owasp.org/www-project-web-security-testing-guide/) — health data privacy
- [APA Therapy Preparation Guidelines](https://www.apa.org/topics/psychotherapy) — evidence-based therapy prep
