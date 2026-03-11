# Therapy Toolkit - Implementation Guide

> **Status**: 🔄 In Development  
> **Last Updated**: March 10, 2026  
> **Version**: 1.0.0  
> **Priority**: 🟡 HIGH  
> **Replaces**: Inspirations tab

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Quick Reference & Validation Links](#quick-reference--validation-links)
3. [User Flows](#user-flows)
4. [Data Flow](#data-flow)
5. [Data Models](#data-models)
6. [Implementation Steps](#implementation-steps)
   - [Phase 1: Preparation Journey + Foundation](#phase-1-preparation-journey--foundation)
   - [Phase 2: Session Tracker](#phase-2-session-tracker)
   - [Phase 3: Prep Pack (AI)](#phase-3-prep-pack-ai)
   - [Phase 4: Polish & Integration](#phase-4-polish--integration)
7. [Acceptance Criteria](#acceptance-criteria)

---

## 🎯 Overview

### Feature Summary

The Therapy Toolkit replaces the Inspirations tab and becomes the therapy hub for TheraPrep. It **moves 4 therapy-specific collections from the Library** into a structured Preparation Journey, and adds new tools: AI Prep Pack generation, Session Tracker with homework, and interactive Grounding Exercises (Box Breathing).

All steps in the Preparation Journey are **unlocked from the start** — users can complete them in any order, but the UI suggests a logical progression. The slide viewing experience reuses the **exact existing slide viewer** (`JournalModalContents` / `JournalTemplateListV2`).

**📚 Core Technology References:**
- [Nuxt 3 Pages & Routing](https://nuxt.com/docs/guide/directory-structure/pages) — File-based routing
- [Pinia State Management](https://pinia.vuejs.org/) — Offline-first store pattern
- [Capacitor SQLite](https://github.com/capacitor-community/sqlite) — Local database
- [LangChain Structured Output](https://python.langchain.com/docs/how_to/structured_output/) — Prep Pack generation
- [Lucide Icons](https://lucide.dev/icons/) — UI icons (HeartHandshake, Wind, etc.)

**User Story:**
> As a user preparing for therapy, I want a dedicated toolkit that guides me through preparation, generates AI summaries of my journals, tracks my sessions, and provides grounding exercises — so that I feel confident and organized before, during, and after therapy.

### Key Requirements

1. **Replace Inspirations**: Bottom nav tab changes from Inspirations → Toolkit
2. **Move Collections**: 4 therapy collections migrate from Library to Toolkit (Library filters them out)
3. **Reuse Slide Viewer**: Navigate to existing `/learn_and_prepare/collection/[id]/[slideGroupId]` pages — no new slide UI
4. **All Steps Unlocked**: Users can access any journey step in any order
5. **Breathing Only**: Phase 1 includes only Box Breathing for grounding (no 5-4-3-2-1, body scan, etc.)
6. **Bilingual**: All i18n keys in English + Vietnamese
7. **Offline-First**: Journey + Breathing work fully offline; Prep Pack requires online

---

## 🔍 Quick Reference & Validation Links

**Core Specifications & Standards:**
| Topic | Specification | Purpose |
|-------|--------------|---------|
| OAuth 2.0 Token Refresh | [RFC 6749 §6](https://datatracker.ietf.org/doc/html/rfc6749#section-6) | Token renewal for API calls |
| JWT Standard | [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) | Keycloak token format |

**Framework/Library Documentation:**
| Resource | Link | Use Case |
|----------|------|----------|
| Nuxt 3 Documentation | [nuxt.com/docs](https://nuxt.com/docs) | SPA mode, file-based routing |
| Pinia State Management | [pinia.vuejs.org](https://pinia.vuejs.org/) | Toolkit store |
| Nuxt UI 3 Components | [ui.nuxt.com](https://ui.nuxt.com/) | UButton, UProgress, UCarousel |
| Capacitor SQLite | [@capacitor-community/sqlite](https://github.com/capacitor-community/sqlite) | Local storage |
| Lucide Vue Icons | [lucide.dev](https://lucide.dev/icons/) | HeartHandshake, Wind icons |
| TipTap Editor | [tiptap.dev](https://tiptap.dev/) | Rich text in journal prompts |
| LangChain | [python.langchain.com](https://python.langchain.com/) | AI Prep Pack generation |
| Qdrant | [qdrant.tech/documentation](https://qdrant.tech/documentation/) | Vector search for RAG |
| FastAPI | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) | AI service endpoint |

**Backend & Database:**
| Resource | Link | Use Case |
|----------|------|----------|
| PostgreSQL | [postgresql.org/docs](https://www.postgresql.org/docs/current/) | Cloud DB for sessions/prep packs |
| Go net/http | [pkg.go.dev/net/http](https://pkg.go.dev/net/http) | REST API handlers |
| Go Migrate | [github.com/golang-migrate](https://github.com/golang-migrate/migrate) | Database migrations |
| RabbitMQ | [rabbitmq.com/tutorials](https://www.rabbitmq.com/tutorials) | Async sync queue |

**Security & Best Practices:**
| Topic | Resource | Critical Info |
|-------|----------|--------------|
| OWASP Mobile Security | [OWASP Mobile](https://owasp.org/www-project-mobile-security/) | Health data guidelines |
| Offline-First Design | [offlinefirst.org](https://offlinefirst.org/) | Sync patterns |
| APA Therapy Guidelines | [apa.org/topics/psychotherapy](https://www.apa.org/topics/psychotherapy) | Evidence-based therapy prep |

---

## 👤 User Flows

### Flow 1: Toolkit Main Page

```
User taps "Toolkit" in bottom nav
    │
    ├── Section 1: Preparation Journey (always visible)
    │   4 steps displayed as cards, all unlocked
    │   Each shows progress (e.g., "2/4 chapters done")
    │   Tapping a step → navigates to existing collection page
    │
    ├── Section 2: Session Prep Pack (Phase 3)
    │   Card with [Generate Prep Pack] button
    │   Shows last generated date if exists
    │
    ├── Section 3: Session Tracker (Phase 2)
    │   Upcoming session or [Schedule Session] CTA
    │   Past sessions list
    │
    ├── Section 4: Grounding Exercises
    │   Box Breathing card → /toolkit/grounding/breathing
    │
    └── Section 5: Therapy Homework (Phase 2)
        Checklist from latest session
```

### Flow 2: Preparation Journey Step

```
User taps a journey step (e.g., "Learn About Therapy")
    │
    ├── navigateTo('/learn_and_prepare/collection/33333333-3333-3333-3333-333333333333')
    │   (reuses exact existing collection page)
    │
    ├── User sees slide groups as horizontal carousel cards
    │   Each card has "Begin" button + completed checkmark
    │
    ├── User taps "Begin" on a slide group
    │   navigateTo('/learn_and_prepare/collection/[id]/[slideGroupId]')
    │   (reuses exact existing slide viewer — JournalModalContents)
    │
    ├── User completes slides → journal saved (if journal_prompt type)
    │   → slide group marked completed in user_learned store
    │
    └── User presses back → returns to collection → back again → Toolkit
        Progress updated on journey step card
```

### Flow 3: Box Breathing

```
User taps "Box Breathing" on Toolkit page
    │
    ├── Navigates to /toolkit/grounding/breathing
    │
    ├── Sees animated breathing circle:
    │   Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
    │   Visual circle expands/contracts with animation
    │   Phase label: "Breathe In" / "Hold" / "Breathe Out" / "Hold"
    │
    ├── Timer shows elapsed time
    │
    ├── User can tap [Stop] at any time
    │
    └── On stop or after preset duration:
        Shows completion message
        Works 100% offline
```

---

## 🔄 Data Flow

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (Nuxt 3)                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Toolkit Pages ──► therapy_toolkit_store ──► SQLite Service  │
│       │                    │                      │          │
│       │                    ├── user_learned store  │          │
│       │                    │   (journey progress)  │          │
│       │                    │                      │          │
│       └── Reuses existing Learn & Prepare pages   │          │
│           for slide viewing (no new slide UI)     │          │
│                                                              │
│  SQLite: therapy_sessions, prep_packs, homework_items       │
│  Existing: user_learned_slide_groups, user_journals         │
└──────────────────────────────────────────────────────────────┘
                        ↓ ↑ (REST API)
┌──────────────────────────────────────────────────────────────┐
│                CORE SERVICE (Go) + AI SERVICE (Python)        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Go:    /v1/therapy-sessions (CRUD)                         │
│         /v1/prep-packs (CRUD)                               │
│         /v1/homework (CRUD)                                 │
│                                                              │
│  Python: POST /api/prep-pack (AI generation)                │
│          Uses existing Qdrant vectors + AI Memories          │
│                                                              │
│  PostgreSQL: therapy_sessions, prep_packs, homework_items   │
└──────────────────────────────────────────────────────────────┘
```

### Scenario 1: Journey Step — View Collection (Offline-First)

```
1. User taps journey step card on Toolkit page
       ↓
2. navigateTo('/learn_and_prepare/collection/{collectionId}')
   (existing page — JournalTemplateListV2 component)
       ↓
3. TemplateListV2 reads collection from journalStore.templates (SQLite cache)
       ↓
4. User taps slide group → existing slide viewer opens
       ↓
5. On slide group completion → useSlideGroup.markSlideGroupCompleted()
   → LearnedStore.markCompleted() → SQLite + sync to server if online
       ↓
6. User navigates back to Toolkit → journey card shows updated progress
```

### Scenario 2: Session Tracker — Create (Offline-First)

```
1. User taps [Schedule Session] on Toolkit page
       ↓
2. Navigate to /toolkit/session/new
       ↓
3. Fill before-session form (mood, talking points, priority)
       ↓
4. therapy_toolkit_store.createSession()
       ↓
5. SQLite save (needs_sync=1) → immediate UI update
       ↓
6. [Background] SyncService → POST /v1/therapy-sessions
       ↓
7. PostgreSQL save → update local needs_sync=0
```

### Scenario 3: Prep Pack Generation (Online Only)

```
1. User taps [Generate Prep Pack] on Toolkit page
       ↓
2. Navigate to /toolkit/prep-pack
       ↓
3. Select date range (default: last 7 days)
       ↓
4. therapy_toolkit_store.generatePrepPack(dateRange)
       ↓
5. SDK → POST /api/prep-pack to AI Service
   AI Service:
     a) Fetches journals from Core Service for date range
     b) Queries Qdrant for semantic context
     c) Fetches AI Memories for known patterns
     d) Generates structured prep pack via GPT-4o-mini
       ↓
6. Response → save to SQLite (for offline viewing later)
       ↓
7. Navigate to /toolkit/prep-pack/[id] → display results
```

---

## 📊 Data Models

### Storage Strategy

| Data Type | Storage Method | Reason |
|-----------|---------------|--------|
| **Journey Progress** | SQLite `user_learned_slide_groups` (existing) | Reuses existing progress tracking |
| **Therapy Sessions** | SQLite + PostgreSQL | Offline-first, complex queries |
| **Prep Packs** | SQLite + PostgreSQL | Cache for offline viewing |
| **Homework Items** | SQLite + PostgreSQL | Offline-first checkbox tracking |
| **Breathing Records** | Local only (optional) | Simple analytics, no sync needed |

### TypeScript Types

**File: `types/therapy_toolkit.ts`**

```typescript
// ─── Journey Configuration ─────────────────────────────

export interface JourneyStep {
  collectionId: string;
  step: number;
  labelKey: string;          // i18n key for title
  descriptionKey: string;    // i18n key for description
  icon: string;              // Lucide icon name
}

// Static configuration — not stored in DB
export const JOURNEY_STEPS: JourneyStep[] = [
  {
    collectionId: '33333333-3333-3333-3333-333333333333',
    step: 1,
    labelKey: 'toolkit.journey.step1.label',
    descriptionKey: 'toolkit.journey.step1.description',
    icon: 'book-open',
  },
  {
    collectionId: '88888888-8888-8888-8888-888888888888',
    step: 2,
    labelKey: 'toolkit.journey.step2.label',
    descriptionKey: 'toolkit.journey.step2.description',
    icon: 'history',
  },
  {
    collectionId: '99999999-9999-9999-9999-999999999999',
    step: 3,
    labelKey: 'toolkit.journey.step3.label',
    descriptionKey: 'toolkit.journey.step3.description',
    icon: 'heart',
  },
  {
    collectionId: '44444444-4444-4444-4444-444444444444',
    step: 4,
    labelKey: 'toolkit.journey.step4.label',
    descriptionKey: 'toolkit.journey.step4.description',
    icon: 'clipboard-check',
  },
];

// IDs of collections that moved from Library to Toolkit
export const TOOLKIT_COLLECTION_IDS = JOURNEY_STEPS.map(s => s.collectionId);

// ─── Prep Pack ─────────────────────────────────────────

export interface PrepPack {
  id: string;
  user_id: string;
  date_range_start: string;
  date_range_end: string;
  mood_overview: MoodOverview;
  key_themes: string[];
  emotional_highlights: EmotionalHighlight[];
  patterns: DetectedPattern[];
  discussion_points: string[];
  growth_moments: string[];
  personal_notes?: string;
  journal_count: number;
  created_at: string;
  needs_sync?: boolean;
}

export interface MoodOverview {
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  data_points: { date: string; score: number }[];
  highest: { score: number; date: string; title: string };
  lowest: { score: number; date: string; title: string };
}

export interface EmotionalHighlight {
  date: string;
  title: string;
  mood: number;
  excerpt: string;
  significance: string;
  journal_id?: string;
}

export interface DetectedPattern {
  pattern: string;
  category: 'triggers' | 'patterns' | 'coping' | 'relationships' | 'growth';
  confidence: number;
  source?: string;
}

// ─── Therapy Session ───────────────────────────────────

export interface TherapySession {
  id: string;
  user_id: string;
  session_date?: string;
  status: SessionStatus;
  mood_before?: number;
  talking_points?: string;
  session_priority?: string;
  prep_pack_id?: string;
  mood_after?: number;
  key_takeaways?: string;
  session_rating?: number;
  homework_items?: HomeworkItem[];
  created_at: string;
  updated_at: string;
  needs_sync?: boolean;
}

export type SessionStatus = 'scheduled' | 'before_completed' | 'completed';

export interface CreateSessionInput {
  session_date?: string;
  mood_before?: number;
  talking_points?: string;
  session_priority?: string;
  prep_pack_id?: string;
}

export interface UpdateSessionInput {
  session_date?: string;
  mood_before?: number;
  talking_points?: string;
  session_priority?: string;
  mood_after?: number;
  key_takeaways?: string;
  session_rating?: number;
  status?: SessionStatus;
}

// ─── Homework ──────────────────────────────────────────

export interface HomeworkItem {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  needs_sync?: boolean;
}

// ─── Breathing ─────────────────────────────────────────

export interface BreathingConfig {
  pattern: 'box';            // only box breathing for now
  inhale: number;            // seconds
  holdIn: number;
  exhale: number;
  holdOut: number;
  duration: number;          // total minutes
}

export const BOX_BREATHING_CONFIG: BreathingConfig = {
  pattern: 'box',
  inhale: 4,
  holdIn: 4,
  exhale: 4,
  holdOut: 4,
  duration: 3,              // 3 minutes default
};

// ─── API Request/Response ──────────────────────────────

export interface GeneratePrepPackRequest {
  date_range_start: string;
  date_range_end: string;
  language?: string;
}

export interface GeneratePrepPackResponse {
  prep_pack: PrepPack;
  meta: {
    journals_analyzed: number;
    date_range: string;
    generated_at: string;
  };
}
```

### Database Schema

#### SQLite (Frontend — `services/sqlite/schema.ts`)

Added as migration v5:

```sql
-- Therapy sessions
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT NOT NULL,
  session_date TEXT,
  status TEXT DEFAULT 'scheduled',
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  talking_points TEXT,
  session_priority TEXT,
  prep_pack_id TEXT,
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  key_takeaways TEXT,
  session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  is_deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON therapy_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON therapy_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_needs_sync ON therapy_sessions(needs_sync);

-- Prep packs
CREATE TABLE IF NOT EXISTS prep_packs (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT NOT NULL,
  date_range_start TEXT NOT NULL,
  date_range_end TEXT NOT NULL,
  content TEXT NOT NULL,
  personal_notes TEXT,
  journal_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_prep_packs_user_id ON prep_packs(user_id);

-- Homework items
CREATE TABLE IF NOT EXISTS homework_items (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  FOREIGN KEY (session_id) REFERENCES therapy_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_homework_session ON homework_items(session_id);
CREATE INDEX IF NOT EXISTS idx_homework_user ON homework_items(user_id);
CREATE INDEX IF NOT EXISTS idx_homework_needs_sync ON homework_items(needs_sync);
```

#### PostgreSQL (Core Service — `migrations/000027_create_therapy_toolkit_tables.up.sql`)

```sql
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_date TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled',
    mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 10),
    talking_points TEXT,
    session_priority TEXT,
    prep_pack_id UUID,
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

-- Add FK after both tables exist
ALTER TABLE therapy_sessions 
    ADD CONSTRAINT fk_sessions_prep_pack 
    FOREIGN KEY (prep_pack_id) REFERENCES prep_packs(id);

CREATE INDEX idx_therapy_sessions_user ON therapy_sessions(user_id);
CREATE INDEX idx_therapy_sessions_date ON therapy_sessions(session_date);
CREATE INDEX idx_prep_packs_user ON prep_packs(user_id);
CREATE INDEX idx_homework_items_session ON homework_items(session_id);
CREATE INDEX idx_homework_items_user ON homework_items(user_id);
```

---

## 🛠️ Implementation Steps

### Phase 1: Preparation Journey + Foundation

> **Goal**: Replace Inspirations with Toolkit, display journey steps, navigate to existing slide pages, add Box Breathing. Fully shippable as standalone.

---

#### Step 1.1: i18n — Add Toolkit Translation Keys

**File: `i18n/locales/en.json`** — add `"toolkit"` block:

```json
{
  "nav": {
    "toolkit": "Toolkit"
  },
  "toolkit": {
    "title": "toolkit.",
    "subtitle": "Your therapy companion",
    "journey": {
      "title": "preparation journey",
      "overallProgress": "{percent}% prepared",
      "chaptersProgress": "{completed}/{total} chapters",
      "step1": {
        "label": "Learn About Therapy",
        "description": "Understanding therapy and what to expect"
      },
      "step2": {
        "label": "Reflect on Your History",
        "description": "Mental health background and past treatment"
      },
      "step3": {
        "label": "Understand Your Lifestyle",
        "description": "Sleep, diet, support system, daily routines"
      },
      "step4": {
        "label": "Prepare for Your Session",
        "description": "Goals, concerns, and what your therapist should know"
      }
    },
    "prepPack": {
      "title": "session prep pack",
      "description": "AI summary of your journals for therapy",
      "generate": "Generate Prep Pack",
      "generating": "Analyzing your journals...",
      "lastGenerated": "Last: {date} · {count} journals",
      "selectRange": "Select date range",
      "last7Days": "Last 7 days",
      "last14Days": "Last 14 days",
      "last30Days": "Last 30 days",
      "customRange": "Custom range",
      "moodOverview": "Mood Overview",
      "keyThemes": "Key Themes",
      "emotionalHighlights": "Emotional Highlights",
      "patterns": "Patterns Noticed",
      "discussionPoints": "Discussion Points",
      "growthMoments": "Growth Moments",
      "preparationStatus": "Preparation Status",
      "addNotes": "Add personal notes",
      "noJournals": "Write a few journal entries first to generate a prep pack",
      "emptyState": "Once you've journaled a bit, you can generate a Prep Pack"
    },
    "session": {
      "title": "upcoming session",
      "schedule": "Schedule Session",
      "noSession": "No session scheduled",
      "pastSessions": "past sessions",
      "before": {
        "title": "Before Your Session",
        "mood": "How are you feeling right now?",
        "talkingPoints": "What do you want to talk about?",
        "priority": "My top priority for this session"
      },
      "after": {
        "title": "After Your Session",
        "mood": "How do you feel now?",
        "takeaways": "Key takeaways",
        "homework": "Homework / Action items",
        "addHomework": "Add homework item",
        "rating": "Rate this session"
      },
      "status": {
        "scheduled": "Scheduled",
        "beforeCompleted": "Ready for session",
        "completed": "Completed"
      }
    },
    "grounding": {
      "title": "grounding exercises",
      "breathing": {
        "title": "Box Breathing",
        "description": "4-4-4-4 calming technique",
        "inhale": "Breathe In",
        "holdIn": "Hold",
        "exhale": "Breathe Out",
        "holdOut": "Hold",
        "start": "Start",
        "stop": "Stop",
        "complete": "Well done! You completed {duration} of breathing.",
        "elapsed": "{time} elapsed"
      }
    },
    "homework": {
      "title": "therapy homework",
      "empty": "No homework items yet",
      "completed": "Completed"
    }
  }
}
```

**File: `i18n/locales/vi.json`** — add matching `"toolkit"` block:

```json
{
  "nav": {
    "toolkit": "Bộ công cụ"
  },
  "toolkit": {
    "title": "bộ công cụ.",
    "subtitle": "Bạn đồng hành trị liệu",
    "journey": {
      "title": "hành trình chuẩn bị",
      "overallProgress": "{percent}% đã chuẩn bị",
      "chaptersProgress": "{completed}/{total} chương",
      "step1": {
        "label": "Tìm hiểu về trị liệu",
        "description": "Hiểu về trị liệu và những gì cần mong đợi"
      },
      "step2": {
        "label": "Nhìn lại lịch sử sức khỏe",
        "description": "Tiền sử sức khỏe tâm thần và điều trị"
      },
      "step3": {
        "label": "Hiểu lối sống của bạn",
        "description": "Giấc ngủ, chế độ ăn, hệ thống hỗ trợ"
      },
      "step4": {
        "label": "Chuẩn bị cho buổi trị liệu",
        "description": "Mục tiêu, lo ngại và điều cần nói với chuyên gia"
      }
    },
    "prepPack": {
      "title": "gói chuẩn bị buổi trị liệu",
      "description": "Tóm tắt AI từ nhật ký của bạn cho buổi trị liệu",
      "generate": "Tạo gói chuẩn bị",
      "generating": "Đang phân tích nhật ký của bạn...",
      "lastGenerated": "Lần cuối: {date} · {count} nhật ký",
      "selectRange": "Chọn khoảng thời gian",
      "last7Days": "7 ngày qua",
      "last14Days": "14 ngày qua",
      "last30Days": "30 ngày qua",
      "customRange": "Tùy chỉnh",
      "moodOverview": "Tổng quan tâm trạng",
      "keyThemes": "Chủ đề chính",
      "emotionalHighlights": "Điểm nổi bật cảm xúc",
      "patterns": "Xu hướng nhận ra",
      "discussionPoints": "Gợi ý thảo luận",
      "growthMoments": "Khoảnh khắc phát triển",
      "preparationStatus": "Trạng thái chuẩn bị",
      "addNotes": "Thêm ghi chú cá nhân",
      "noJournals": "Hãy viết vài bài nhật ký trước để tạo gói chuẩn bị",
      "emptyState": "Khi bạn đã viết nhật ký, bạn có thể tạo Gói Chuẩn Bị"
    },
    "session": {
      "title": "buổi trị liệu sắp tới",
      "schedule": "Lên lịch buổi trị liệu",
      "noSession": "Chưa có buổi trị liệu nào",
      "pastSessions": "các buổi trước",
      "before": {
        "title": "Trước buổi trị liệu",
        "mood": "Bạn đang cảm thấy thế nào?",
        "talkingPoints": "Bạn muốn nói về điều gì?",
        "priority": "Ưu tiên hàng đầu của tôi"
      },
      "after": {
        "title": "Sau buổi trị liệu",
        "mood": "Bạn cảm thấy thế nào bây giờ?",
        "takeaways": "Những điều rút ra",
        "homework": "Bài tập / Hành động",
        "addHomework": "Thêm bài tập",
        "rating": "Đánh giá buổi trị liệu"
      },
      "status": {
        "scheduled": "Đã lên lịch",
        "beforeCompleted": "Sẵn sàng cho buổi trị liệu",
        "completed": "Hoàn thành"
      }
    },
    "grounding": {
      "title": "bài tập thư giãn",
      "breathing": {
        "title": "Hít thở vuông",
        "description": "Kỹ thuật thư giãn 4-4-4-4",
        "inhale": "Hít vào",
        "holdIn": "Giữ",
        "exhale": "Thở ra",
        "holdOut": "Giữ",
        "start": "Bắt đầu",
        "stop": "Dừng",
        "complete": "Tuyệt vời! Bạn đã hoàn thành {duration} hít thở.",
        "elapsed": "{time} đã trôi qua"
      }
    },
    "homework": {
      "title": "bài tập trị liệu",
      "empty": "Chưa có bài tập nào",
      "completed": "Hoàn thành"
    }
  }
}
```

**Expected Result:** ✅ All toolkit strings available in both EN and VI

---

#### Step 1.2: Bottom Navigation — Replace Inspirations with Toolkit

**File: `components/Common/bottomNavSchema.ts`**

Replace the Inspirations entry:

```typescript
export const bottomNavSchema = [
    {
        titleKey: "nav.today",
        icon: "home",
        link: "/",
    },
    {
        titleKey: "nav.toolkit",        // was: "nav.inspirations"
        icon: "heart-handshake",        // was: "lightbulb"
        link: "/toolkit",              // was: "/inspirations"
    },
    {
        titleKey: "nav.library",
        icon: "book-open",
        link: "/learn_and_prepare",
    },
    {
        titleKey: "nav.history",
        icon: "clock",
        link: "/history",
    },
]
```

**File: `components/Common/BottomNavigation.vue`**

Update icon imports:

```typescript
// Replace Lightbulb with HeartHandshake
import { Home, HeartHandshake, BookOpen, Clock } from "lucide-vue-next";

const iconComponents = {
  "home": Home,
  "heart-handshake": HeartHandshake,  // was: "lightbulb": Lightbulb
  "book-open": BookOpen,
  "clock": Clock,
} as Record<string, any>;
```

**Expected Result:** ✅ Bottom nav shows "Toolkit" tab with HeartHandshake icon, navigates to `/toolkit`

---

#### Step 1.3: Library Filtering — Exclude Toolkit Collections

**File: `pages/learn_and_prepare/index.vue`**

Import the toolkit collection IDs and update the computed filters:

```typescript
// Add at top of <script> section:
import { TOOLKIT_COLLECTION_IDS } from '~/types/therapy_toolkit';

// Update learnCollections (around line 173):
// OLD:
//   return journalStore.templates.filter(t => t.type === 'learn');
// NEW:
const learnCollections = computed(() => {
  return journalStore.templates.filter(
    t => t.type === 'learn' && !TOOLKIT_COLLECTION_IDS.includes(t.id)
  );
});

// Update journalTemplates (around line 178):
// OLD:
//   return journalStore.templates.filter(t => t.type === 'journal' || !t.type);
// NEW:
const journalTemplates = computed(() => {
  return journalStore.templates.filter(
    t => (t.type === 'journal' || !t.type) && !TOOLKIT_COLLECTION_IDS.includes(t.id)
  );
});
```

**Expected Result:** ✅ Library no longer shows the 4 therapy collections. General wellness collections remain.

---

#### Step 1.4: Toolkit Main Page

**File: `pages/toolkit/index.vue`**

This is the main Toolkit hub. It displays 4 sections — Preparation Journey, Prep Pack (placeholder), Session Tracker (placeholder), and Grounding.

```vue
<template>
  <section class="px-4 py-6 pb-20">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold">{{ $t('toolkit.title') }}</h1>
      <p class="text-neutral-400 text-sm mt-1">{{ $t('toolkit.subtitle') }}</p>
    </div>

    <!-- Section 1: Preparation Journey -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase">
          {{ $t('toolkit.journey.title') }}
        </h2>
        <span v-if="overallProgress > 0" class="text-xs text-neutral-500">
          {{ $t('toolkit.journey.overallProgress', { percent: overallProgress }) }}
        </span>
      </div>

      <div class="flex flex-col gap-3">
        <ToolkitJourneyStepCard
          v-for="step in journeySteps"
          :key="step.collectionId"
          :step="step"
          :collection="getCollection(step.collectionId)"
          :completed-count="learnedStore.getCompletedCount(step.collectionId)"
          :total-count="getSlideGroupCount(step.collectionId)"
          @tap="navigateToCollection(step.collectionId)"
        />
      </div>
    </div>

    <!-- Section 2: Prep Pack (Phase 3 — placeholder) -->
    <div class="mb-8">
      <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.prepPack.title') }}
      </h2>
      <div class="p-5 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <p class="text-neutral-400 text-sm mb-3">{{ $t('toolkit.prepPack.description') }}</p>
        <UButton
          variant="soft"
          color="neutral"
          size="lg"
          class="w-full"
          :disabled="!hasJournals"
          @click="navigateTo('/toolkit/prep-pack')"
        >
          {{ $t('toolkit.prepPack.generate') }}
        </UButton>
        <p v-if="!hasJournals" class="text-xs text-neutral-500 mt-2 text-center">
          {{ $t('toolkit.prepPack.noJournals') }}
        </p>
      </div>
    </div>

    <!-- Section 3: Session Tracker (Phase 2 — placeholder) -->
    <div class="mb-8">
      <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.session.title') }}
      </h2>
      <div class="p-5 rounded-xl border border-neutral-700 bg-neutral-900/50 text-center">
        <p class="text-neutral-400 text-sm mb-3">{{ $t('toolkit.session.noSession') }}</p>
        <UButton
          variant="soft"
          color="neutral"
          @click="navigateTo('/toolkit/session/new')"
        >
          {{ $t('toolkit.session.schedule') }}
        </UButton>
      </div>
    </div>

    <!-- Section 4: Grounding Exercises -->
    <div class="mb-8">
      <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.grounding.title') }}
      </h2>
      <div
        class="flex items-center rounded-xl border border-neutral-700 bg-neutral-900/50 overflow-hidden cursor-pointer hover:bg-neutral-800/50 transition-colors"
        @click="navigateTo('/toolkit/grounding/breathing')"
      >
        <div class="w-20 h-16 flex items-center justify-center bg-neutral-800 shrink-0">
          <Wind class="w-8 h-8 text-neutral-300" />
        </div>
        <div class="flex-1 px-4 py-3">
          <p class="font-medium">{{ $t('toolkit.grounding.breathing.title') }}</p>
          <p class="text-xs text-neutral-400">{{ $t('toolkit.grounding.breathing.description') }}</p>
        </div>
        <Icon name="i-lucide-chevron-right" class="w-5 h-5 text-neutral-500 mr-4" />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { Wind } from "lucide-vue-next";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useLearnedStore } from "~/stores/stores/user_learned";
import { JOURNEY_STEPS, TOOLKIT_COLLECTION_IDS } from "~/types/therapy_toolkit";
import type { LocalTemplate } from "~/types/user_journal";

const journalStore = userJournalStore();
const learnedStore = useLearnedStore();

const journeySteps = JOURNEY_STEPS;

// Load templates + progress on mount
onMounted(async () => {
  await journalStore.getAllTemplates();
  await learnedStore.loadFromLocal();
});

// Get collection by ID
const getCollection = (collectionId: string): LocalTemplate | undefined => {
  return journalStore.templates.find(t => t.id === collectionId);
};

// Get slide group count for a collection
const getSlideGroupCount = (collectionId: string): number => {
  const collection = getCollection(collectionId);
  if (!collection) return 0;
  const groups = typeof collection.slide_groups === 'string'
    ? JSON.parse(collection.slide_groups)
    : collection.slide_groups;
  return groups?.length || 0;
};

// Overall journey progress
const overallProgress = computed(() => {
  let totalCompleted = 0;
  let totalGroups = 0;
  for (const step of JOURNEY_STEPS) {
    totalCompleted += learnedStore.getCompletedCount(step.collectionId);
    totalGroups += getSlideGroupCount(step.collectionId);
  }
  return totalGroups > 0 ? Math.round((totalCompleted / totalGroups) * 100) : 0;
});

// Check if user has any journals (for prep pack CTA)
const hasJournals = computed(() => journalStore.journals.length > 0);

// Navigate to collection — uses EXISTING slide viewer pages
const navigateToCollection = (collectionId: string) => {
  navigateTo(`/learn_and_prepare/collection/${collectionId}`);
};
</script>
```

**Expected Result:** ✅ Toolkit page shows 4 sections. Journey step cards navigate to existing collection pages.

---

#### Step 1.5: Journey Step Card Component

**File: `components/Toolkit/JourneyStepCard.vue`**

```vue
<template>
  <div
    class="flex items-center gap-4 p-4 rounded-xl border border-neutral-700 bg-neutral-900/50 cursor-pointer hover:bg-neutral-800/50 transition-colors"
    @click="$emit('tap')"
  >
    <!-- Step number + icon -->
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      :class="isComplete ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400'"
    >
      <CheckCircle v-if="isComplete" class="w-6 h-6" />
      <component v-else :is="stepIcon" class="w-6 h-6" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-xs text-neutral-500 font-medium">{{ step.step }}</span>
        <h3 class="font-medium truncate">{{ $t(step.labelKey) }}</h3>
      </div>
      <p class="text-xs text-neutral-400 mt-0.5">
        {{ $t('toolkit.journey.chaptersProgress', { completed: completedCount, total: totalCount }) }}
      </p>

      <!-- Progress bar -->
      <UProgress
        v-if="totalCount > 0"
        :model-value="progressPercent"
        size="xs"
        :color="isComplete ? 'success' : 'neutral'"
        class="mt-2"
      />
    </div>

    <!-- Arrow -->
    <Icon name="i-lucide-chevron-right" class="w-5 h-5 text-neutral-500 shrink-0" />
  </div>
</template>

<script lang="ts" setup>
import { BookOpen, History, Heart, ClipboardCheck, CheckCircle } from "lucide-vue-next";
import type { JourneyStep } from "~/types/therapy_toolkit";

const props = defineProps<{
  step: JourneyStep;
  collection: any;
  completedCount: number;
  totalCount: number;
}>();

defineEmits<{
  (e: 'tap'): void;
}>();

const iconMap: Record<string, any> = {
  'book-open': BookOpen,
  'history': History,
  'heart': Heart,
  'clipboard-check': ClipboardCheck,
};

const stepIcon = computed(() => iconMap[props.step.icon] || BookOpen);
const progressPercent = computed(() =>
  props.totalCount > 0 ? Math.round((props.completedCount / props.totalCount) * 100) : 0
);
const isComplete = computed(() => props.totalCount > 0 && props.completedCount >= props.totalCount);
</script>
```

**Expected Result:** ✅ Each journey step shows as a card with icon, progress bar, and chapter count.

---

#### Step 1.6: Box Breathing Page

**File: `pages/toolkit/grounding/breathing.vue`**

```vue
<template>
  <section class="min-h-screen flex flex-col items-center justify-center px-6 pb-20">
    <!-- Back Button -->
    <div class="fixed top-4 left-4 z-10">
      <UButton variant="ghost" size="lg" icon="i-lucide-chevron-left" @click="navigateTo('/toolkit')" />
    </div>

    <!-- Title -->
    <h1 class="text-xl font-semibold mb-2">{{ $t('toolkit.grounding.breathing.title') }}</h1>
    <p class="text-neutral-400 text-sm mb-12">{{ $t('toolkit.grounding.breathing.description') }}</p>

    <!-- Breathing Circle -->
    <div class="relative w-48 h-48 mb-8">
      <!-- Outer ring -->
      <div
        class="absolute inset-0 rounded-full border-2 transition-all ease-linear"
        :class="isRunning ? phaseColorClass : 'border-neutral-700'"
        :style="circleStyle"
      />
      <!-- Phase label -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span v-if="isRunning" class="text-lg font-medium">{{ phaseLabel }}</span>
        <span v-else class="text-neutral-500 text-sm">{{ $t('toolkit.grounding.breathing.start') }}</span>
      </div>
    </div>

    <!-- Timer -->
    <p v-if="isRunning" class="text-neutral-400 text-sm mb-8">
      {{ $t('toolkit.grounding.breathing.elapsed', { time: formattedElapsed }) }}
    </p>

    <!-- Phase countdown -->
    <p v-if="isRunning" class="text-3xl font-bold mb-8 tabular-nums">{{ phaseCountdown }}</p>

    <!-- Completion message -->
    <p v-if="showComplete" class="text-green-400 text-sm mb-8 text-center">
      {{ $t('toolkit.grounding.breathing.complete', { duration: formattedElapsed }) }}
    </p>

    <!-- Start / Stop buttons -->
    <UButton
      v-if="!isRunning && !showComplete"
      variant="solid"
      color="neutral"
      size="xl"
      class="px-12 rounded-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
      @click="startBreathing"
    >
      {{ $t('toolkit.grounding.breathing.start') }}
    </UButton>

    <UButton
      v-if="isRunning"
      variant="outline"
      color="neutral"
      size="lg"
      class="px-8 rounded-full"
      @click="stopBreathing"
    >
      {{ $t('toolkit.grounding.breathing.stop') }}
    </UButton>

    <UButton
      v-if="showComplete"
      variant="soft"
      color="neutral"
      size="lg"
      class="px-8 rounded-full"
      @click="resetBreathing"
    >
      {{ $t('toolkit.grounding.breathing.start') }}
    </UButton>
  </section>
</template>

<script lang="ts" setup>
import { BOX_BREATHING_CONFIG } from '~/types/therapy_toolkit';

definePageMeta({ layout: 'detail' });

const { t } = useI18n();

const config = BOX_BREATHING_CONFIG;
const phases = [
  { key: 'inhale', duration: config.inhale, label: t('toolkit.grounding.breathing.inhale') },
  { key: 'holdIn', duration: config.holdIn, label: t('toolkit.grounding.breathing.holdIn') },
  { key: 'exhale', duration: config.exhale, label: t('toolkit.grounding.breathing.exhale') },
  { key: 'holdOut', duration: config.holdOut, label: t('toolkit.grounding.breathing.holdOut') },
];

const isRunning = ref(false);
const showComplete = ref(false);
const currentPhaseIndex = ref(0);
const phaseCountdown = ref(0);
const elapsedSeconds = ref(0);

let phaseTimer: ReturnType<typeof setInterval> | null = null;
let elapsedTimer: ReturnType<typeof setInterval> | null = null;

const currentPhase = computed(() => phases[currentPhaseIndex.value]);
const phaseLabel = computed(() => currentPhase.value.label);

const phaseColorClass = computed(() => {
  switch (currentPhase.value.key) {
    case 'inhale': return 'border-blue-400';
    case 'holdIn': return 'border-yellow-400';
    case 'exhale': return 'border-green-400';
    case 'holdOut': return 'border-purple-400';
    default: return 'border-neutral-400';
  }
});

const circleStyle = computed(() => {
  if (!isRunning.value) return { transform: 'scale(0.7)' };
  const phase = currentPhase.value.key;
  if (phase === 'inhale') return { transform: 'scale(1)' };
  if (phase === 'exhale') return { transform: 'scale(0.7)' };
  // Hold phases keep current scale
  return {};
});

const formattedElapsed = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60);
  const secs = elapsedSeconds.value % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
});

const startBreathing = () => {
  isRunning.value = true;
  showComplete.value = false;
  currentPhaseIndex.value = 0;
  elapsedSeconds.value = 0;
  phaseCountdown.value = phases[0].duration;

  // Phase timer — ticks every second
  phaseTimer = setInterval(() => {
    phaseCountdown.value--;
    if (phaseCountdown.value <= 0) {
      // Move to next phase
      currentPhaseIndex.value = (currentPhaseIndex.value + 1) % phases.length;
      phaseCountdown.value = phases[currentPhaseIndex.value].duration;
    }
  }, 1000);

  // Elapsed timer
  elapsedTimer = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

const stopBreathing = () => {
  isRunning.value = false;
  showComplete.value = true;
  if (phaseTimer) clearInterval(phaseTimer);
  if (elapsedTimer) clearInterval(elapsedTimer);
};

const resetBreathing = () => {
  showComplete.value = false;
  elapsedSeconds.value = 0;
};

onUnmounted(() => {
  if (phaseTimer) clearInterval(phaseTimer);
  if (elapsedTimer) clearInterval(elapsedTimer);
});
</script>
```

**Expected Result:** ✅ Box Breathing page with animated circle, phase labels, countdown timer. Fully offline.

---

#### Step 1.7: Update `useSlideGroup` — Track `prepare` Type Progress

Currently, `markSlideGroupCompleted()` in `composables/useSlideGroup.ts` only tracks `learn` type collections:

```typescript
// Current code (line ~163):
if (currentCollecton.value.type !== 'learn') return;
```

We need to also track `prepare` type so the journey step cards show progress:

**File: `composables/useSlideGroup.ts`**

```typescript
// CHANGE FROM:
if (currentCollecton.value.type !== 'learn') return;

// CHANGE TO:
if (currentCollecton.value.type !== 'learn' && currentCollecton.value.type !== 'prepare') return;
```

**Expected Result:** ✅ Completing a `prepare`-type slide group (steps 2-4) now updates progress in `user_learned` store.

---

#### Step 1.8: Delete Inspirations Page (Optional — can keep as redirect)

**Option A — Delete**: Remove `pages/inspirations.vue` entirely. The route becomes a 404, but users access Toolkit at `/toolkit` now.

**Option B — Redirect**: Replace content with a redirect:

```vue
<!-- pages/inspirations.vue -->
<script setup>
navigateTo('/toolkit', { replace: true });
</script>
```

**Recommended**: Option B (redirect) to handle deep links or bookmarks.

**Expected Result:** ✅ `/inspirations` redirects to `/toolkit`

---

#### Phase 1 Verification Checklist

- [ ] Bottom nav shows "Toolkit" with HeartHandshake icon
- [ ] Tapping Toolkit shows main page with 4 sections
- [ ] Journey step cards show correct progress from `user_learned` store
- [ ] Tapping a journey step navigates to existing collection page (`/learn_and_prepare/collection/[id]`)
- [ ] Completing slide groups in journey collections updates progress
- [ ] Library page no longer shows the 4 therapy collections
- [ ] Box Breathing page works with animated circle and countdown
- [ ] All strings display correctly in English and Vietnamese
- [ ] Everything works offline (journey slides + breathing)

---

### Phase 2: Session Tracker

> **Goal**: CRUD for therapy sessions with before/after flow, homework items, and display on the Home page.

---

#### Step 2.1: SQLite Schema — Add Toolkit Tables

**File: `services/sqlite/schema.ts`**

Add the new table definitions and migration:

```typescript
// Add new table creation constants:

export const CREATE_THERAPY_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT NOT NULL,
  session_date TEXT,
  status TEXT DEFAULT 'scheduled',
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  talking_points TEXT,
  session_priority TEXT,
  prep_pack_id TEXT,
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  key_takeaways TEXT,
  session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  is_deleted INTEGER DEFAULT 0
);`;

export const CREATE_THERAPY_SESSIONS_INDEX_USER = `
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON therapy_sessions(user_id);`;

export const CREATE_THERAPY_SESSIONS_INDEX_DATE = `
CREATE INDEX IF NOT EXISTS idx_sessions_date ON therapy_sessions(session_date);`;

export const CREATE_HOMEWORK_ITEMS_TABLE = `
CREATE TABLE IF NOT EXISTS homework_items (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT,
  FOREIGN KEY (session_id) REFERENCES therapy_sessions(id)
);`;

export const CREATE_HOMEWORK_ITEMS_INDEX_SESSION = `
CREATE INDEX IF NOT EXISTS idx_homework_session ON homework_items(session_id);`;

export const CREATE_HOMEWORK_ITEMS_INDEX_USER = `
CREATE INDEX IF NOT EXISTS idx_homework_user ON homework_items(user_id);`;

// Update DB_VERSION:
export const DB_VERSION = 5;

// Add migration v5:
export const MIGRATIONS: Record<number, string[]> = {
  // ... existing 1-4 ...
  5: [
    CREATE_THERAPY_SESSIONS_TABLE,
    CREATE_THERAPY_SESSIONS_INDEX_USER,
    CREATE_THERAPY_SESSIONS_INDEX_DATE,
    CREATE_HOMEWORK_ITEMS_TABLE,
    CREATE_HOMEWORK_ITEMS_INDEX_SESSION,
    CREATE_HOMEWORK_ITEMS_INDEX_USER,
  ],
};
```

**Expected Result:** ✅ SQLite tables created on next app launch

---

#### Step 2.2: SQLite Repository — Toolkit Repository

**File: `services/sqlite/toolkit_repository.ts`**

```typescript
import SQLiteService from './sqlite_service';
import type { TherapySession, HomeworkItem } from '~/types/therapy_toolkit';

export default class ToolkitRepository {
  // ─── Sessions ───────────────────────────

  static async createSession(session: TherapySession): Promise<TherapySession> {
    const db = SQLiteService.getInstance();
    await db.execute(
      `INSERT INTO therapy_sessions 
       (id, user_id, session_date, status, mood_before, talking_points, session_priority, prep_pack_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, session.user_id, session.session_date || null, session.status,
       session.mood_before || null, session.talking_points || null,
       session.session_priority || null, session.prep_pack_id || null,
       session.created_at, session.updated_at]
    );
    return session;
  }

  static async updateSession(session: Partial<TherapySession> & { id: string }): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    const updatable = ['session_date', 'status', 'mood_before', 'talking_points',
      'session_priority', 'prep_pack_id', 'mood_after', 'key_takeaways', 'session_rating'] as const;

    for (const key of updatable) {
      if ((session as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push((session as any)[key]);
      }
    }

    fields.push('updated_at = ?', 'needs_sync = 1');
    values.push(new Date().toISOString(), session.id);

    await SQLiteService.getInstance().execute(
      `UPDATE therapy_sessions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  static async getSessionsByUser(userId: string): Promise<TherapySession[]> {
    return SQLiteService.getInstance().query<TherapySession>(
      `SELECT * FROM therapy_sessions WHERE user_id = ? AND is_deleted = 0 ORDER BY session_date DESC`,
      [userId]
    );
  }

  static async deleteSession(id: string): Promise<void> {
    await SQLiteService.getInstance().execute(
      `UPDATE therapy_sessions SET is_deleted = 1, needs_sync = 1, updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  }

  // ─── Homework ───────────────────────────

  static async createHomework(item: HomeworkItem): Promise<HomeworkItem> {
    await SQLiteService.getInstance().execute(
      `INSERT INTO homework_items (id, session_id, user_id, content, completed, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [item.id, item.session_id, item.user_id, item.content, item.created_at]
    );
    return item;
  }

  static async toggleHomework(id: string, completed: boolean): Promise<void> {
    await SQLiteService.getInstance().execute(
      `UPDATE homework_items SET completed = ?, completed_at = ?, needs_sync = 1 WHERE id = ?`,
      [completed ? 1 : 0, completed ? new Date().toISOString() : null, id]
    );
  }

  static async getHomeworkBySession(sessionId: string): Promise<HomeworkItem[]> {
    return SQLiteService.getInstance().query<HomeworkItem>(
      `SELECT * FROM homework_items WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId]
    );
  }

  static async getHomeworkByUser(userId: string): Promise<HomeworkItem[]> {
    return SQLiteService.getInstance().query<HomeworkItem>(
      `SELECT * FROM homework_items WHERE user_id = ? ORDER BY created_at ASC`,
      [userId]
    );
  }

  static async getPendingSyncSessions(userId: string): Promise<TherapySession[]> {
    return SQLiteService.getInstance().query<TherapySession>(
      `SELECT * FROM therapy_sessions WHERE user_id = ? AND needs_sync = 1`,
      [userId]
    );
  }

  static async getPendingSyncHomework(userId: string): Promise<HomeworkItem[]> {
    return SQLiteService.getInstance().query<HomeworkItem>(
      `SELECT * FROM homework_items WHERE user_id = ? AND needs_sync = 1`,
      [userId]
    );
  }

  static async markSessionSynced(localId: string, serverId: string): Promise<void> {
    await SQLiteService.getInstance().execute(
      `UPDATE therapy_sessions SET server_id = ?, needs_sync = 0, synced_at = ? WHERE id = ?`,
      [serverId, new Date().toISOString(), localId]
    );
  }

  static async markHomeworkSynced(localId: string, serverId: string): Promise<void> {
    await SQLiteService.getInstance().execute(
      `UPDATE homework_items SET server_id = ?, needs_sync = 0, synced_at = ? WHERE id = ?`,
      [serverId, new Date().toISOString(), localId]
    );
  }
}
```

**Expected Result:** ✅ Full CRUD for sessions and homework in SQLite

---

#### Step 2.3: SDK Mixin — TherapyToolkit

**File: `stores/therapy_toolkit/index.ts`**

```typescript
import { Base } from "../base";
import type { TherapySession, PrepPack, HomeworkItem, GeneratePrepPackResponse } from "~/types/therapy_toolkit";

export class TherapyToolkit extends Base {

  // ─── Sessions ───────────────────────────

  async createSession(session: any): Promise<{ session: TherapySession }> {
    return this.fetch(`${this.config.base_url}/therapy-sessions`, {
      method: "POST",
      body: JSON.stringify(session),
    });
  }

  async getSessions(): Promise<{ sessions: TherapySession[] }> {
    return this.fetch(`${this.config.base_url}/therapy-sessions`);
  }

  async updateSession(id: string, updates: any): Promise<{ session: TherapySession }> {
    return this.fetch(`${this.config.base_url}/therapy-sessions?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteSession(id: string): Promise<void> {
    return this.fetch(`${this.config.base_url}/therapy-sessions?id=${id}`, {
      method: "DELETE",
    });
  }

  // ─── Homework ───────────────────────────

  async getHomework(sessionId?: string): Promise<{ homework: HomeworkItem[] }> {
    const url = sessionId
      ? `${this.config.base_url}/homework?session_id=${sessionId}`
      : `${this.config.base_url}/homework`;
    return this.fetch(url);
  }

  async createHomework(homework: any): Promise<{ homework: HomeworkItem }> {
    return this.fetch(`${this.config.base_url}/homework`, {
      method: "POST",
      body: JSON.stringify(homework),
    });
  }

  async toggleHomework(id: string, completed: boolean): Promise<void> {
    return this.fetch(`${this.config.base_url}/homework?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    });
  }

  async deleteHomework(id: string): Promise<void> {
    return this.fetch(`${this.config.base_url}/homework?id=${id}`, {
      method: "DELETE",
    });
  }

  // ─── Prep Packs ─────────────────────────

  async generatePrepPack(request: any): Promise<GeneratePrepPackResponse> {
    // This calls the AI service, not the core service
    return this.fetch(`${this.config.base_url}/prep-pack`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getPrepPacks(): Promise<{ prep_packs: PrepPack[] }> {
    return this.fetch(`${this.config.base_url}/prep-packs`);
  }

  async getPrepPack(id: string): Promise<{ prep_pack: PrepPack }> {
    return this.fetch(`${this.config.base_url}/prep-packs?id=${id}`);
  }
}
```

**Register in SDK**: Update `stores/tranquara_sdk.ts`:

```typescript
// Add import:
import { TherapyToolkit } from "./therapy_toolkit";

// Add to applyMixins:
interface TranquaraSDK extends UserStreaks, UserJournals, UserLearned, Auth, AIService, AIMemories, TherapyToolkit {}
applyMixins(TranquaraSDK, [UserStreaks, UserJournals, UserLearned, Auth, AIService, AIMemories, TherapyToolkit]);
```

**Expected Result:** ✅ SDK mixin registered; API methods available via `TranquaraSDK.getInstance()`

---

#### Step 2.4: Pinia Store — `therapy_toolkit_store.ts`

**File: `stores/stores/therapy_toolkit_store.ts`**

```typescript
import { defineStore } from "pinia";
import TranquaraSDK from "../tranquara_sdk";
import ToolkitRepository from "~/services/sqlite/toolkit_repository";
import { useAuthStore } from "./auth_store";
import type { TherapySession, HomeworkItem, CreateSessionInput, UpdateSessionInput } from "~/types/therapy_toolkit";

const getUserId = (): string | undefined => {
  const authStore = useAuthStore();
  return authStore.getUserUUID || undefined;
};

export const useToolkitStore = defineStore("therapy_toolkit", {
  state: () => ({
    sessions: [] as TherapySession[],
    currentSession: null as TherapySession | null,
    homeworkItems: [] as HomeworkItem[],
    isLoading: false,
    isOnline: false,
    error: null as string | null,
  }),

  getters: {
    upcomingSession: (state) => {
      return state.sessions.find(s => s.status !== 'completed') || null;
    },

    completedSessions: (state) => {
      return state.sessions.filter(s => s.status === 'completed');
    },

    pendingHomework: (state) => {
      return state.homeworkItems.filter(h => !h.completed);
    },
  },

  actions: {
    async loadFromLocal() {
      const userId = getUserId();
      if (!userId) return;

      try {
        this.sessions = await ToolkitRepository.getSessionsByUser(userId);
        this.homeworkItems = await ToolkitRepository.getHomeworkByUser(userId);
      } catch (error) {
        console.error('[ToolkitStore] Error loading from local:', error);
      }
    },

    async createSession(input: CreateSessionInput): Promise<TherapySession | null> {
      const userId = getUserId();
      if (!userId) return null;

      const now = new Date().toISOString();
      const session: TherapySession = {
        id: crypto.randomUUID(),
        user_id: userId,
        status: 'scheduled',
        ...input,
        created_at: now,
        updated_at: now,
        needs_sync: true,
      };

      try {
        await ToolkitRepository.createSession(session);
        this.sessions.unshift(session);

        // Sync to server if online
        if (this.isOnline) {
          try {
            const response = await TranquaraSDK.getInstance().createSession(input);
            await ToolkitRepository.markSessionSynced(session.id, response.session.id);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync session:', e);
          }
        }

        return session;
      } catch (error) {
        console.error('[ToolkitStore] Error creating session:', error);
        return null;
      }
    },

    async updateSession(id: string, updates: UpdateSessionInput) {
      try {
        await ToolkitRepository.updateSession({ id, ...updates });
        const idx = this.sessions.findIndex(s => s.id === id);
        if (idx !== -1) {
          this.sessions[idx] = { ...this.sessions[idx], ...updates, updated_at: new Date().toISOString() };
        }

        if (this.isOnline) {
          try {
            await TranquaraSDK.getInstance().updateSession(id, updates);
          } catch (e) {
            console.warn('[ToolkitStore] Failed to sync update:', e);
          }
        }
      } catch (error) {
        console.error('[ToolkitStore] Error updating session:', error);
      }
    },

    async addHomework(sessionId: string, content: string): Promise<HomeworkItem | null> {
      const userId = getUserId();
      if (!userId) return null;

      const item: HomeworkItem = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        user_id: userId,
        content,
        completed: false,
        created_at: new Date().toISOString(),
        needs_sync: true,
      };

      try {
        await ToolkitRepository.createHomework(item);
        this.homeworkItems.push(item);
        return item;
      } catch (error) {
        console.error('[ToolkitStore] Error adding homework:', error);
        return null;
      }
    },

    async toggleHomework(id: string) {
      const item = this.homeworkItems.find(h => h.id === id);
      if (!item) return;

      const newState = !item.completed;
      try {
        await ToolkitRepository.toggleHomework(id, newState);
        item.completed = newState;
        item.completed_at = newState ? new Date().toISOString() : undefined;
      } catch (error) {
        console.error('[ToolkitStore] Error toggling homework:', error);
      }
    },

    setOnline(online: boolean) {
      this.isOnline = online;
    },
  },
});
```

**Expected Result:** ✅ Offline-first store with full CRUD for sessions and homework

---

#### Step 2.5: Session Before/After Page

**File: `pages/toolkit/session/new.vue`**

```vue
<template>
  <section class="min-h-screen px-4 py-6 pb-20">
    <!-- Back -->
    <UButton variant="ghost" icon="i-lucide-chevron-left" @click="navigateTo('/toolkit')" class="mb-4" />

    <!-- Before Form -->
    <div v-if="step === 'before'" class="space-y-6">
      <h1 class="text-xl font-bold">{{ $t('toolkit.session.before.title') }}</h1>

      <!-- Mood Before -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">{{ $t('toolkit.session.before.mood') }}</label>
        <input type="range" v-model.number="form.mood_before" min="1" max="10"
          class="w-full accent-primary" />
        <div class="flex justify-between text-xs text-neutral-500 mt-1">
          <span>1</span><span>{{ form.mood_before }}</span><span>10</span>
        </div>
      </div>

      <!-- Talking Points -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">{{ $t('toolkit.session.before.talkingPoints') }}</label>
        <UTextarea v-model="form.talking_points" :rows="4" placeholder="..." />
      </div>

      <!-- Priority -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">{{ $t('toolkit.session.before.priority') }}</label>
        <UInput v-model="form.session_priority" placeholder="..." />
      </div>

      <!-- Session Date -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">Session Date</label>
        <UInput v-model="form.session_date" type="date" />
      </div>

      <UButton variant="solid" color="neutral" size="lg" class="w-full rounded-full" @click="saveBefore">
        {{ $t('common.save') }}
      </UButton>
    </div>

    <!-- After Form -->
    <div v-if="step === 'after'" class="space-y-6">
      <h1 class="text-xl font-bold">{{ $t('toolkit.session.after.title') }}</h1>

      <!-- Mood After -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">{{ $t('toolkit.session.after.mood') }}</label>
        <input type="range" v-model.number="afterForm.mood_after" min="1" max="10"
          class="w-full accent-primary" />
        <div class="flex justify-between text-xs text-neutral-500 mt-1">
          <span>1</span><span>{{ afterForm.mood_after }}</span><span>10</span>
        </div>
      </div>

      <!-- Takeaways -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">{{ $t('toolkit.session.after.takeaways') }}</label>
        <UTextarea v-model="afterForm.key_takeaways" :rows="4" placeholder="..." />
      </div>

      <!-- Homework -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">{{ $t('toolkit.session.after.homework') }}</label>
        <div v-for="(hw, i) in homeworkInputs" :key="i" class="flex gap-2 mb-2">
          <UInput v-model="homeworkInputs[i]" class="flex-1" placeholder="..." />
          <UButton variant="ghost" icon="i-lucide-x" size="sm" @click="homeworkInputs.splice(i, 1)" />
        </div>
        <UButton variant="outline" size="sm" @click="homeworkInputs.push('')">
          + {{ $t('toolkit.session.after.addHomework') }}
        </UButton>
      </div>

      <!-- Rating -->
      <div>
        <label class="text-sm text-neutral-400 mb-2 block">{{ $t('toolkit.session.after.rating') }}</label>
        <div class="flex gap-2">
          <button v-for="star in 5" :key="star" @click="afterForm.session_rating = star"
            class="text-2xl" :class="star <= (afterForm.session_rating || 0) ? 'text-yellow-400' : 'text-neutral-600'">
            ★
          </button>
        </div>
      </div>

      <UButton variant="solid" color="neutral" size="lg" class="w-full rounded-full" @click="saveAfter">
        {{ $t('common.save') }}
      </UButton>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useToolkitStore } from '~/stores/stores/therapy_toolkit_store';

definePageMeta({ layout: 'detail' });

const toolkitStore = useToolkitStore();
const route = useRoute();

const step = ref<'before' | 'after'>((route.query.step as string) === 'after' ? 'after' : 'before');

// Before form
const form = reactive({
  session_date: new Date().toISOString().split('T')[0],
  mood_before: 5,
  talking_points: '',
  session_priority: '',
});

// After form
const afterForm = reactive({
  mood_after: 5,
  key_takeaways: '',
  session_rating: 0,
});
const homeworkInputs = ref<string[]>(['']);

const saveBefore = async () => {
  const session = await toolkitStore.createSession({
    session_date: form.session_date,
    mood_before: form.mood_before,
    talking_points: form.talking_points,
    session_priority: form.session_priority,
  });
  if (session) {
    navigateTo('/toolkit');
  }
};

const saveAfter = async () => {
  const sessionId = route.query.sessionId as string;
  if (!sessionId) return;

  await toolkitStore.updateSession(sessionId, {
    mood_after: afterForm.mood_after,
    key_takeaways: afterForm.key_takeaways,
    session_rating: afterForm.session_rating,
    status: 'completed',
  });

  // Save homework items
  for (const hw of homeworkInputs.value.filter(h => h.trim())) {
    await toolkitStore.addHomework(sessionId, hw.trim());
  }

  navigateTo('/toolkit');
};
</script>
```

**Expected Result:** ✅ Before/after session form with mood slider, text inputs, homework items, star rating.

---

#### Step 2.6: Core Service — Backend Endpoints

**File: `migrations/000027_create_therapy_toolkit_tables.up.sql`**

Use the PostgreSQL schema from the Data Models section above.

**File: `migrations/000027_create_therapy_toolkit_tables.down.sql`**

```sql
DROP TABLE IF EXISTS homework_items;
ALTER TABLE therapy_sessions DROP CONSTRAINT IF EXISTS fk_sessions_prep_pack;
DROP TABLE IF EXISTS therapy_sessions;
DROP TABLE IF EXISTS prep_packs;
```

**File: `internal/data/therapy_session.go`**

Follow existing pattern from `internal/data/user_journal.go`: define `TherapySession` struct + `TherapySessionModel` with `Insert`, `Get`, `GetAll`, `Update`, `Delete` methods.

**File: `internal/data/homework_item.go`**

Same pattern: `HomeworkItem` struct + `HomeworkItemModel` with CRUD.

**File: `internal/data/prep_pack.go`**

Same pattern: `PrepPack` struct + `PrepPackModel` with `Insert`, `Get`, `GetAll`.

**Register models** in `internal/data/models.go`:

```go
type Models struct {
    // ... existing ...
    TherapySession TherapySessionModel
    PrepPack       PrepPackModel
    HomeworkItem   HomeworkItemModel
}
```

**File: `cmd/api/therapy_session.go`**

Handlers for session CRUD. Follow existing `cmd/api/user_journal.go` pattern.

**File: `cmd/api/router.go`** — add routes:

```go
// Therapy Toolkit
router.HandlerFunc(http.MethodPost, "/v1/therapy-sessions", app.authMiddleWare(app.createSessionHandler))
router.HandlerFunc(http.MethodGet, "/v1/therapy-sessions", app.authMiddleWare(app.listSessionsHandler))
router.HandlerFunc(http.MethodPut, "/v1/therapy-sessions", app.authMiddleWare(app.updateSessionHandler))
router.HandlerFunc(http.MethodDelete, "/v1/therapy-sessions", app.authMiddleWare(app.deleteSessionHandler))

router.HandlerFunc(http.MethodPost, "/v1/homework", app.authMiddleWare(app.createHomeworkHandler))
router.HandlerFunc(http.MethodGet, "/v1/homework", app.authMiddleWare(app.listHomeworkHandler))
router.HandlerFunc(http.MethodPatch, "/v1/homework", app.authMiddleWare(app.toggleHomeworkHandler))
router.HandlerFunc(http.MethodDelete, "/v1/homework", app.authMiddleWare(app.deleteHomeworkHandler))
```

**Test:**
```bash
TOKEN="your_keycloak_token"

# Create session
curl -X POST http://localhost:4000/v1/therapy-sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_date":"2026-03-15T10:00:00Z","mood_before":5,"talking_points":"Work stress"}'

# List sessions
curl http://localhost:4000/v1/therapy-sessions -H "Authorization: Bearer $TOKEN"
```

**Expected Result:** ✅ Full CRUD API for sessions and homework in Go backend

---

#### Phase 2 Verification Checklist

- [ ] SQLite migration v5 creates therapy_sessions + homework_items tables
- [ ] SDK mixin registered, API calls work with auth
- [ ] Creating a session saves to SQLite offline, syncs when online
- [ ] Before form saves mood, talking points, priority
- [ ] After form saves mood, takeaways, rating, homework
- [ ] Homework items toggleable on Toolkit page
- [ ] PostgreSQL migration 000027 runs successfully
- [ ] Go CRUD endpoints return correct responses

> **⚠️ Sync Service — Deferred to Phase 4**
>
> The current `SyncService` is journal-specific (not a generic sync framework). The Pinia store
> already contains **opportunistic sync stubs** — each `createSession`, `updateSession`, `deleteSession`,
> and homework action attempts the SDK API call when online. This provides basic sync until a proper
> bi-directional sync service is built in Phase 4.
>
> **Phase 4 will add:**
> - `ToolkitSyncService` (or extend `SyncService`) with session/homework upload/download
> - `syncDownloadFromServer()` + `syncUploadToServer()` on `therapy_toolkit_store`
> - `fullBiDirectionalSync()` integrated into `04.background_sync.client.ts`
> - Conflict resolution (server_id mapping, updated_at comparison)

---

### Phase 3: Prep Pack (AI)

> **Goal**: AI-generated session preparation packs from journal data.

---

#### Step 3.1: AI Service Endpoint — `POST /api/prep-pack`

**File: `tranquara_ai_service/router/prep_pack.py`**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from service.ai_service_processor import AIProcessor

router = APIRouter()

class PrepPackRequest(BaseModel):
    user_id: str
    date_range_start: str           # ISO date
    date_range_end: str             # ISO date
    journal_entries: list[dict]     # passed from Core Service
    memories: list[dict] = []       # AI Memories
    language: str = "en"

@router.post("/api/prep-pack")
async def generate_prep_pack(request: PrepPackRequest):
    """Generate AI Prep Pack from user's journal entries + memories."""
    try:
        if not request.journal_entries:
            raise HTTPException(status_code=400, detail="No journal entries provided")

        ai_processor = AIProcessor()
        prep_pack = ai_processor.generate_prep_pack(
            user_id=request.user_id,
            journal_entries=request.journal_entries,
            memories=request.memories,
            date_range_start=request.date_range_start,
            date_range_end=request.date_range_end,
            language=request.language,
        )

        return {
            "prep_pack": prep_pack,
            "meta": {
                "journals_analyzed": len(request.journal_entries),
                "date_range": f"{request.date_range_start} – {request.date_range_end}",
                "generated_at": __import__('datetime').datetime.utcnow().isoformat() + "Z",
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prep pack generation error: {str(e)}")
```

**Register in `main.py`:**

```python
from router.prep_pack import router as prep_pack_router
app.include_router(prep_pack_router)
```

**Expected Result:** ✅ AI endpoint accepts journal data and returns structured prep pack

---

#### Step 3.2: AI Processor — `generate_prep_pack` Method

**File: `tranquara_ai_service/service/ai_service_processor.py`**

Add a new method to the existing `AIProcessor` class:

```python
def generate_prep_pack(self, user_id: str, journal_entries: list, memories: list,
                       date_range_start: str, date_range_end: str, language: str = "en") -> dict:
    """Generate a structured Prep Pack from journal entries and AI memories."""

    # Format entries for the prompt
    entries_text = "\n\n".join([
        f"Date: {e.get('created_at', 'unknown')}\n"
        f"Title: {e.get('title', 'Untitled')}\n"
        f"Mood: {e.get('mood_score', 'N/A')}/10\n"
        f"Content: {e.get('content', '')[:500]}"
        for e in journal_entries
    ])

    memories_text = "\n".join([
        f"- [{m.get('category', 'general')}] {m.get('content', '')}"
        for m in memories
    ]) or "No known patterns yet."

    prompt = PREP_PACK_PROMPT.format(
        journal_entries=entries_text,
        memories=memories_text,
        language=language,
    )

    # Use structured output for reliable JSON
    from langchain_core.output_parsers import JsonOutputParser
    parser = JsonOutputParser()

    response = self.llm.invoke(prompt)
    return parser.parse(response.content)
```

**Prompt constant** (add to `service/prompts.py`):

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
   breakthrough moments, or recurring pain points. Include date, title, mood, a brief excerpt, and significance.

4. PATTERNS: Cross-reference with known memories and new patterns you detect.
   Include confidence level (0.5-1.0) and category (triggers/patterns/coping/relationships/growth).

5. DISCUSSION POINTS: Suggest 2-3 open-ended questions the user could bring to
   their therapist. Frame them as invitations, not directives.

6. GROWTH MOMENTS: Identify positive changes, self-awareness moments, or healthy
   coping behaviors.

LANGUAGE: Respond in {language}.

Respond in valid JSON with this exact structure:
{{
  "mood_overview": {{
    "average": number,
    "trend": "improving"|"declining"|"stable",
    "data_points": [{{"date": "ISO", "score": number}}],
    "highest": {{"score": number, "date": "ISO", "title": "string"}},
    "lowest": {{"score": number, "date": "ISO", "title": "string"}}
  }},
  "key_themes": ["string"],
  "emotional_highlights": [{{
    "date": "ISO", "title": "string", "mood": number,
    "excerpt": "string", "significance": "string"
  }}],
  "patterns": [{{
    "pattern": "string", "category": "string", "confidence": number
  }}],
  "discussion_points": ["string"],
  "growth_moments": ["string"]
}}
"""
```

**Expected Result:** ✅ AI generates structured prep pack from journal data

---

#### Step 3.3: Prep Pack SQLite Cache + Store Actions

Add to `services/sqlite/schema.ts` (part of migration v5 or add as v6):

```sql
CREATE TABLE IF NOT EXISTS prep_packs (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  user_id TEXT NOT NULL,
  date_range_start TEXT NOT NULL,
  date_range_end TEXT NOT NULL,
  content TEXT NOT NULL,
  personal_notes TEXT,
  journal_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  needs_sync INTEGER DEFAULT 1,
  synced_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_prep_packs_user_id ON prep_packs(user_id);
```

Add to `ToolkitRepository`:

```typescript
static async savePrepPack(pack: PrepPack): Promise<void> {
  await SQLiteService.getInstance().execute(
    `INSERT OR REPLACE INTO prep_packs (id, user_id, date_range_start, date_range_end, content, journal_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [pack.id, pack.user_id, pack.date_range_start, pack.date_range_end,
     JSON.stringify(pack), pack.journal_count, pack.created_at]
  );
}

static async getPrepPacksByUser(userId: string): Promise<PrepPack[]> {
  const rows = await SQLiteService.getInstance().query<any>(
    `SELECT * FROM prep_packs WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(r => JSON.parse(r.content));
}
```

Add to `therapy_toolkit_store.ts`:

```typescript
// In state:
prepPacks: [] as PrepPack[],
currentPrepPack: null as PrepPack | null,
isGeneratingPrepPack: false,

// In actions:
async generatePrepPack(dateRangeStart: string, dateRangeEnd: string) {
  this.isGeneratingPrepPack = true;
  try {
    const response = await TranquaraSDK.getInstance().generatePrepPack({
      date_range_start: dateRangeStart,
      date_range_end: dateRangeEnd,
    });
    const pack = { ...response.prep_pack, id: crypto.randomUUID() };
    await ToolkitRepository.savePrepPack(pack);
    this.prepPacks.unshift(pack);
    this.currentPrepPack = pack;
    return pack;
  } catch (error) {
    console.error('[ToolkitStore] Error generating prep pack:', error);
    this.error = 'Failed to generate prep pack';
    return null;
  } finally {
    this.isGeneratingPrepPack = false;
  }
},
```

**Expected Result:** ✅ Prep pack generated via AI, cached in SQLite for offline viewing

---

#### Step 3.4: Prep Pack UI Pages

**File: `pages/toolkit/prep-pack/index.vue`** — Date range selector + generation UI  
**File: `pages/toolkit/prep-pack/[id].vue`** — Displays generated prep pack sections

These follow the same pattern as the session form: a form page that calls the store action, and a detail page that renders the structured data.

Key UI sections for the prep pack view:
- Mood trend chart (can reuse existing ECharts/vue-echarts)
- Key themes as tag chips
- Emotional highlights as cards
- Patterns with confidence bars
- Discussion points as numbered list
- Growth moments as list

**Expected Result:** ✅ Full prep pack generation and viewing flow

---

#### Phase 3 Verification Checklist

- [ ] `POST /api/prep-pack` returns valid structured JSON
- [ ] Frontend generates prep pack with loading state
- [ ] Generated pack cached in SQLite
- [ ] Prep pack view page renders all 6 sections
- [ ] Empty state shown when no journals exist
- [ ] Error handling for AI service unavailable

---

### Phase 4: Polish & Integration

> **Goal**: Cross-feature integration, reminders, export, additional grounding tools.

---

#### Step 4.1: Homework on Home Page

Add a homework card component to the home page (`pages/index.vue`):

```vue
<!-- In pages/index.vue, add below Daily Check-In section: -->
<ToolkitHomeworkCard v-if="pendingHomework.length > 0" :items="pendingHomework" />
```

**File: `components/Toolkit/HomeworkCard.vue`**

Displays pending homework items from `therapy_toolkit_store.pendingHomework` with checkboxes. Tapping an item calls `toolkitStore.toggleHomework(id)`.

**Expected Result:** ✅ Pending homework visible on Home page as gentle reminders

---

#### Step 4.2: Prep Pack — Preparation Status Section

When viewing a prep pack, add a section showing which journey steps are complete/incomplete:

```typescript
// In prep pack view, compute from learnedStore:
const preparationStatus = JOURNEY_STEPS.map(step => ({
  label: t(step.labelKey),
  completed: learnedStore.getCompletedCount(step.collectionId),
  total: getSlideGroupCount(step.collectionId),
  isComplete: learnedStore.getCompletedCount(step.collectionId) >= getSlideGroupCount(step.collectionId),
}));
```

Show as a checklist: ✅ Learn About Therapy (3/3) / 🔵 Mental Health History (2/4) / etc.

**Expected Result:** ✅ Prep pack shows preparation journey completion status

---

#### Step 4.3: Export / Share Prep Pack (Future)

- Copy to clipboard as formatted text
- Generate PDF (using browser print or a library)
- Share via Capacitor Share API

---

#### Step 4.4: Session Reminders (Future)

Integrate with Capacitor Local Notifications to remind users of upcoming sessions.

---

#### Step 4.5: Additional Grounding Exercises (Future)

- 5-4-3-2-1 Grounding — step-by-step sensory exercise
- Body Scan — visual body outline with guided attention
- Safety Affirmations — customizable calming statements

Each follows the same page pattern as Box Breathing under `/toolkit/grounding/[exercise].vue`.

---

#### Phase 4 Verification Checklist

- [ ] Homework items appear on Home page
- [ ] Prep pack shows preparation journey status
- [ ] All toolkit features work offline (except prep pack generation)
- [ ] Sync works correctly when going online → offline → online

---

## ✅ Acceptance Criteria

### Phase 1 (MVP — Shippable)
1. Bottom nav shows "Toolkit" (EN) / "Bộ công cụ" (VI) with HeartHandshake icon
2. Toolkit page displays 4 journey steps with progress tracking
3. Tapping a journey step opens the existing slide collection viewer
4. Completing slides in journey collections updates progress
5. Library page no longer shows the 4 therapy collections
6. Box Breathing exercise works with animated countdown
7. All strings display correctly in EN and VI
8. Everything works fully offline

### Phase 2 (Session Tracker)
9. Users can create sessions with before-session data (mood, talking points, priority)
10. Users can complete sessions with after-session data (mood, takeaways, rating, homework)
11. Homework items are checkable
12. Sessions saved offline, synced when online
13. Go backend CRUD endpoints functional

### Phase 3 (AI Prep Pack)
14. Users can generate a prep pack from their journal entries
15. AI returns structured pack with mood, themes, patterns, discussion points, growth
16. Generated packs are cached locally for offline viewing
17. Empty state shown when no journals exist

### Phase 4 (Polish)
18. Homework visible on Home page
19. Prep pack shows preparation journey completion status
20. All sync operations work bidirectionally

---

## 📂 External References

### Authentication & Security
- [Keycloak Documentation](https://www.keycloak.org/documentation) — Token validation
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/) — Health data guidelines
- [RFC 6749 OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) — Token refresh flow

### Framework/Library Documentation
- [Nuxt 3](https://nuxt.com/docs) — SPA mode, file-based routing
- [Pinia](https://pinia.vuejs.org/) — State management
- [Nuxt UI 3](https://ui.nuxt.com/) — Component library
- [Capacitor](https://capacitorjs.com/docs) — Mobile platform
- [Capacitor SQLite](https://github.com/capacitor-community/sqlite) — Offline database
- [TipTap](https://tiptap.dev/) — Rich text editor
- [Lucide Icons](https://lucide.dev/icons/) — Icon library
- [ECharts](https://echarts.apache.org/) — Charting for mood trends

### AI & Backend
- [LangChain](https://python.langchain.com/) — AI orchestration
- [OpenAI API](https://platform.openai.com/docs/api-reference) — GPT-4o-mini
- [Qdrant](https://qdrant.tech/documentation/) — Vector database
- [FastAPI](https://fastapi.tiangolo.com/) — Python REST framework
- [Go net/http](https://pkg.go.dev/net/http) — Go HTTP package

### Design Inspiration
- [Therapy Notebook](https://www.therapynotebook.com/) — Session tracking patterns
- [Calm App](https://www.calm.com/) — Breathing exercise animations
- [APA Therapy Preparation](https://www.apa.org/topics/psychotherapy) — Evidence-based guidelines
