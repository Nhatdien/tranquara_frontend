# Therapy Toolkit — Data Models

---

## TypeScript Types (Frontend)

```typescript
// ─── Preparation Journey ───────────────────────────────
// These types REUSE existing collection/slide types from the Library.
// No new data models are needed — we only define the journey structure.

interface JourneyStep {
  collectionId: string;            // references existing collection ID
  step: number;                    // 1-4 (display order)
  label: string;                   // e.g., "Learn About Therapy"
  description: string;
  icon: string;                    // Lucide icon name
}

interface JourneyProgress {
  steps: {
    [collectionId: string]: {
      completedSlideGroups: string[];  // IDs of completed slide groups
      totalSlideGroups: number;
      lastAccessedAt: string;          // ISO datetime
    };
  };
  overallPercent: number;              // computed: total completed / total slide groups
}

// The 4 therapy collections use existing types:
// - Collection (from testCollection.ts) — title, slide_groups, type, category
// - SlideGroup — title, slides[]
// - Slide — question text, type (text/journal/learn)
// Progress is tracked via the existing `user_learned` store.

// ─── Prep Pack ─────────────────────────────────────────

interface PrepPack {
  id: string;
  user_id: string;
  date_range_start: string;        // ISO date
  date_range_end: string;          // ISO date
  
  mood_overview: MoodOverview;
  key_themes: string[];
  emotional_highlights: EmotionalHighlight[];
  patterns: DetectedPattern[];
  discussion_points: string[];
  growth_moments: string[];
  
  personal_notes?: string;         // user-added notes
  journal_count: number;
  created_at: string;
  synced: boolean;
}

interface MoodOverview {
  average: number;                 // 1-10
  trend: 'improving' | 'declining' | 'stable';
  data_points: MoodDataPoint[];
  highest: MoodHighlight;
  lowest: MoodHighlight;
}

interface MoodDataPoint {
  date: string;
  score: number;
}

interface MoodHighlight {
  score: number;
  date: string;
  title: string;
}

interface EmotionalHighlight {
  date: string;
  title: string;
  mood: number;
  excerpt: string;
  significance: string;
  journal_id?: string;             // link back to journal entry
}

interface DetectedPattern {
  pattern: string;
  category: 'triggers' | 'patterns' | 'coping' | 'relationships' | 'growth';
  confidence: number;              // 0.5 - 1.0
  source?: string;                 // 'journals' | 'memories'
}

// ─── Therapy Session ───────────────────────────────────

interface TherapySession {
  id: string;
  user_id: string;
  session_date?: string;           // ISO datetime
  status: SessionStatus;
  
  // Before
  mood_before?: number;            // 1-10
  talking_points?: string;
  session_priority?: string;
  prep_pack_id?: string;
  
  // After
  mood_after?: number;             // 1-10
  key_takeaways?: string;
  session_rating?: number;         // 1-5
  
  // Related
  homework_items?: HomeworkItem[];
  prep_pack?: PrepPack;
  
  created_at: string;
  updated_at: string;
  synced: boolean;
}

type SessionStatus = 'scheduled' | 'before_completed' | 'completed';

interface CreateSessionInput {
  session_date?: string;
  mood_before?: number;
  talking_points?: string;
  session_priority?: string;
  prep_pack_id?: string;
}

interface UpdateSessionInput {
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

interface HomeworkItem {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  synced: boolean;
}

// ─── Grounding Tools ──────────────────────────────────

interface BreathingConfig {
  pattern: 'box' | 'relaxing' | 'energizing';
  inhale: number;                  // seconds
  holdIn: number;
  exhale: number;
  holdOut: number;
  duration: number;                // total minutes
}

interface BreathingRecord {
  id: string;
  pattern: string;
  duration: number;                // actual seconds completed
  completed: boolean;
  mood_before?: number;
  mood_after?: number;
  created_at: string;
}

interface UserAffirmation {
  id: string;
  user_id: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
}

// ─── Prep Pack Generation Request ─────────────────────

interface GeneratePrepPackRequest {
  date_range_start: string;
  date_range_end: string;
  language?: string;
}

// The AI service will:
// 1. Fetch journals from Core Service for the date range
// 2. Query Qdrant for additional context
// 3. Fetch AI Memories for known patterns
// 4. Generate structured prep pack via GPT-4o-mini
```

---

## Database Schema (PostgreSQL — Core Service)

### therapy_sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Session ID |
| user_id | TEXT | NOT NULL | Keycloak user ID |
| session_date | TIMESTAMPTZ | NULLABLE | When the therapy session is/was |
| status | TEXT | DEFAULT 'scheduled' | scheduled / before_completed / completed |
| mood_before | INTEGER | CHECK 1-10 | Mood before session |
| talking_points | TEXT | NULLABLE | What user wants to discuss |
| session_priority | TEXT | NULLABLE | Top priority for this session |
| prep_pack_id | UUID | FK → prep_packs(id) | Linked prep pack |
| mood_after | INTEGER | CHECK 1-10 | Mood after session |
| key_takeaways | TEXT | NULLABLE | Session takeaways |
| session_rating | INTEGER | CHECK 1-5 | Session rating |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### prep_packs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Prep pack ID |
| user_id | TEXT | NOT NULL | Keycloak user ID |
| date_range_start | DATE | NOT NULL | Analysis start date |
| date_range_end | DATE | NOT NULL | Analysis end date |
| content | JSONB | NOT NULL | Full AI-generated prep pack content |
| journal_count | INTEGER | DEFAULT 0 | Number of journals analyzed |
| personal_notes | TEXT | NULLABLE | User-added notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Generation timestamp |

### homework_items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Homework ID |
| session_id | UUID | FK → therapy_sessions(id) ON DELETE CASCADE | Parent session |
| user_id | TEXT | NOT NULL | Keycloak user ID |
| content | TEXT | NOT NULL | Homework description |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| completed_at | TIMESTAMPTZ | NULLABLE | When completed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

## SQLite Schema (Frontend Local Storage)

Same structure as PostgreSQL tables above, with these differences:
- `id` is `TEXT` (UUIDs stored as strings)
- `synced` column added (`INTEGER DEFAULT 0`) for offline sync tracking
- Timestamps stored as `TEXT` (ISO 8601 strings)
- No JSONB — use `TEXT` and parse JSON in application layer

Additional local-only table:

### user_affirmations (local only)

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | UUID string |
| user_id | TEXT | User identifier |
| content | TEXT | Affirmation text |
| is_favorite | INTEGER | 0 or 1 |
| created_at | TEXT | ISO timestamp |

---

## Entity Relationships

```
┌───────────────────────────────────────────────────────────────┐
│                   Preparation Journey                         │
│  (reuses existing data — no new tables)                       │
│                                                               │
│  JourneyStep[4]  ──references──►  Collection (existing)       │
│                                    ├── SlideGroup[]           │
│                                    └── Slide[]                │
│                                                               │
│  Progress tracked via  ──►  user_learned store (existing)     │
└───────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  TherapySession  │
├─────────────────┤
│ id              │
│ user_id         │         ┌──────────────┐
│ session_date    │    1:N  │ HomeworkItem  │
│ status          │────────►│              │
│ mood_before     │         │ session_id   │
│ mood_after      │         │ content      │
│ talking_points  │         │ completed    │
│ session_rating  │         └──────────────┘
│ prep_pack_id ───┼──┐
└─────────────────┘  │
                     │ N:1
                     │
                ┌────┴──────────┐
                │   PrepPack    │
                ├───────────────┤
                │ id            │
                │ user_id       │
                │ date_range    │
                │ content (JSON)│
                │ journal_count │
                └───────────────┘
                     │
                     │ references (logical, not FK)
                     ▼
            ┌──────────────────┐
            │  Journal Entries  │  (existing table)
            │  AI Memories      │  (existing Qdrant)
            └──────────────────┘
```
