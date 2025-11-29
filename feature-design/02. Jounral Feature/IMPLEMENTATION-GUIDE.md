# Journaling Feature - Implementation Guide# 📝 Journaling Feature - Complete Implementation Guide



> **Status**: ✅ Design Complete - Ready for Implementation  > **Status**: ✅ Design Complete - Ready for Implementation  

> **Last Updated**: November 29, 2025  > **Last Updated**: November 28, 2025  

> **Version**: 1.1.0  > **Version**: 1.1.0

> **Priority**: 🔴 CRITICAL (Offline-First)

---

---

## 📑 Table of Contents

## 📑 Table of Contents

1. [Overview](#overview)

1. [Overview](#overview)2. [Architecture](#architecture)

2. [User Flows](#user-flows)3. [Data Models & Storage](#data-models--storage)

3. [Data Flow](#data-flow)4. [Current Implementation Status](#current-implementation-status)

4. [Data Models](#data-models)5. [Conflicts & Issues Identified](#conflicts--issues-identified)

5. [Implementation Steps](#implementation-steps)6. [Verified Design Decisions](#verified-design-decisions)

6. [Acceptance Criteria](#acceptance-criteria)7. [Implementation Roadmap](#implementation-roadmap)

8. [API Integration](#api-integration)

---9. [AI Chat Assistant](#ai-chat-assistant)

10. [Offline-First Strategy & Token Management](#offline-first-strategy--token-management)

## 🎯 Overview11. [Testing Strategy](#testing-strategy)



### Feature Summary---

AI-assisted emotion journaling with offline-first architecture. Users create journal entries through structured Collections (slide-based prompts) or free-form writing. AI provides "Go Deeper" follow-up questions inline. All data stored locally in SQLite with transparent background sync.

## 🎯 Overview

**User Story:**

> As a user, I want to journal my emotions offline using guided prompts or free-form writing, with AI assistance to explore deeper thoughts, so I can build a reflection habit and prepare for therapy.### Feature Purpose

AI-assisted emotion journaling that helps users express emotions, build reflection habits, and track mental health patterns through:

### Key Requirements- **Collection-based journaling** with structured slide groups

- **Offline-First**: Full journaling capability without internet (Day One style)- **Free-form journaling** for spontaneous expression

- **Collections Architecture**: Predefined slide groups with structured prompts- **AI "Go Deeper" assistance** for single follow-up prompts (inline, not chat)

- **AI "Go Deeper" Button**: Single AI follow-up question (inline, no chat UI)- **Offline-first architecture** using SQLite

- **SQLite Local Storage**: All journals saved locally before cloud sync- **Cloud sync** via PostgreSQL and RabbitMQ

- **Numeric Mood Tracking**: 1-10 scale for emotion analysis

- **JSON + HTML Storage**: TipTap JSON content with HTML preview field### Key Design Principles (VERIFIED ✅)

- **Last-Write-Wins Sync**: Simple conflict resolution for v1.01. **Offline-First**: Full functionality without internet (Day One style) - CRITICAL for v1.0

2. **AI-Assisted**: "Go Deeper" button for single AI follow-up prompts (inline, no chat UI)

---3. **Structured Data**: JSON content storage with HTML preview field

4. **Privacy-Focused**: Encrypted local storage, optional cloud sync

## 👤 User Flows5. **Numeric Mood Tracking**: 1-10 scale for emotion metrics

6. **Last-Write-Wins**: Simple conflict resolution for v1.0

### Flow 1: Create Journal Entry (Collection-Based)7. **Collections Architecture**: Standardized terminology (Collections → Slide Groups → Slides)



```mermaid---

graph TD

    A[User taps 'Start Journaling'] --> B[Browse Collections]## 🏗️ Architecture

    B --> C[Select Collection]

    C --> D[Load Slide Group 1]### System Components

    D --> E[Navigate Slides]

    E --> F{Slide Type?}```mermaid

    F -->|emotion_log| G[Select Mood 1-10]┌─────────────────────────────────────────────────────────────────────────┐

    F -->|sleep_check| H[Enter Hours Slept]│                         FRONTEND (Nuxt 3 SPA)                            │

    F -->|journal_prompt| I[TipTap Editor]├─────────────────────────────────────────────────────────────────────────┤

    F -->|doc| J[Read Content]│                                                                          │

    G --> K[Next Slide]│  ┌──────────────────────────────────────────────────────────────────┐  │

    H --> K│  │                     Application Layer                             │  │

    I --> L{User clicks 'Go Deeper'?}│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │

    L -->|Yes| M[AI generates follow-up question]│  │  │ Vue Pages  │  │ Components │  │Composables │  │  Plugins   │ │  │

    M --> N[Display inline gray text]│  │  │            │  │            │  │            │  │            │ │  │

    N --> I│  │  │ - Journal  │  │ - Slides   │  │ -SlideGrp  │  │ -auth.ts   │ │  │

    L -->|No| K│  │  │ - History  │  │ - Emotion  │  │ -WebSocket │  │ -sdk.ts    │ │  │

    J --> K│  │  │ -Collections│ │ -GoDeeperBtn│ │            │  │            │ │  │

    K --> O{More Slides?}│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │  │

    O -->|Yes| E│  └──────────────────────────────────────────────────────────────────┘  │

    O -->|No| P[Save to SQLite]│                               ↓ ↑                                       │

    P --> Q[Mark needs_sync=1]│  ┌──────────────────────────────────────────────────────────────────┐  │

    Q --> R[Navigate to Journal List]│  │                      State Management (Pinia)                     │  │

    R --> S[Background SyncService processes queue]│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │

    S --> T[POST /v1/journal to cloud]│  │  │userJournalSt │  │  chatlogSt   │  │   authStore  │           │  │

    T --> U[Update needs_sync=0]│  │  │              │  │              │  │              │           │  │

```│  │  │ -journals[]  │  │ -chatlogs[]  │  │ -isOnline    │           │  │

│  │  │ -create()    │  │ -sendMsg()   │  │ -canSync()   │           │  │

**Steps:**│  │  │ -update()    │  │              │  │              │           │  │

1. User opens app → Taps "Start Journaling"│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │

2. Selects Collection (e.g., "Daily Reflection")│  └──────────────────────────────────────────────────────────────────┘  │

3. App loads first Slide Group from SQLite cache│                               ↓ ↑                                       │

4. User navigates through slides using carousel:│  ┌──────────────────────────────────────────────────────────────────┐  │

   - **Emotion Log**: Slider to select mood (1-10)│  │                      Service Layer (Singletons)                   │  │

   - **Sleep Check**: Input hours slept│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │

   - **Journal Prompt**: TipTap rich text editor│  │  │  SQLiteService│ │  AuthService  │ │  SyncService  │           │  │

     - User can click "Go Deeper" → AI generates 1 follow-up question│  │  │              │  │              │  │              │           │  │

     - AI response shown as inline gray text│  │  │ -query()     │  │ -getToken()  │  │ -processQ()  │           │  │

   - **Doc**: Read-only educational content│  │  │ -execute()   │  │ -refresh()   │  │ -onOnline()  │           │  │

5. On last slide → User taps "Save"│  │  │ -migrate()   │  │ -canSync()   │  │ -retry()     │           │  │

6. App saves journal to SQLite immediately:│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │

   - `content` field: TipTap JSON│  │                          ↓                     ↓                  │  │

   - `content_html` field: Rendered HTML preview│  │  ┌──────────────┐  ┌──────────────┐                              │  │

   - `mood_score` field: Integer 1-10│  │  │TranquaraSDK  │  │WebSocketClt  │                              │  │

   - `needs_sync` flag: 1 (true)│  │  │ -API wrapper │  │ -AI chat     │                              │  │

7. User sees journal in list immediately│  │  └──────────────┘  └──────────────┘                              │  │

8. Background: SyncService checks network + token validity│  └──────────────────────────────────────────────────────────────────┘  │

9. If online + valid token → POST to `/v1/journal`│                               ↓ ↑                                       │

10. On success → Update `needs_sync=0`, `synced_at=NOW()`│  ┌──────────────────────────────────────────────────────────────────┐  │

│  │               LOCAL STORAGE (Device - OFFLINE CAPABLE)            │  │

**Expected Outcome:** User journals offline, sees instant feedback, data syncs transparently│  ├──────────────────────────────────────────────────────────────────┤  │

│  │  SQLite Database (@capacitor-community/sqlite)                   │  │

---│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │  │

│  │  │ user_journals  │ │ai_guider_chatlog│ │  collections  │       │  │

### Flow 2: AI "Go Deeper" Assistant│  │  │ ✅ Offline R/W │ │ ✅ Offline R/W  │ │ ✅ Cached API │       │  │

│  │  └────────────────┘ └────────────────┘ └────────────────┘       │  │

```mermaid│  │  ┌────────────────┐ ┌────────────────┐                          │  │

graph TD│  │  │ slide_groups   │ │  sync_queue    │                          │  │

    A[User typing in JournalPrompt slide] --> B[User clicks 'Go Deeper' button]│  │  │ ✅ Cached API  │ │ ✅ Pending sync│                          │  │

    B --> C{Token valid?}│  │  └────────────────┘ └────────────────┘                          │  │

    C -->|No| D[Show 'Sign in for AI' banner]│  ├──────────────────────────────────────────────────────────────────┤  │

    C -->|Yes| E[Open WebSocket connection]│  │  Capacitor SecureStorage (Encrypted)                             │  │

    E --> F[Send current journal content to AI]│  │  ┌──────────────────────────────────────────┐                   │  │

    F --> G[AI analyzes text + slide context]│  │  │  keycloak_tokens                          │                   │  │

    G --> H[Generate ONE follow-up question]│  │  │  { access_token, refresh_token,           │                   │  │

    H --> I[Return via WebSocket]│  │  │    expires_at, refresh_expires_at }       │                   │  │

    I --> J[Display inline gray text in editor]│  │  └──────────────────────────────────────────┘                   │  │

    J --> K[User continues typing]│  ├──────────────────────────────────────────────────────────────────┤  │

    K --> L[Save journal to SQLite]│  │  Capacitor Preferences (Key-Value)                               │  │

    L --> M[Save AI interaction to ai_guider_chatlog]│  │  - theme, language, last_sync_at                                 │  │

    M --> N[Mark both records needs_sync=1]│  └──────────────────────────────────────────────────────────────────┘  │

```└─────────────────────────────────────────────────────────────────────────┘

                                    ↓ ↑

**Steps:**                    ┌───────────────────────────────┐

1. User types journal entry in TipTap editor                    │  Network Boundary (Requires   │

2. User clicks "Go Deeper" button (appears after ~50 characters)                    │  Valid Keycloak Token)        │

3. Frontend checks `AuthService.canSync()`:                    └───────────────────────────────┘

   - If false → Show "Sign in to use AI features" banner                                    ↓ ↑

   - If true → Proceed┌─────────────────────────────────────────────────────────────────────────┐

4. Open WebSocket: `ws://localhost:8000/ws/{user_uuid}`│                       CLOUD SERVICES (Online Only)                       │

5. Send message:├─────────────────────────────────────────────────────────────────────────┤

   ```json│                                                                          │

   {│  ┌──────────────────────┐  ┌──────────────────────┐                    │

     "type": "go_deeper_request",│  │   Keycloak (Auth)    │  │   Core API (Golang)  │                    │

     "content": "User's current journal text...",│  │                      │  │                      │                    │

     "slide_context": "What emotions are you feeling right now?"│  │ - OAuth 2.0 / OIDC   │  │  REST Endpoints:     │                    │

   }│  │ - Access Token       │  │  GET /v1/collections │                    │

   ```│  │   (5 min TTL)        │  │  GET /v1/journals    │                    │

6. AI Service (Python):│  │ - Refresh Token      │  │  POST /v1/journal    │                    │

   - Retrieves recent journal entries from Qdrant for context│  │   (30 day TTL)       │  │  PUT /v1/journal     │                    │

   - Uses LangChain + GPT-4-mini│  │ - /token endpoint    │  │  DELETE /v1/journal  │                    │

   - System prompt: "Generate ONE thoughtful follow-up question..."│  │   for refresh        │  │                      │                    │

7. AI returns single question via WebSocket│  └──────────────────────┘  └──────────────────────┘                    │

8. Frontend displays question as gray text below cursor│           ↓                          ↓                                  │

9. User continues typing (can incorporate AI question or ignore)│           ↓                          ↓                                  │

10. On save:│  ┌──────────────────────┐  ┌──────────────────────┐                    │

    - Journal entry → `user_journals` table│  │  PostgreSQL (Cloud)  │  │   AI Service (Python)│                    │

    - AI interaction → `ai_guider_chatlog` table│  │                      │  │      FastAPI         │                    │

    - Both marked `needs_sync=1`│  │ - user_journals      │  │                      │                    │

│  │ - ai_guider_chatlog  │  │ WebSocket Endpoint:  │                    │

**Expected Outcome:** User gets AI assistance inline, no chat UI, stored for analysis│  │ - collections        │  │ ws://.../ws/{uuid}   │                    │

│  │ - slide_groups       │  │ (Single request/     │                    │

---│  │ - user_streaks       │  │  response per click) │                    │

│  │                      │  │                      │                    │

### Flow 3: Offline Journaling (No Internet)│  └──────────────────────┘  │ - LangChain          │                    │

│           ↑                 │ - OpenAI GPT-4-mini  │                    │

```mermaid│           │                 │ - Qdrant integration │                    │

graph TD│           │                 └──────────────────────┘                    │

    A[User opens app offline] --> B[Load Collections from SQLite cache]│           │                          ↓                                  │

    B --> C[User creates journal entry]│           │                 ┌──────────────────────┐                    │

    C --> D[Save to SQLite immediately]│  ┌──────────────────────┐  │   Qdrant Vector DB   │                    │

    D --> E[Journal appears in list]│  │   RabbitMQ Queues    │  │                      │                    │

    E --> F[Badge shows '⏱️ Not synced']│  │                      │  │ - journal_entries    │                    │

    F --> G[User continues journaling]│  │ - ai_tasks           │  │ - chatlog_history    │                    │

    G --> H[30 days pass offline]│  │ - sync_data          │  │                      │                    │

    H --> I{User tries AI 'Go Deeper'?}│  │   (Go consumer       │  │ Semantic search for  │                    │

    I -->|Yes| J[Show 'Go online for AI' message]│  │    processes sync)   │  │ AI context retrieval │                    │

    I -->|No| K[Continue offline journaling]│  └──────────────────────┘  └──────────────────────┘                    │

    K --> L[User connects to WiFi]│                                                                          │

    L --> M{Refresh token expired?}└─────────────────────────────────────────────────────────────────────────┘

    M -->|Yes 30+ days| N[Show 'Sign in to sync' banner]```

    M -->|No| O[AuthService silent refresh]

    O --> P[SyncService processes queue]### Architecture Principles

    P --> Q[Upload all journals with needs_sync=1]

    Q --> R[Remove '⏱️ Not synced' badges]#### 1. Offline-First Data Flow

``````mermaid

┌─────────────────────────────────────────────────────┐

**Steps:**│              USER ACTIONS (Always Work)             │

1. User opens app with no internet├─────────────────────────────────────────────────────┤

2. Collections already cached in SQLite → Load instantly│  Create Journal  →  SQLite  →  ✅ Instant Save      │

3. User creates journal entries normally│  Edit Journal    →  SQLite  →  ✅ Instant Update    │

4. All saves go to SQLite only│  Read Journals   →  SQLite  →  ✅ Instant Load      │

5. UI shows "⏱️ Not synced" badge on journal cards│  View Collection →  SQLite  →  ✅ Cached Data       │

6. **AI "Go Deeper" disabled** (requires online)│                                                     │

7. User can journal for 30+ days offline (refresh token TTL)│  NO NETWORK REQUIRED ✅                             │

8. When user connects to WiFi:│  NO AUTH TOKEN REQUIRED ✅                          │

   - App resume event triggers token check└─────────────────────────────────────────────────────┘

   - If refresh token valid → Silent refresh access token                         ↓

   - SyncService starts processing sync queue            (When network available)

9. Upload journals sequentially to backend                         ↓

10. On success → Remove badges, update UI┌─────────────────────────────────────────────────────┐

11. If refresh token expired → Show banner "Sign in to sync your 127 entries"│            BACKGROUND SYNC (Transparent)            │

├─────────────────────────────────────────────────────┤

**Expected Outcome:** User never blocked from journaling, data synced when possible│  1. AuthService checks token validity               │

│  2. If expired → Silent refresh via Keycloak       │

---│  3. If refresh fails → Show "Sign in" banner       │

│  4. If token valid → Process sync queue            │

## 🔄 Data Flow│  5. Upload journals to PostgreSQL via API          │

│  6. Mark needs_sync = 0 in SQLite                  │

### Architecture Overview│                                                     │

│  USER NEVER SEES "SYNCING..." 🎯                    │

```└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐```

│              FRONTEND (Offline-First)               │

├─────────────────────────────────────────────────────┤#### 2. Token Management Flow

│  UI Components → Pinia Stores → Services           │```mermaid

│       ↓              ↓               ↓              │┌────────────────────────────────────────────────────────┐

│  SQLite (Source of Truth) + SecureStorage          ││             AuthService (Singleton)                    │

│       - user_journals (needs_sync flag)             │├────────────────────────────────────────────────────────┤

│       - ai_guider_chatlog (needs_sync flag)         ││                                                        │

│       - collections (cached)                        ││  Every 4 minutes (background):                        │

│       - sync_queue (pending operations)             ││  ┌──────────────────────────────────────────────┐    │

└─────────────────────────────────────────────────────┘│  │ 1. Check access_token.expires_at              │    │

                       ↓ ↑ (When Online + Token Valid)│  │ 2. If <30s remaining → Call Keycloak /token  │    │

┌─────────────────────────────────────────────────────┐│  │ 3. Use refresh_token to get new access       │    │

│              CLOUD SERVICES                         ││  │ 4. Save to SecureStorage (encrypted)         │    │

├─────────────────────────────────────────────────────┤│  │ 5. Update TranquaraSDK config                │    │

│  Go API → PostgreSQL (same schema as SQLite)       ││  └──────────────────────────────────────────────┘    │

│       ↓                                             ││                                                        │

│  Python AI Service → Qdrant Vector DB              ││  On app resume (mobile):                              │

│       ↓                                             ││  ┌──────────────────────────────────────────────┐    │

│  RabbitMQ (ai_tasks, sync_data queues)             ││  │ 1. Immediate token validity check             │    │

└─────────────────────────────────────────────────────┘│  │ 2. Refresh if needed                          │    │

```│  │ 3. Trigger sync queue if online               │    │

│  └──────────────────────────────────────────────┘    │

### Detailed Data Flow│                                                        │

│  When both tokens expired (>30 days):                 │

#### Scenario 1: Create Journal Entry (Offline)│  ┌──────────────────────────────────────────────┐    │

```│  │ 1. Set canSync() = false                      │    │

1. User fills out slides in Collection│  │ 2. Emit "sync-status" event                   │    │

       ↓│  │ 3. UI shows "Sign in to sync" banner          │    │

2. Pinia store: userJournalStore.createJournal()│  │ 4. User can still journal offline ✅          │    │

       ↓│  │ 5. AI chat blocked until re-login             │    │

3. SQLiteService.execute(INSERT INTO user_journals ...)│  └──────────────────────────────────────────────┘    │

       ↓│                                                        │

4. Local journal object:└────────────────────────────────────────────────────────┘

   {```

     id: 'uuid-local',

     content: { type: 'doc', content: [...] },  // TipTap JSON#### 3. AI "Go Deeper" Integration (Online Only - No Chat UI)

     content_html: '<p>Rendered HTML...</p>',```

     mood_score: 7,User clicks "Go Deeper" button in JournalPrompt.vue

     needs_sync: 1,         ↓

     created_at: '2025-11-29T10:00:00Z',AuthService.getValidAccessToken()

     synced_at: null         ↓

   }    ┌────────┴────────┐

       ↓    │                 │

5. Update Pinia state → journals array (UI updates instantly)Token Valid      Token Expired

       ↓    │                 │

6. Show "⏱️ Not synced" badge    ↓                 ↓

       ↓Connect WS      Try refresh

7. Background: SyncService wakes up every 30s         ↓             ↓

       ↓Send current    ┌────────┴────────┐

8. Check AuthService.canSync():journal text    │                 │

   - isOnline() → true    │           Success      Failed

   - hasValidToken() → true    ↓           │                 │

       ↓AI generates    ↓                 ↓

9. Query: SELECT * FROM user_journals WHERE needs_sync=1follow-up   Connect WS       Show "Sign in

       ↓question        ↓          for AI assistance"

10. For each journal:    │      Send current

    POST /v1/journal {content, mood_score, collection_id, ...}    ↓      journal text

       ↓Display AI         ↓

11. Backend responds: {journal: {id: 'uuid-cloud', ...}}response as   AI generates

       ↓gray text     follow-up

12. Update local SQLite:inline            ↓

    UPDATE user_journals     ↓        Display AI

    SET id='uuid-cloud', needs_sync=0, synced_at=NOW()Save to       response as

    WHERE id='uuid-local'SQLite        gray text

       ↓    ↓              ↓

13. Remove badge from UIMark          Save to

```needs_sync    SQLite

                   ↓

#### Scenario 2: AI "Go Deeper" Request (Online)              Mark

```              needs_sync

1. User clicks "Go Deeper" in JournalPrompt.vue

       ↓NOTE: This is NOT a chat interface

2. Check AuthService.getValidAccessToken()- Single request/response per button click

       ↓- AI response shown inline in journal editor

3. If token expired → Silent refresh via Keycloak- No chat history UI

       ↓- Full chat interface deferred to v1.1

4. Open WebSocket: ws://ai-service:8000/ws/{user_uuid}```

       ↓

5. Send message:---

   {

     type: 'go_deeper',## 📊 Data Models & Storage

     journal_content: 'User text...',

     slide_prompt: 'How are you feeling today?'### Storage Strategy Decision Matrix

   }

       ↓| Data Type | Storage Method | Reason |

6. AI Service (Python):|-----------|---------------|--------|

   - Query Qdrant for recent journal vectors| **Journal Entries** | SQLite (`@capacitor-community/sqlite`) | Large data (>1MB), complex queries, high read/write |

   - Build context from last 5 entries| **AI Chat Logs** | SQLite | Linked to journals, needs relational queries |

   - LangChain prompt:| **Collections/Slides** | SQLite (cached from API) | Offline access, searchable content |

     System: "Generate ONE follow-up question..."| **Sync Queue** | SQLite | Track pending changes for background sync |

     User: "{journal_content}"| **User Settings** | Capacitor Preferences | Simple key-value (<1KB), infrequent updates |

     Context: "{recent_journals}"| **Auth Tokens** | Capacitor SecureStorage | Sensitive data, encrypted keychain/keystore |

       ↓| **PIN/Biometric** | Capacitor SecureStorage | Security-critical data |

7. GPT-4-mini generates question

       ↓### Local SQLite Schema

8. Send back via WebSocket:

   {#### `user_journals` (Local)

     type: 'go_deeper_response',```sql

     question: 'What specific situation made you feel that way?'CREATE TABLE user_journals (

   }    id TEXT PRIMARY KEY,              -- UUID

       ↓    user_id TEXT NOT NULL,            -- From Keycloak

9. Frontend receives → Display inline gray text    collection_id TEXT,               -- FK to slide_groups.id (renamed from template_id)

       ↓    title TEXT,

10. User continues typing (incorporates or ignores)    content TEXT NOT NULL,            -- JSON structure with HTML preview

       ↓    content_html TEXT,                -- Rendered HTML for display

11. On save → Write to both tables:    mood_score INTEGER,               -- 1-10 numeric scale

    - user_journals (journal content)    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    - ai_guider_chatlog (AI interaction log)    updated_at TIMESTAMP,

       ↓    needs_sync INTEGER DEFAULT 1,    -- Flag for cloud sync

12. Both marked needs_sync=1    synced_at TIMESTAMP

       ↓);

13. Background sync uploads both records

```CREATE INDEX idx_user_journals_user_id ON user_journals(user_id);

CREATE INDEX idx_user_journals_created_at ON user_journals(created_at DESC);

#### Scenario 3: Token Refresh Before SyncCREATE INDEX idx_user_journals_needs_sync ON user_journals(needs_sync) WHERE needs_sync = 1;

``````

1. User opens app after 4 days offline

       ↓#### `ai_guider_chatlog` (Local)

2. App resume event → plugins/auth.client.ts```sql

       ↓CREATE TABLE ai_guider_chatlog (

3. AuthService.loadStoredTokens()    id TEXT PRIMARY KEY,              -- UUID

       ↓    journal_id TEXT NOT NULL,         -- FK to user_journals.id

4. Check access_token.expires_at    user_id TEXT NOT NULL,

       ↓    sender_type TEXT CHECK(sender_type IN ('user', 'bot')),

5. If expired → Call Keycloak /token:    message TEXT NOT NULL,            -- JSON for user, plain text for bot

   {    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

     grant_type: 'refresh_token',    needs_sync INTEGER DEFAULT 1,

     refresh_token: '...',    FOREIGN KEY(journal_id) REFERENCES user_journals(id) ON DELETE CASCADE

     client_id: 'tranquara_auth_client');

   }

       ↓CREATE INDEX idx_chatlog_journal_id ON ai_guider_chatlog(journal_id);

6. Keycloak validates refresh_token (still <30 days)CREATE INDEX idx_chatlog_created_at ON ai_guider_chatlog(created_at);

       ↓```

7. Returns new access_token (5-min TTL)

       ↓#### `collections` (Local Cache)

8. Update SecureStorage with new token```sql

       ↓CREATE TABLE collections (

9. SyncService.canSync() now returns true    id TEXT PRIMARY KEY,

       ↓    title TEXT NOT NULL,

10. Process sync queue (upload journals)    category TEXT NOT NULL,

       ↓    description TEXT,

11. User sees "⏱️ Not synced" badges disappear    type TEXT CHECK(type IN ('learn', 'prepare')),

```    thumbnail_url TEXT,

    position INTEGER,

---    created_at TIMESTAMP,

    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

## 📊 Data Models);

```

### Storage Strategy

#### `slide_groups` (Local Cache)

| Data Type | Storage Method | Reason |```sql

|-----------|---------------|--------|CREATE TABLE slide_groups (

| **Journal Entries** | SQLite + PostgreSQL | Large data, complex queries, offline access, high read/write |    id TEXT PRIMARY KEY,

| **AI Chat Logs** | SQLite + PostgreSQL | Linked to journals, needs relational queries |    collection_id TEXT NOT NULL,

| **Collections/Slides** | SQLite (cached from API) | Offline access, searchable content |    title TEXT NOT NULL,

| **Sync Queue** | SQLite | Track pending changes for background sync |    description TEXT,

| **Auth Tokens** | SecureStorage | Sensitive, encrypted keychain/keystore |    content TEXT NOT NULL,            -- JSON array of slide objects

| **User Settings** | Preferences | Simple key-value (<1KB) |    position INTEGER,

    estimated_duration INTEGER,

---    created_at TIMESTAMP,

    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

### Database Schema    FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE

);

#### user_journals (Local SQLite + Cloud PostgreSQL)```



```sql#### `sync_queue` (Local)

CREATE TABLE user_journals (```sql

    id TEXT PRIMARY KEY,CREATE TABLE sync_queue (

    user_id TEXT NOT NULL,    id INTEGER PRIMARY KEY AUTOINCREMENT,

    collection_id TEXT,  -- Was template_id (renamed)    entity_type TEXT NOT NULL,        -- 'journal', 'chatlog', etc.

    slide_group_id TEXT,    entity_id TEXT NOT NULL,

    content JSONB,  -- TipTap JSON format    operation TEXT CHECK(operation IN ('create', 'update', 'delete')),

    content_html TEXT,  -- Rendered HTML for previews    payload TEXT NOT NULL,            -- JSON of the entity

    mood_score INTEGER,  -- 1-10 scale (was VARCHAR mood)    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    needs_sync INTEGER DEFAULT 1,  -- Local only    retry_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    last_error TEXT

    updated_at TIMESTAMP,);

    synced_at TIMESTAMP  -- Local only```

);

### Backend PostgreSQL Schema (Cloud Sync)

CREATE INDEX idx_user_journals_user_id ON user_journals(user_id);

CREATE INDEX idx_user_journals_created_at ON user_journals(created_at DESC);#### `user_journals` (PostgreSQL)

CREATE INDEX idx_user_journals_needs_sync ON user_journals(needs_sync) WHERE needs_sync = 1;```sql

CREATE INDEX idx_user_journals_mood_score ON user_journals(mood_score);CREATE TABLE user_journals (

```    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID NOT NULL,            -- From Keycloak token

**Key Changes from Original:**    collection_id UUID,               -- FK to slide_groups.id (renamed from template_id)

- ✅ `template_id` → `collection_id` (terminology fix)    title VARCHAR(255),

- ✅ `mood VARCHAR(50)` → `mood_score INTEGER` (analytics-friendly)    content JSONB NOT NULL,           -- JSON structure

- ✅ `content TEXT` → `content JSONB` (structured data)    content_html TEXT,                -- Rendered HTML

- ✅ Added `content_html TEXT` (preview field)    mood_score INTEGER,               -- 1-10 numeric scale

- ✅ Added `needs_sync` + `synced_at` (offline-first)    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP

---);



#### ai_guider_chatlog (Local SQLite + Cloud PostgreSQL)CREATE INDEX idx_user_journals_user_id ON user_journals(user_id);

CREATE INDEX idx_user_journals_created_at ON user_journals(created_at DESC);

```sqlCREATE INDEX idx_user_journals_mood_score ON user_journals(mood_score);

CREATE TABLE ai_guider_chatlog (```

    id TEXT PRIMARY KEY,

    journal_id TEXT NOT NULL,#### `ai_guider_chatlog` (PostgreSQL)

    user_message TEXT,  -- User's journal content```sql

    ai_response TEXT,   -- AI follow-up questionCREATE TABLE ai_guider_chatlog (

    slide_context TEXT,  -- Which prompt triggered this    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    needs_sync INTEGER DEFAULT 1,  -- Local only    journal_id UUID NOT NULL,         -- FK to user_journals.id

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    user_id UUID NOT NULL,

    synced_at TIMESTAMP,  -- Local only    sender_type VARCHAR(10) CHECK(sender_type IN ('user', 'bot')),

    FOREIGN KEY(journal_id) REFERENCES user_journals(id) ON DELETE CASCADE    message TEXT NOT NULL,

);    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(journal_id) REFERENCES user_journals(id) ON DELETE CASCADE

CREATE INDEX idx_chatlog_journal_id ON ai_guider_chatlog(journal_id););

CREATE INDEX idx_chatlog_created_at ON ai_guider_chatlog(created_at);

CREATE INDEX idx_chatlog_needs_sync ON ai_guider_chatlog(needs_sync) WHERE needs_sync = 1;CREATE INDEX idx_chatlog_journal_id ON ai_guider_chatlog(journal_id);

``````



---### Slide Content Schema (JSONB)



#### collections (Local SQLite Cache)Slides are stored in `slide_groups.content` as JSON array:



```sql```json

CREATE TABLE collections ({

    id TEXT PRIMARY KEY,  "content": [

    title TEXT NOT NULL,    {

    description TEXT,      "type": "emotion_log",

    cover_image TEXT,      "value": 7

    tags TEXT[],  -- Array of tags    },

    difficulty TEXT,  -- 'beginner', 'intermediate', 'advanced'    {

    estimated_time INTEGER,  -- Minutes      "type": "sleep_check",

    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      "value": 7.5

);    },

```    {

      "type": "journal_prompt",

---      "question_content": "What's on my mind this morning?",

      "question_description": "Take a moment to reflect...",

#### slide_groups (Local SQLite Cache)      "response": "<p>Today I woke up feeling grateful...</p>"

    },

```sql    {

CREATE TABLE slide_groups (      "type": "doc",

    id TEXT PRIMARY KEY,      "header": "Benefits of Journaling",

    collection_id TEXT NOT NULL,      "body": "<p>Journaling helps...</p>"

    order_index INTEGER,    },

    title TEXT,    {

    content JSONB,  -- Array of slide objects      "type": "cta",

    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      "cta_component": "TherapyBookingCTA",

    FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE      "component_prop": {}

);    },

```    {

      "type": "further_reading",

**Slide Content Schema (JSONB):**      "contents": [

```json        {

{          "type": "article",

  "content": [          "title": "The Science of Journaling",

    {          "link": "https://example.com/article"

      "type": "emotion_log",        }

      "title": "How are you feeling?",      ]

      "config": {"min": 1, "max": 10, "labels": ["😢", "😐", "😊"]}    }

    },  ]

    {}

      "type": "journal_prompt",```

      "title": "What's on your mind?",

      "prompt": "Describe your day...",### Journal Content Storage Format

      "ai_enabled": true

    },**Verified Decision:** JSON with HTML preview field

    {

      "type": "sleep_check",```json

      "title": "How did you sleep?",{

      "config": {"min": 0, "max": 12}  "content": {

    }    "slides": [

  ]      {

}        "type": "emotion_log",

```        "mood_score": 7,

        "timestamp": "2025-11-28T10:30:00Z"

---      },

      {

#### sync_queue (Local SQLite Only)        "type": "journal_prompt",

        "question": "What's on my mind?",

```sql        "response_text": "I felt anxious today...",

CREATE TABLE sync_queue (        "response_html": "<p>I felt <strong>anxious</strong> today...</p>",

    id INTEGER PRIMARY KEY AUTOINCREMENT,        "ai_interactions": [

    table_name TEXT NOT NULL,  -- 'user_journals', 'ai_guider_chatlog'          {

    record_id TEXT NOT NULL,            "user_message": "I felt anxious today",

    operation TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'            "ai_response": "What triggered your anxiety?",

    retry_count INTEGER DEFAULT 0,            "timestamp": "2025-11-28T10:32:00Z"

    last_attempt TIMESTAMP,          }

    last_error TEXT,        ]

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      }

);    ],

```    "metadata": {

      "collection_id": "uuid",

---      "started_at": "2025-11-28T10:30:00Z",

      "completed_at": "2025-11-28T10:45:00Z",

### TypeScript Types      "duration_seconds": 900

    }

```typescript  },

// Journal entry  "content_html": "<div>Rendered preview for list view...</div>"

interface Journal {}

  id: string;```

  user_id: string;

  collection_id: string;---

  slide_group_id: string;

  content: Record<string, any>;  // TipTap JSON## 🔄 Current Implementation Status

  content_html: string;  // Rendered HTML

  mood_score: number;  // 1-10### ✅ Implemented Features

  needs_sync?: boolean;

  created_at: string;#### Frontend

  updated_at?: string;- ✅ Pinia store: `userJournalStore` in `stores/stores/user_journal.ts`

  synced_at?: string;- ✅ SDK methods: `UserJournals` class in `stores/user_journal/index.ts`

}  - `getAllTemplates()`, `getJournalById()`, `getJournals()`

  - `createJournal()`, `updateJournal()`, `deleteJournal()`

// Collection- ✅ TypeScript types in `types/user_journal.ts`

interface Collection {- ✅ Composable: `useSlideGroup()` for navigation

  id: string;- ✅ Components:

  title: string;  - `Journal/ModalContents.vue` - Slide carousel container

  description: string;  - `Slide/JournalPrompt.vue` - Text input slide

  cover_image: string;  - `Slide/SleepCheck.vue` - Sleep hours slider

  tags: string[];  - `Common/JournalTextArea.vue` - Text editor

  difficulty: 'beginner' | 'intermediate' | 'advanced';- ✅ Pages: `/learn_and_prepare/collection/[id]/[slideGroupId].vue`

  estimated_time: number;  // Minutes- ✅ WebSocket client: `stores/websocket_client.ts`

}- ✅ Chatlog store: `stores/stores/chatlog.ts`



// Slide types#### Backend (Go - Core Service)

type SlideType = 'emotion_log' | 'sleep_check' | 'journal_prompt' | 'doc' | 'cta' | 'further_reading';- ✅ Data models in `internal/data/user_journal.go`

- ✅ CRUD operations: Get, GetList, Insert, Update, Delete

interface Slide {- ✅ API handlers in `cmd/api/user_journal.go`

  type: SlideType;- ✅ Routes:

  title: string;  - `GET /v1/journal?id={id}`

  prompt?: string;  // For journal_prompt  - `GET /v1/journals`

  config?: Record<string, any>;  // Type-specific config  - `POST /v1/journal`

  ai_enabled?: boolean;  // journal_prompt only  - `PUT /v1/journal`

}  - `DELETE /v1/journal?id={id}`

- ✅ Chatlog API: `GET /v1/guider-chatlog?journal_id={id}`

interface SlideGroup {

  id: string;#### Backend (Python - AI Service)

  collection_id: string;- ✅ WebSocket endpoint: `/ws/{user_uuid}`

  order_index: number;- ✅ AI processor with LangChain (`service/ai_service_processor.py`)

  title: string;- ✅ Qdrant vector store integration

  content: Slide[];- ✅ RabbitMQ consumer for async tasks

}- ✅ Chat history summarization (after 3+ messages)

- ✅ System prompt generation with template context

// AI interaction

interface AIChat {### ⚠️ Missing/Incomplete Features

  id: string;

  journal_id: string;#### Critical Missing

  user_message: string;- ❌ **SQLite local database** - Not initialized (CRITICAL for offline-first)

  ai_response: string;- ❌ **Sync queue mechanism** - No background sync implementation

  slide_context: string;- ❌ **Collections/Slide Groups API** - Backend endpoints missing

  needs_sync?: boolean;- ❌ **Emotion log slide component** - Not implemented

  created_at: string;- ❌ **Speech input** - Voice-to-text not integrated

  synced_at?: string;- ❌ **Streak tracking** - No daily streak logic

}- ❌ **Draft/Resume functionality** - Incomplete sessions not saved

- ❌ **"Go Deeper" AI button** - Not implemented in UI

// API requests

interface CreateJournalRequest {#### Partially Implemented

  collection_id: string;- ⚠️ **Auto-save** - Logic exists but not connected to SQLite

  slide_group_id: string;- ⚠️ **Slide navigation** - Carousel works but no progress tracking

  content: Record<string, any>;- ⚠️ **WebSocket integration** - Client exists but not connected to UI

  content_html: string;- ⚠️ **Template data** - Using mock data (`mock/testCollection`), not API

  mood_score: number;

}#### Future Enhancements

- ⏸️ Journal export (PDF, text)

interface UpdateJournalRequest {- ⏸️ Advanced emotion analysis

  id: string;- ⏸️ Journal search/filtering

  content?: Record<string, any>;- ⏸️ Reminders/notifications

  content_html?: string;

  mood_score?: number;---

}

```## ✅ Verified Design Decisions



---### Decision Matrix



## 🛠️ Implementation Steps| # | Question | Verified Decision | Impact |

|---|----------|------------------|--------|

### Phase 1: Database & Storage Setup (Week 1)| 1 | Collections vs Templates | Use **"Collections"** as standard term. Rename all "JournalTemplate" → "Collection" | 🔴 CRITICAL - Terminology standardization |

| 2 | Mood Field Schema | Use **numeric scale (1-10)** stored as `mood_score INTEGER` | 🟡 MEDIUM - Enables metrics analysis |

#### Step 1: Create PostgreSQL Migrations| 3 | Offline-First Priority | **CRITICAL** - Block v1.0 launch until offline works | 🔴 CRITICAL - Core UX promise |

| 4 | AI Chat Strategy | **"Go Deeper" button** for v1.0, full chat in v1.1 | 🟡 HIGH - Phased feature rollout |

```bash| 5 | Required Slide Types | **All types required** for v1.0 (including `emotion_log`) | 🟡 MEDIUM - Complete feature set |

cd tranquara_core_service/migrations| 6 | Content Storage Format | **JSON with HTML preview field** (`content` + `content_html`) | 🟡 MEDIUM - Data structure + display |

touch 000010_update_user_journals_schema.up.sql| 7 | Sync Conflict Resolution | **Last-write-wins** for v1.0 (simple strategy) | 🟢 LOW - Acceptable for MVP |

touch 000010_update_user_journals_schema.down.sql| 8 | Export Format | **JSON** for v1.0 (PDF/HTML in future) | 🟢 LOW - Iterative enhancement |

```| 9 | AI Model | **GPT-4-mini** (cost-effective, suitable for empathy) | 🟢 LOW - Performance vs cost balance |



**File: 000010_update_user_journals_schema.up.sql**### Architecture Changes Required

```sql

-- Rename template_id to collection_id#### 1. Rename Template → Collection

ALTER TABLE user_journals RENAME COLUMN template_id TO collection_id;**Files to Update:**

- `types/user_journal.ts` - Rename `JournalTemplate` → `Collection`

-- Update mood field- `stores/stores/user_journal.ts` - Update type references

ALTER TABLE user_journals DROP COLUMN mood;- `stores/user_journal/index.ts` - Rename `getAllTemplates()` → `getAllCollections()`

ALTER TABLE user_journals ADD COLUMN mood_score INTEGER;- Database migrations - Rename `template_id` → `collection_id`

- Backend Go models - Update field names

-- Update content to JSONB

ALTER TABLE user_journals ALTER COLUMN content TYPE JSONB USING content::jsonb;#### 2. Database Schema Updates

**PostgreSQL Migrations Needed:**

-- Add content_html field```sql

ALTER TABLE user_journals ADD COLUMN content_html TEXT;-- Migration: Rename template_id to collection_id

ALTER TABLE user_journals RENAME COLUMN template_id TO collection_id;

-- Add index for mood_score

CREATE INDEX idx_user_journals_mood_score ON user_journals(mood_score);-- Migration: Update mood field

```ALTER TABLE user_journals DROP COLUMN mood;

ALTER TABLE user_journals ADD COLUMN mood_score INTEGER;

**Run migration:**ALTER TABLE user_journals ADD COLUMN content_html TEXT;

```bashALTER TABLE user_journals ALTER COLUMN content TYPE JSONB USING content::jsonb;

cd tranquara_core_service

make migrate-upCREATE INDEX idx_user_journals_mood_score ON user_journals(mood_score);

``````



**Expected Result:** ✅ PostgreSQL schema updated**SQLite Schema Updates:**

```sql

----- Similar changes for local SQLite schema

-- Add mood_score INTEGER, content_html TEXT

#### Step 2: Install SQLite Plugin-- Rename template_id → collection_id

```

```bash

cd tranquara_frontend#### 3. Content Storage Refactoring

npm install @capacitor-community/sqlite**Current:** TipTap editor outputs HTML string  

npx cap sync**Target:** JSON structure with HTML preview

```

**Implementation Strategy:**

**Expected Result:** ✅ SQLite plugin installed1. Store TipTap content as JSON (native TipTap format)

2. Generate `content_html` from JSON for list/preview display

---3. Use TipTap JSON for editing (preserves formatting metadata)



#### Step 3: Create SQLite Service---



**File: `tranquara_frontend/services/sqlite_service.ts`**## ⚠️ Conflicts & Issues Identified

```typescript

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';### 1. Storage Strategy Inconsistency



class SQLiteService {**Documentation Says:**

  private static instance: SQLiteService;> "Offline-First Storage (SQLite via @capacitor-community/sqlite + PostgreSQL sync)"  

  private sqlite: SQLiteConnection;> "Heavy Data (Journals, Lessons): Local: SQLite"

  private db: SQLiteDBConnection | null = null;

  private dbName = 'tranquara.db';**Current Code:**

- No SQLite database initialization found

  private constructor() {- Using in-memory state (`userJournalStore().journals` array)

    this.sqlite = new SQLiteConnection(CapacitorSQLite);- Mock data in `mock/testCollection` instead of cached SQLite data

  }

**Impact:** 🔴 CRITICAL - Offline functionality completely missing

  static getInstance(): SQLiteService {

    if (!SQLiteService.instance) {---

      SQLiteService.instance = new SQLiteService();

    }### 2. Database Schema Mismatches

    return SQLiteService.instance;

  }#### Issue A: Mood Field Type Mismatch



  async initialize(): Promise<void> {**Documentation:** `mood_score FLOAT`  

    try {**Migration:** `mood VARCHAR(50)`  

      this.db = await this.sqlite.createConnection(**Verified Decision:** `mood_score INTEGER` (1-10 scale)

        this.dbName,

        false,**Resolution:** Create migration to update schema (see Verified Design Decisions section)

        'no-encryption',

        1,**Impact:** 🟡 MEDIUM - Resolved via verified decision

        false

      );#### Issue B: Missing Content HTML Field

      

      await this.db.open();**Current:** Single `content TEXT` field  

      await this.runMigrations();**Verified Decision:** Dual fields `content JSONB` + `content_html TEXT`

      

      console.log('SQLite initialized successfully');**Resolution:** Add `content_html` column in migration

    } catch (error) {

      console.error('SQLite initialization failed:', error);**Impact:** 🟡 MEDIUM - Resolved via verified decision

      throw error;

    }---

  }

### 3. Collections Architecture Inconsistency

  private async runMigrations(): Promise<void> {

    if (!this.db) throw new Error('Database not initialized');**Documentation:** "Collections" → "Slide Groups" → "Slides"  

**Current Code:** `JournalTemplate` type with different structure  

    const migrations = `**API Endpoint:** `/tempalte-gallary` (typo!)

      CREATE TABLE IF NOT EXISTS user_journals (

        id TEXT PRIMARY KEY,**Verified Decision:** Standardize on "Collections" terminology

        user_id TEXT NOT NULL,

        collection_id TEXT,**Resolution Required:**

        slide_group_id TEXT,1. Rename `JournalTemplate` → `Collection` in types

        content TEXT,2. Rename `getAllTemplates()` → `getAllCollections()` in SDK

        content_html TEXT,3. Fix API endpoint typo: `/template-gallery` → `/collections`

        mood_score INTEGER,4. Update database column: `template_id` → `collection_id`

        needs_sync INTEGER DEFAULT 1,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,**Impact:** 🔴 CRITICAL - Resolved via standardization plan

        updated_at TEXT,

        synced_at TEXT---

      );

      ### 4. AI Chat Integration Incomplete

      CREATE INDEX IF NOT EXISTS idx_user_journals_user_id ON user_journals(user_id);

      CREATE INDEX IF NOT EXISTS idx_user_journals_created_at ON user_journals(created_at);**Documentation:** "'Go Deeper' button for AI follow-up questions"  

      CREATE INDEX IF NOT EXISTS idx_user_journals_needs_sync ON user_journals(needs_sync);**Current Code:** WebSocket client exists but no UI integration



      CREATE TABLE IF NOT EXISTS ai_guider_chatlog (**Verified Decision:** "Go Deeper" button for v1.0 (minimal guided prompts)

        id TEXT PRIMARY KEY,

        journal_id TEXT NOT NULL,**Implementation Plan:**

        user_message TEXT,1. Add button to `JournalPrompt.vue` component

        ai_response TEXT,2. Connect to existing WebSocket client

        slide_context TEXT,3. Display AI responses inline (gray text)

        needs_sync INTEGER DEFAULT 1,4. Save interactions to `ai_guider_chatlog` table

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,5. Full chat interface deferred to v1.1

        synced_at TEXT,

        FOREIGN KEY(journal_id) REFERENCES user_journals(id) ON DELETE CASCADE**Impact:** 🟡 MEDIUM - Clear implementation path defined

      );

---

      CREATE INDEX IF NOT EXISTS idx_chatlog_journal_id ON ai_guider_chatlog(journal_id);

      CREATE INDEX IF NOT EXISTS idx_chatlog_needs_sync ON ai_guider_chatlog(needs_sync);### 5. RabbitMQ Sync Strategy Unclear



      CREATE TABLE IF NOT EXISTS collections (**Documentation:**

        id TEXT PRIMARY KEY,> "RabbitMQ for async sync operations"  

        title TEXT NOT NULL,> "sync_data queue handles background sync when online"

        description TEXT,

        cover_image TEXT,**Current Code:**

        tags TEXT,- Python AI service publishes to `sync_data` queue

        difficulty TEXT,- Golang service has RabbitMQ setup (`internal/pubsub/`)

        estimated_time INTEGER,- BUT: No consumer in Go service to process `sync_data` messages

        cached_at TEXT DEFAULT CURRENT_TIMESTAMP- No SQLite → PostgreSQL sync logic found

      );

**Impact:** 🟡 MEDIUM - Cloud sync won't work

      CREATE TABLE IF NOT EXISTS slide_groups (

        id TEXT PRIMARY KEY,---

        collection_id TEXT NOT NULL,

        order_index INTEGER,### 6. Slide Types Implementation Gap

        title TEXT,

        content TEXT,**Required Slide Types (All mandatory for v1.0):**

        cached_at TEXT DEFAULT CURRENT_TIMESTAMP,1. `emotion_log` - ❌ Component NOT FOUND - **MUST IMPLEMENT**

        FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE2. `sleep_check` - ✅ Implemented

      );3. `journal_prompt` - ✅ Implemented

4. `doc` - ✅ Implemented

      CREATE TABLE IF NOT EXISTS sync_queue (5. `cta` - ✅ Implemented

        id INTEGER PRIMARY KEY AUTOINCREMENT,6. `further_reading` - ✅ Implemented

        table_name TEXT NOT NULL,

        record_id TEXT NOT NULL,**Action Required:** Create `Slide/EmotionLog.vue` component with 1-10 slider

        operation TEXT NOT NULL,

        retry_count INTEGER DEFAULT 0,**Impact:** 🟡 MEDIUM - One component remaining

        last_attempt TEXT,

        last_error TEXT,---

        created_at TEXT DEFAULT CURRENT_TIMESTAMP

      );### 7. Sync Conflict Resolution Strategy

    `;

**Verified Decision:** Last-write-wins for v1.0

    await this.db.execute(migrations);

  }**Scenario:** User edits same journal on phone and laptop offline, then syncs



  async query<T>(sql: string, params: any[] = []): Promise<T[]> {**Resolution:**

    if (!this.db) throw new Error('Database not initialized');```typescript

    // Conflict detection

    const result = await this.db.query(sql, params);if (local_journal.updated_at > cloud_journal.updated_at) {

    return result.values as T[];  // Local version is newer - push to cloud

  }  await syncToCloud(local_journal);

} else {

  async execute(sql: string, params: any[] = []): Promise<void> {  // Cloud version is newer - update local

    if (!this.db) throw new Error('Database not initialized');  await updateLocal(cloud_journal);

    }

    await this.db.run(sql, params);```

  }

**Trade-off:** Potential data loss if editing same entry on multiple devices  

  async executeBatch(statements: { statement: string; values: any[] }[]): Promise<void> {**Mitigation:** Show "last synced" timestamp in UI, warn if editing old entry

    if (!this.db) throw new Error('Database not initialized');

    **Impact:** 🟢 LOW - Simple, acceptable for MVP

    await this.db.executeSet(statements);

  }---

}

## 🗺️ Implementation Roadmap

export const sqliteService = SQLiteService.getInstance();

```### Phase 1: Foundation (Weeks 1-2) - CRITICAL PATH



**Expected Result:** ✅ SQLite service ready#### Week 1: Database & Collections API



---**Day 1-2: SQLite Database Setup**

- [ ] Install `@capacitor-community/sqlite` plugin

#### Step 4: Initialize SQLite on App Start- [ ] Install `@capacitor-community/secure-storage` plugin

- [ ] Create SQLite schema migration files

**File: `tranquara_frontend/plugins/sqlite.client.ts`**- [ ] Implement `SQLiteService` singleton (`services/sqlite_service.ts`)

```typescript- [ ] Create tables: `user_journals`, `ai_guider_chatlog`, `collections`, `slide_groups`, `sync_queue`

import { sqliteService } from '~/services/sqlite_service';- [ ] Add indexes for performance

- [ ] Test database CRUD operations

export default defineNuxtPlugin(async () => {

  try {**Day 3-4: Collections API (Backend)**

    await sqliteService.initialize();- [ ] Create PostgreSQL migration: Rename `template_id` → `collection_id`

    console.log('SQLite database ready');- [ ] Create PostgreSQL migration: Add `mood_score INTEGER`, `content_html TEXT`

  } catch (error) {- [ ] Update Go models in `internal/data/` (rename fields)

    console.error('Failed to initialize SQLite:', error);- [ ] Implement API endpoints:

  }  - `GET /v1/collections` - List all collections

});  - `GET /v1/collections/:id` - Get collection with slide groups

```  - `GET /v1/slide-groups/:id` - Get individual slide group

- [ ] Test API endpoints with Postman

**Expected Result:** ✅ SQLite initializes on app launch

**Day 5: Frontend Collections Integration**

---- [ ] Rename `JournalTemplate` → `Collection` in `types/user_journal.ts`

- [ ] Update `stores/user_journal/index.ts`: `getAllTemplates()` → `getAllCollections()`

### Phase 2: Collections API & Cache (Week 1-2)- [ ] Replace mock data in `mock/testCollection` with API calls

- [ ] Cache collections/slide groups in SQLite

#### Step 5: Backend Collections Endpoints- [ ] Implement offline fallback to cached data



**File: `tranquara_core_service/cmd/api/collections_handlers.go`**#### Week 2: Auth Service & Data Layer

```go

package main**Day 1-2: Token Management**

- [ ] Implement `AuthService` singleton (`services/auth_service.ts`)

import (- [ ] Implement token refresh logic

	"database/sql"- [ ] Create Nuxt plugin `plugins/auth.client.ts` for auto-refresh

	"net/http"- [ ] Test token refresh scenarios (expired access, expired refresh, offline)

)- [ ] Integrate with existing `KeycloakService`



type Collection struct {**Day 3-4: Offline-First Data Layer**

	ID            string   `json:"id"`- [ ] Update `userJournalStore` to use SQLite instead of in-memory array

	Title         string   `json:"title"`- [ ] Implement offline-first data fetching (SQLite first, API fallback)

	Description   string   `json:"description"`- [ ] Add `needs_sync` flag tracking

	CoverImage    string   `json:"cover_image"`- [ ] Update SDK methods to handle local + remote

	Tags          []string `json:"tags"`- [ ] Implement auto-save to SQLite on user input

	Difficulty    string   `json:"difficulty"`

	EstimatedTime int      `json:"estimated_time"`**Day 5: Sync Queue Manager**

}- [ ] Implement `SyncService` singleton (`services/sync_service.ts`)

- [ ] Create sync queue processing logic

type SlideGroup struct {- [ ] Add network state detection

	ID           string `json:"id"`- [ ] Implement retry logic with exponential backoff

	CollectionID string `json:"collection_id"`- [ ] Create `SyncStatusBanner.vue` component

	OrderIndex   int    `json:"order_index"`- [ ] Test offline → online sync flow

	Title        string `json:"title"`

	Content      string `json:"content"`  // JSON string**Deliverables (Phase 1):**

}- ✅ Working local SQLite database

- ✅ Collections API endpoints

func (app *application) listCollectionsHandler(w http.ResponseWriter, r *http.Request) {- ✅ Token management with auto-refresh

	query := `- ✅ Offline-capable journal store

		SELECT id, title, description, cover_image, tags, difficulty, estimated_time- ✅ Background sync queue

		FROM collections

		ORDER BY title ASC`---

	

	rows, err := app.DB.Query(query)### Phase 2: Core Features (Weeks 3-4)

	if err != nil {

		app.serverErrorResponse(w, r, err)#### Week 3: Slide Components & AI Integration

		return

	}**Day 1-2: Emotion Log Component**

	defer rows.Close()- [ ] Create `Slide/EmotionLog.vue` component

	- [ ] Implement 1-10 slider with visual feedback

	collections := []Collection{}- [ ] Save `mood_score` to journal entry

	for rows.Next() {- [ ] Add animation effects

		var c Collection- [ ] Update slide component mapping in `ModalContents.vue`

		var tags string

		err := rows.Scan(&c.ID, &c.Title, &c.Description, &c.CoverImage, &tags, &c.Difficulty, &c.EstimatedTime)**Day 3-5: AI "Go Deeper" Button (Single Follow-Up Only)**

		if err != nil {- [ ] Add "Go Deeper" button to `JournalPrompt.vue`

			app.serverErrorResponse(w, r, err)- [ ] Check token validity via `AuthService.getValidAccessToken()`

			return- [ ] Integrate with existing WebSocket client

		}- [ ] Send current journal content on button click

		// Parse tags (comma-separated string to array)- [ ] Receive ONE AI-generated follow-up question

		// c.Tags = strings.Split(tags, ",")- [ ] Display AI response inline as gray text (not chat bubble)

		collections = append(collections, c)- [ ] Allow user to incorporate or ignore suggestion

	}- [ ] Save interaction to `ai_guider_chatlog` SQLite table (backend tracking only)

	- [ ] Queue chatlog for cloud sync

	app.writeJSON(w, http.StatusOK, envelope{"collections": collections}, nil)- [ ] Handle offline scenario (show "Sign in for AI assistance" message)

}- [ ] **Note: NO chat UI - single request/response only**



func (app *application) getSlideGroupsHandler(w http.ResponseWriter, r *http.Request) {#### Week 4: Backend Sync & Draft Functionality

	collectionID := r.URL.Query().Get("collection_id")

	if collectionID == "" {**Day 1-3: RabbitMQ Sync Consumer (Backend)**

		app.badRequestResponse(w, r, errors.New("missing collection_id"))- [ ] Create RabbitMQ consumer in Go service (`internal/pubsub/sync_consumer.go`)

		return- [ ] Process `sync_data` queue messages

	}- [ ] Implement journal sync handler (create/update/delete)

	- [ ] Implement chatlog sync handler

	query := `- [ ] Handle conflict resolution (last-write-wins)

		SELECT id, collection_id, order_index, title, content- [ ] Add error handling and retry logic

		FROM slide_groups- [ ] Test end-to-end sync flow

		WHERE collection_id = $1

		ORDER BY order_index ASC`**Day 4-5: Draft & Resume Functionality**

	- [ ] Add `is_complete` field to SQLite `user_journals` table

	rows, err := app.DB.Query(query, collectionID)- [ ] Track slide completion progress

	if err != nil {- [ ] Implement "incomplete" journal state

		app.serverErrorResponse(w, r, err)- [ ] Add "Resume" functionality for unfinished sessions

		return- [ ] Display drafts in journal history

	}- [ ] Auto-save progress as user navigates slides

	defer rows.Close()

	**Deliverables (Phase 2):**

	slideGroups := []SlideGroup{}- ✅ All slide types implemented (including `emotion_log`)

	for rows.Next() {- ✅ "Go Deeper" button with single AI follow-up (NO chat interface)

		var sg SlideGroup- ✅ Automatic background sync (frontend + backend)

		err := rows.Scan(&sg.ID, &sg.CollectionID, &sg.OrderIndex, &sg.Title, &sg.Content)- ✅ Draft journal entries and resume capability

		if err != nil {

			app.serverErrorResponse(w, r, err)---

			return

		}### Phase 3: Enhancements (Week 5+)

		slideGroups = append(slideGroups, sg)

	}#### Full AI Chat Interface (Deferred from v1.0)

	- [ ] Create chat modal/sidebar UI

	app.writeJSON(w, http.StatusOK, envelope{"slide_groups": slideGroups}, nil)- [ ] Implement multi-turn conversation support

}- [ ] Display chat history to user

```- [ ] Add typing indicators

- [ ] Implement conversation threading

**Add routes in `cmd/api/routes.go`:**- [ ] Add chat export functionality

```go

router.HandlerFunc(http.MethodGet, "/v1/collections", app.listCollectionsHandler)#### Streak Tracking (2 days)

router.HandlerFunc(http.MethodGet, "/v1/slide-groups", app.getSlideGroupsHandler)- [ ] Implement daily streak calculation logic

```- [ ] Update `user_streaks` table on journal creation

- [ ] Display streak counter in UI

**Expected Result:** ✅ Collections API working- [ ] Add streak breaking detection

- [ ] Implement "longest streak" tracking

---

#### Speech Input (2-3 days)

#### Step 6: Frontend SDK Methods- [ ] Research Capacitor speech recognition plugin

- [ ] Add microphone button to `JournalPrompt.vue`

**File: `tranquara_frontend/stores/collections/index.ts`**- [ ] Implement tap-to-speak flow

```typescript- [ ] Handle transcription and text insertion

import { TranquaraSDK } from "../tranquara_sdk";- [ ] Add error handling for speech recognition failures

import type { Collection, SlideGroup } from "~/types/journal";

#### Journal Export (1-2 days)

export class Collections extends TranquaraSDK {- [ ] Implement JSON export functionality

  constructor() {- [ ] Add "Export" button to journal detail page

    super();- [ ] Generate downloadable JSON file

  }- [ ] (Future) PDF/HTML export



  async getAll(): Promise<Collection[]> {#### Metrics & Analytics (5-7 days)

    const response = await this.fetch<{ collections: Collection[] }>("GET", "/v1/collections");- [ ] Create PostgreSQL tables: `journal_metrics_daily`, `user_metrics`

    return response.collections;- [ ] Implement daily metrics calculation job (backend)

  }- [ ] Build emotion trend charts

- [ ] Add mood stability index

  async getSlideGroups(collectionId: string): Promise<SlideGroup[]> {- [ ] Create weekly/monthly summary views

    const response = await this.fetch<{ slide_groups: SlideGroup[] }>(

      "GET",**Deliverables (Phase 3):**

      `/v1/slide-groups?collection_id=${collectionId}`- ✅ Working streak system

    );- ✅ Voice-to-text journaling

    return response.slide_groups;- ✅ JSON export functionality

  }- ✅ Metrics dashboard (if time permits)

}

```---



**Expected Result:** ✅ SDK methods ready### Development Timeline Summary



---| Phase | Duration | Priority | Status |

|-------|----------|----------|--------|

#### Step 7: Cache Collections in SQLite| Phase 1: Foundation | 2 weeks | 🔴 CRITICAL | Not Started |

| Phase 2: Core Features | 2 weeks | 🟡 HIGH | Not Started |

**File: `tranquara_frontend/stores/stores/collections.ts`**| Phase 3: Enhancements | 1+ weeks | 🟢 MEDIUM | Not Started |

```typescript| **Total Estimated Time** | **5 weeks** | | |

import { defineStore } from 'pinia';

import { Collections } from '../collections';### Risk Mitigation

import { sqliteService } from '~/services/sqlite_service';

import type { Collection, SlideGroup } from '~/types/journal';**High-Risk Items:**

1. **SQLite Performance on iOS** - Risk: Slow queries on older devices

const collectionsSDK = new Collections();   - Mitigation: Implement indexes, test on iPhone 8+

   

export const useCollectionsStore = defineStore('collections', {2. **Token Refresh Timing** - Risk: Race conditions during API calls

  state: () => ({   - Mitigation: Refresh 30s before expiry, use mutex locks

    collections: [] as Collection[],

    loading: false,3. **Sync Conflicts** - Risk: Data loss with last-write-wins

    error: null as string | null,   - Mitigation: Show "last synced" timestamp, warn on edits

  }),

4. **WebSocket Stability** - Risk: Dropped AI chat connections

  actions: {   - Mitigation: Implement reconnection logic, queue messages

    async fetchCollections() {

      this.loading = true;---

      this.error = null;

## 🔌 API Integration

      try {

        // Try local cache first### REST API Endpoints

        const cached = await sqliteService.query<Collection>(

          'SELECT * FROM collections ORDER BY title ASC'#### Journal Endpoints (Implemented)

        );

```typescript

        if (cached.length > 0) {// Get single journal

          this.collections = cached;GET /v1/journal?id={journalId}

        }Authorization: Bearer {keycloak_token}



        // Fetch from API to update cacheResponse:

        try {{

          const cloudCollections = await collectionsSDK.getAll();  "id": "uuid",

            "user_id": "uuid",

          // Update SQLite cache  "template_id": "uuid",

          for (const collection of cloudCollections) {  "title": "Morning Reflection",

            await sqliteService.execute(  "content": "<p>Today I felt...</p>",

              `INSERT OR REPLACE INTO collections   "mood": "neutral",

               (id, title, description, cover_image, tags, difficulty, estimated_time, cached_at)  "created_at": "2025-11-27T10:30:00Z"

               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,}

              [

                collection.id,// Get all user journals

                collection.title,GET /v1/journals

                collection.description,Authorization: Bearer {keycloak_token}

                collection.cover_image,

                JSON.stringify(collection.tags),Response:

                collection.difficulty,{

                collection.estimated_time,  "user_journals": [...]

                new Date().toISOString(),}

              ]

            );// Create journal

          }POST /v1/journal

          Authorization: Bearer {keycloak_token}

          this.collections = cloudCollections;Content-Type: application/json

        } catch (apiError) {

          console.log('Using cached collections (offline)');Request:

        }{

      } catch (error) {  "template_id": "uuid",

        this.error = error instanceof Error ? error.message : 'Unknown error';  "title": "Evening Reflection",

      } finally {  "content": "<p>I accomplished...</p>",

        this.loading = false;  "mood": "happy"

      }}

    },

// Update journal

    async fetchSlideGroups(collectionId: string): Promise<SlideGroup[]> {PUT /v1/journal

      try {Authorization: Bearer {keycloak_token}

        // Try cache firstContent-Type: application/json

        const cached = await sqliteService.query<SlideGroup>(

          'SELECT * FROM slide_groups WHERE collection_id = ? ORDER BY order_index ASC',Request:

          [collectionId]{

        );  "id": "uuid",

  "title": "Updated Title",

        if (cached.length > 0) {  "content": "<p>Updated content...</p>",

          return cached.map(sg => ({  "mood": "calm"

            ...sg,}

            content: JSON.parse(sg.content as any),

          }));// Delete journal

        }DELETE /v1/journal?id={journalId}

Authorization: Bearer {keycloak_token}

        // Fetch from API```

        const cloudSlideGroups = await collectionsSDK.getSlideGroups(collectionId);

        #### Chatlog Endpoints (Implemented)

        // Update cache

        for (const sg of cloudSlideGroups) {```typescript

          await sqliteService.execute(// Get chat logs for journal

            `INSERT OR REPLACE INTO slide_groups GET /v1/guider-chatlog?journal_id={journalId}

             (id, collection_id, order_index, title, content, cached_at)Authorization: Bearer {keycloak_token}

             VALUES (?, ?, ?, ?, ?, ?)`,

            [Response:

              sg.id,{

              sg.collection_id,  "chat_logs": [

              sg.order_index,    {

              sg.title,      "sender_type": "user",

              JSON.stringify(sg.content),      "message": "{\"content\":\"I felt anxious today...\"}",

              new Date().toISOString(),      "created_at": "2025-11-27T10:35:00Z"

            ]    },

          );    {

        }      "sender_type": "bot",

              "message": "What triggered your anxiety?",

        return cloudSlideGroups;      "created_at": "2025-11-27T10:35:05Z"

      } catch (error) {    }

        console.error('Failed to fetch slide groups:', error);  ]

        throw error;}

      }```

    },

  },#### Collections/Templates Endpoints (MISSING - Need Implementation)

});

``````typescript

// Get all collections

**Expected Result:** ✅ Offline-first collections loadingGET /v1/collections

Authorization: Bearer {keycloak_token}

---

Expected Response:

### Phase 3: Journal Store with Offline-First (Week 2){

  "collections": [

#### Step 8: Refactor Journal Store    {

      "id": "uuid",

**File: `tranquara_frontend/stores/stores/user_journal.ts`**      "title": "Daily Reflection",

```typescript      "category": "self_care",

import { defineStore } from 'pinia';      "description": "Simple daily prompts...",

import { UserJournals } from '../user_journal';      "type": "learn",

import { sqliteService } from '~/services/sqlite_service';      "thumbnail_url": "https://...",

import type { Journal, CreateJournalRequest } from '~/types/user_journal';      "position": 1,

      "slide_groups": [...]

const journalsSDK = new UserJournals();    }

  ]

export const useUserJournalStore = defineStore('userJournal', {}

  state: () => ({

    journals: [] as Journal[],// Get collection with slide groups

    loading: false,GET /v1/collections/{id}

    error: null as string | null,Authorization: Bearer {keycloak_token}

  }),

// Get individual slide group

  actions: {GET /v1/slide-groups/{id}

    async fetchJournals() {Authorization: Bearer {keycloak_token}

      this.loading = true;```

      this.error = null;

### WebSocket Protocol (AI Chat)

      try {

        // Always load from SQLite first (offline-first)#### Connection

        const localJournals = await sqliteService.query<Journal>(

          'SELECT * FROM user_journals ORDER BY created_at DESC'```typescript

        );const ws = new WebSocket('ws://localhost:8000/ws/{user_uuid}');



        this.journals = localJournals.map(j => ({// Initial handshake message

          ...j,ws.send(JSON.stringify({

          content: JSON.parse(j.content as any),  template_data: {

          needs_sync: j.needs_sync === 1,    content: ["What's on my mind?"],

        }));    title: "Morning Reflection",

    category: "daily"

        // Try to sync with cloud (background)  },

        try {  user_info: {

          const cloudJournals = await journalsSDK.getJournals();    name: "John Doe",

              age_range: "25-34"

          // Update local database  }

          for (const journal of cloudJournals) {}));

            await this.saveToLocal(journal, false);```

          }

          #### Chat Messages

          // Reload from SQLite

          const updated = await sqliteService.query<Journal>(```typescript

            'SELECT * FROM user_journals ORDER BY created_at DESC'// User sends message

          );ws.send(JSON.stringify({

          this.journals = updated.map(j => ({  content: "I felt anxious today about my presentation",

            ...j,  journal_id: "journal-uuid-here",

            content: JSON.parse(j.content as any),  current_journal: "<p>Today I woke up feeling...</p>"

            needs_sync: j.needs_sync === 1,}));

          }));

        } catch (apiError) {// AI responds

          console.log('Using offline journals');ws.onmessage = (event) => {

        }  const data = JSON.parse(event.data);

      } catch (error) {  // data.content = "What specifically made you anxious?"

        this.error = error instanceof Error ? error.message : 'Unknown error';};

      } finally {```

        this.loading = false;

      }---

    },

## 🤖 AI "Go Deeper" Assistant (No Chat Interface)

    async createJournal(data: CreateJournalRequest) {

      try {### v1.0 Implementation: Single Follow-Up Questions Only

        const localId = crypto.randomUUID();

        const now = new Date().toISOString();**Design Decision:** No chat UI in v1.0 - only "Go Deeper" button for single AI prompts



        const localJournal: Journal = {**AI Service (`tranquara_ai_service/service/ai_service_processor.py`):**

          id: localId,- Uses OpenAI GPT-4-mini via LangChain

          user_id: 'current_user_id', // From auth store- Integrates with Qdrant for semantic context retrieval

          ...data,- Processes via LangGraph state machine

          content: data.content,- **Single request/response per button click** (not continuous chat)

          content_html: data.content_html,

          needs_sync: true,### "Go Deeper" Button Behavior

          created_at: now,

        };**User Flow:**

1. User writes journal entry in JournalPrompt.vue

        // Save to SQLite immediately2. User clicks "Go Deeper" button

        await this.saveToLocal(localJournal, true);3. WebSocket sends current journal content to AI service

        this.journals.unshift(localJournal);4. AI generates ONE follow-up question based on entry

5. AI response displayed as **gray text inline** in editor

        // Try to sync to backend6. User can incorporate suggestion or ignore it

        try {7. Interaction saved to `ai_guider_chatlog` (for context, not UI display)

          const cloudJournal = await journalsSDK.createJournal(data);

          **No Chat History UI in v1.0:**

          // Replace local ID with cloud ID- Each "Go Deeper" click is independent

          await sqliteService.execute(- AI has context from Qdrant (previous entries)

            'UPDATE user_journals SET id = ?, needs_sync = 0, synced_at = ? WHERE id = ?',- No conversation thread visible to user

            [cloudJournal.id, new Date().toISOString(), localId]- Full chat interface deferred to v1.1+

          );

          ### System Prompt Strategy

          const index = this.journals.findIndex(j => j.id === localId);

          if (index !== -1) {From `service/helper.py`:

            this.journals[index] = { ...cloudJournal, needs_sync: false };```python

          }def format_system_prompt(init_data: InitConnectData, context: str):

        } catch (apiError) {    return f"""

          console.log('Journal will sync when online');    You are an empathetic AI journaling assistant.

        }    

      } catch (error) {    Collection Topic: {init_data.template_data.title}

        this.error = error instanceof Error ? error.message : 'Unknown error';    Category: {init_data.template_data.category}

        throw error;    

      }    User Context:

    },    - Name: {init_data.user_info.name}

    - Age Range: {init_data.user_info.age_range}

    async saveToLocal(journal: Journal, needsSync: boolean) {    

      await sqliteService.execute(    Current Journal Content:

        `INSERT OR REPLACE INTO user_journals     {context}

         (id, user_id, collection_id, slide_group_id, content, content_html, mood_score, needs_sync, created_at, updated_at, synced_at)    

         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,    Guidelines:

        [    - Generate ONE thoughtful follow-up question

          journal.id,    - Listen, don't diagnose

          journal.user_id,    - Ask open-ended questions

          journal.collection_id,    - Validate feelings expressed

          journal.slide_group_id,    - Stay on topic

          JSON.stringify(journal.content),    - No clinical advice

          journal.content_html,    - Keep response concise (1-2 sentences)

          journal.mood_score,    """

          needsSync ? 1 : 0,```

          journal.created_at,

          journal.updated_at || null,### WebSocket Protocol (Single Request/Response)

          journal.synced_at || null,

        ]**Connection:**

      );```typescript

    },const ws = new WebSocket('ws://localhost:8000/ws/{user_uuid}');

  },

});// Initial handshake (once per session)

```ws.send(JSON.stringify({

  template_data: {

**Expected Result:** ✅ Offline-first journaling working    content: ["What's on my mind?"],

    title: "Morning Reflection",

---    category: "daily"

  },

### Phase 4: Sync Service (Week 2-3)  user_info: {

    name: "John Doe",

#### Step 9: Create Sync Service    age_range: "25-34"

  }

**File: `tranquara_frontend/services/sync_service.ts`**}));

```typescript```

import { sqliteService } from './sqlite_service';

import { authService } from './auth_service';  // Assuming you have this**"Go Deeper" Click:**

import { TranquaraSDK } from '~/stores/tranquara_sdk';```typescript

// User clicks button

class SyncService {ws.send(JSON.stringify({

  private static instance: SyncService;  content: "I felt anxious today about my presentation",

  private syncing = false;  journal_id: "journal-uuid-here",

  private interval: NodeJS.Timeout | null = null;  current_journal: "<p>Today I woke up feeling nervous...</p>"

}));

  private constructor() {}

// AI responds with ONE question

  static getInstance(): SyncService {ws.onmessage = (event) => {

    if (!SyncService.instance) {  const data = JSON.parse(event.data);

      SyncService.instance = new SyncService();  // data.content = "What specifically made you anxious about the presentation?"

    }  

    return SyncService.instance;  // Display inline as gray text

  }  // User can accept/ignore/modify

};

  start(): void {```

    // Run sync every 30 seconds

    this.interval = setInterval(() => {### Data Storage (Backend Tracking Only)

      this.processQueue();

    }, 30000);**Saved to `ai_guider_chatlog`:**

  }```sql

-- User's journal content

  stop(): void {INSERT INTO ai_guider_chatlog (journal_id, sender_type, message)

    if (this.interval) {VALUES ('uuid', 'user', '{"content":"I felt anxious today..."}');

      clearInterval(this.interval);

      this.interval = null;-- AI's follow-up question

    }INSERT INTO ai_guider_chatlog (journal_id, sender_type, message)

  }VALUES ('uuid', 'bot', 'What specifically made you anxious?');

```

  async processQueue(): Promise<void> {

    if (this.syncing) return;**Purpose:** Context for future AI requests, NOT for displaying chat history to user

    

    // Check if we can sync### Vector Store Integration

    if (!authService.canSync()) {

      console.log('Cannot sync: offline or no valid token');**Qdrant Collections:**

      return;- `journal_entries` - User journal content for semantic search

    }- `chatlog_history` - Previous AI interactions for context (not shown to user)



    this.syncing = true;**Usage:**

```python

    try {# Retrieve relevant context from past journals when user clicks "Go Deeper"

      // Get journals that need syncingrelevant_context = self.vector_store.similarity_search(

      const journals = await sqliteService.query<any>(    query=state["messages"][-1].content,

        'SELECT * FROM user_journals WHERE needs_sync = 1 ORDER BY created_at ASC'    k=8,

      );    score_threshold=0.75

)

      const sdk = TranquaraSDK.getInstance();```



      for (const journal of journals) {### v1.0 Implementation Status

        try {

          // Upload to backend- ❌ **"Go Deeper" button** - UI component not implemented in `JournalPrompt.vue`

          const response = await sdk.fetch('POST', '/v1/journal', {- ❌ **WebSocket integration** - Client exists but not connected to button

            collection_id: journal.collection_id,- ❌ **Inline AI response display** - Gray text suggestion not implemented

            slide_group_id: journal.slide_group_id,- ❌ **Token validation** - Must check auth before WebSocket connection

            content: JSON.parse(journal.content),

            content_html: journal.content_html,**Deferred to v1.1+:**

            mood_score: journal.mood_score,- ⏸️ Full chat interface with conversation history UI

          });- ⏸️ Multi-turn conversations

- ⏸️ Chat history display to user

          // Update local record- ⏸️ AI autofill suggestions (typing assistance)

          await sqliteService.execute(- ⏸️ Automatic emotion detection from text

            'UPDATE user_journals SET id = ?, needs_sync = 0, synced_at = ? WHERE id = ?',

            [response.journal.id, new Date().toISOString(), journal.id]---

          );

## 💾 Offline-First Strategy & Token Management

          console.log(`Synced journal ${journal.id}`);

        } catch (error) {### Design Philosophy

          console.error(`Failed to sync journal ${journal.id}:`, error);

          // Continue with next journal**"Day One" App Approach:**

        }- All journaling works offline by default

      }- Cloud sync is transparent background process

- User never sees "loading" or "syncing" states

      // Sync AI chat logs- Local SQLite is source of truth

      const chatlogs = await sqliteService.query<any>(

        'SELECT * FROM ai_guider_chatlog WHERE needs_sync = 1'### Critical Separation: Local vs Cloud Operations

      );

```

      for (const chatlog of chatlogs) {┌─────────────────────────────────────────────────────┐

        try {│         LOCAL OPERATIONS (NO AUTH REQUIRED)         │

          await sdk.fetch('POST', '/v1/guider-chatlog', {├─────────────────────────────────────────────────────┤

            journal_id: chatlog.journal_id,│ ✅ Create journal entry                             │

            user_message: chatlog.user_message,│ ✅ Edit journal entry                               │

            ai_response: chatlog.ai_response,│ ✅ Delete journal entry                             │

            slide_context: chatlog.slide_context,│ ✅ Read all journals                                │

          });│ ✅ View collections (cached)                        │

│ ✅ Browse slide groups (cached)                     │

          await sqliteService.execute(│ ✅ Use emotion log                                  │

            'UPDATE ai_guider_chatlog SET needs_sync = 0, synced_at = ? WHERE id = ?',│                                                     │

            [new Date().toISOString(), chatlog.id]│ Storage: SQLite (local device)                     │

          );│ Auth: NONE - works completely offline              │

└─────────────────────────────────────────────────────┘

          console.log(`Synced chatlog ${chatlog.id}`);

        } catch (error) {┌─────────────────────────────────────────────────────┐

          console.error(`Failed to sync chatlog ${chatlog.id}:`, error);│         CLOUD OPERATIONS (AUTH REQUIRED)            │

        }├─────────────────────────────────────────────────────┤

      }│ 🔒 Sync journals to PostgreSQL                      │

    } finally {│ 🔒 Fetch new collections from API                   │

      this.syncing = false;│ 🔒 AI chat via WebSocket                            │

    }│ 🔒 Upload chatlog to cloud                          │

  }│ 🔒 Multi-device sync                                │

}│                                                     │

│ Storage: PostgreSQL + Qdrant (cloud)               │

export const syncService = SyncService.getInstance();│ Auth: Keycloak access token (5 min TTL)            │

```└─────────────────────────────────────────────────────┘

```

**Expected Result:** ✅ Background sync service ready

### Token Management Strategy

---

#### Token Lifecycle

#### Step 10: Start Sync on App Launch

**Keycloak Tokens:**

**File: `tranquara_frontend/plugins/sync.client.ts`**- **Access Token**: 5-minute expiration (JWT for API calls)

```typescript- **Refresh Token**: 30-day expiration (used to renew access token)

import { syncService } from '~/services/sync_service';- **Storage**: Capacitor SecureStorage (encrypted keychain/keystore)



export default defineNuxtPlugin(() => {#### Offline Token Management Rules

  // Start sync service

  syncService.start();| Scenario | Token Status | User Action | System Behavior |

  |----------|-------------|-------------|-----------------|

  // Also sync on app resume (mobile)| **Journaling Offline** | Expired/Missing | Write journal | ✅ Save to SQLite, mark `needs_sync=1` |

  if (typeof document !== 'undefined') {| **Online with Valid Token** | Valid (<5 min) | Write journal | ✅ Save to SQLite + background sync |

    document.addEventListener('resume', () => {| **Online with Expired Access Token** | Access expired, Refresh valid | Open app | 🔄 Silent token refresh via refresh token |

      syncService.processQueue();| **Online with Expired Refresh Token** | Both expired | Open app | ⚠️ Show "Sign in to sync" banner, allow offline use |

    });| **AI Chat Request** | Expired | Click "Go Deeper" | ⚠️ Attempt refresh, fallback to "Sign in for AI" message |

  }

});#### Implementation: Auth Service

```

```typescript

**Expected Result:** ✅ Auto-sync enabled// services/auth_service.ts

import { SecureStoragePlugin } from '@capacitor-community/secure-storage';

---

interface TokenInfo {

### Phase 5: AI "Go Deeper" Integration (Week 3)  access_token: string;

  refresh_token: string;

#### Step 11: Add "Go Deeper" Button to JournalPrompt  expires_at: number; // Unix timestamp

  refresh_expires_at: number;

**File: `tranquara_frontend/components/Slide/JournalPrompt.vue`**}



Add button and WebSocket logic:class AuthService {

  private static instance: AuthService;

```vue  private tokenInfo: TokenInfo | null = null;

<template>  

  <div class="journal-prompt">  // Initialize from secure storage

    <h2>{{ slide.title }}</h2>  async init() {

    <p class="prompt-text">{{ slide.prompt }}</p>    try {

          const stored = await SecureStoragePlugin.get({ key: 'keycloak_tokens' });

    <TipTap v-model="content" />      this.tokenInfo = JSON.parse(stored.value);

        } catch {

    <div v-if="slide.ai_enabled && content.length > 50" class="ai-section">      this.tokenInfo = null;

      <UButton    }

        @click="handleGoDeeper"  }

        :loading="aiLoading"  

        :disabled="!canUseAI"  // Get valid access token (auto-refresh if needed)

        icon="i-heroicons-sparkles"  async getValidAccessToken(): Promise<string | null> {

      >    if (!this.tokenInfo) return null;

        Go Deeper    

      </UButton>    const now = Date.now() / 1000;

          

      <p v-if="!canUseAI" class="text-sm text-gray-500">    // Check if refresh token is expired

        Sign in to use AI features    if (now > this.tokenInfo.refresh_expires_at) {

      </p>      // Refresh token expired - require re-login

            this.tokenInfo = null;

      <p v-if="aiResponse" class="ai-response">      await SecureStoragePlugin.remove({ key: 'keycloak_tokens' });

        {{ aiResponse }}      return null;

      </p>    }

    </div>    

  </div>    // Check if access token is expired

</template>    if (now > this.tokenInfo.expires_at - 30) { // Refresh 30s before expiry

      await this.refreshAccessToken();

<script setup lang="ts">    }

import { ref, computed } from 'vue';    

import { useAuthStore } from '~/stores/auth';    return this.tokenInfo?.access_token || null;

import { useWebSocketClient } from '~/composables/useWebSocket';  }

  

const props = defineProps<{  // Silent token refresh

  slide: Slide;  private async refreshAccessToken() {

}>();    if (!this.tokenInfo?.refresh_token) return;

    

const authStore = useAuthStore();    try {

const content = ref('');      const response = await fetch('https://keycloak.example.com/token', {

const aiResponse = ref('');        method: 'POST',

const aiLoading = ref(false);        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },

        body: new URLSearchParams({

const canUseAI = computed(() => authStore.canSync());          grant_type: 'refresh_token',

          refresh_token: this.tokenInfo.refresh_token,

const { send, on } = useWebSocketClient();          client_id: 'tranquara_app'

        })

on('go_deeper_response', (data) => {      });

  aiResponse.value = data.question;      

  aiLoading.value = false;      if (!response.ok) throw new Error('Refresh failed');

});      

      const data = await response.json();

const handleGoDeeper = async () => {      

  if (!canUseAI.value) return;      this.tokenInfo = {

          access_token: data.access_token,

  aiLoading.value = true;        refresh_token: data.refresh_token,

          expires_at: Date.now() / 1000 + data.expires_in,

  send({        refresh_expires_at: Date.now() / 1000 + data.refresh_expires_in

    type: 'go_deeper_request',      };

    content: content.value,      

    slide_context: props.slide.prompt,      // Persist to secure storage

  });      await SecureStoragePlugin.set({

};        key: 'keycloak_tokens',

</script>        value: JSON.stringify(this.tokenInfo)

      });

<style scoped>      

.ai-response {    } catch (error) {

  color: #888;      console.error('Token refresh failed:', error);

  font-style: italic;      this.tokenInfo = null;

  margin-top: 1rem;    }

}  }

</style>  

```  // Check if user can sync (has valid refresh token)

  canSync(): boolean {

**Expected Result:** ✅ AI "Go Deeper" button working    if (!this.tokenInfo) return false;

    const now = Date.now() / 1000;

---    return now < this.tokenInfo.refresh_expires_at;

  }

## ✅ Acceptance Criteria  

  // Save tokens after login

### Must Have (v1.0)  async saveTokens(tokens: TokenInfo) {

    this.tokenInfo = tokens;

#### Offline Functionality    await SecureStoragePlugin.set({

- [ ] User can create journal entries offline      key: 'keycloak_tokens',

- [ ] User can view all journals offline      value: JSON.stringify(tokens)

- [ ] SQLite database persists across app restarts    });

- [ ] Collections cached locally on first load  }

- [ ] Slide groups cached locally  

- [ ] "⏱️ Not synced" badge shows for offline journals  // Logout

- [ ] No crash when offline  async logout() {

    this.tokenInfo = null;

#### Collections & Slides    await SecureStoragePlugin.remove({ key: 'keycloak_tokens' });

- [ ] User can browse all Collections  }

- [ ] User can select a Collection  

- [ ] Slide carousel navigation works  static getInstance(): AuthService {

- [ ] All 6 slide types render correctly:    if (!AuthService.instance) {

  - [ ] emotion_log (1-10 slider)      AuthService.instance = new AuthService();

  - [ ] sleep_check (hours input)    }

  - [ ] journal_prompt (TipTap editor)    return AuthService.instance;

  - [ ] doc (read-only content)  }

  - [ ] cta (call-to-action button)}

  - [ ] further_reading (links list)

- [ ] Progress bar shows slide positionexport default AuthService;

```

#### Journal Creation

- [ ] Mood score saves as INTEGER (1-10)#### Implementation: Auto-Refresh Plugin

- [ ] Content saves as TipTap JSON

- [ ] content_html field auto-generated```typescript

- [ ] Journal appears in list immediately after save// plugins/auth.client.ts

- [ ] Created_at timestamp accurateexport default defineNuxtPlugin(async () => {

  const authService = AuthService.getInstance();

#### AI "Go Deeper"  await authService.init();

- [ ] Button appears only in journal_prompt slides  

- [ ] Button disabled offline  // Auto-refresh every 4 minutes (before 5-min expiry)

- [ ] Button disabled without valid token  setInterval(async () => {

- [ ] Clicking button sends WebSocket message    if (navigator.onLine && authService.canSync()) {

- [ ] AI response displays as gray text      await authService.getValidAccessToken(); // Triggers refresh if needed

- [ ] AI interaction saved to ai_guider_chatlog    }

- [ ] Only ONE question per click (no chat UI)  }, 4 * 60 * 1000);

  

#### Background Sync  // Refresh on app resume (mobile)

- [ ] SyncService runs every 30 seconds  if (typeof Capacitor !== 'undefined') {

- [ ] Checks token validity before sync    App.addListener('appStateChange', async ({ isActive }) => {

- [ ] Uploads journals with needs_sync=1      if (isActive && navigator.onLine) {

- [ ] Updates needs_sync=0 after successful upload        await authService.getValidAccessToken();

- [ ] Retries failed syncs      }

- [ ] No UI blocking during sync    });

- [ ] "⏱️ Not synced" badge disappears after sync  }

  

#### Database Schema  // Provide to app

- [ ] template_id renamed to collection_id  return {

- [ ] mood VARCHAR renamed to mood_score INTEGER    provide: {

- [ ] content field is JSONB      auth: authService

- [ ] content_html field exists    }

- [ ] needs_sync and synced_at fields work  };

});

#### Backend API```

- [ ] GET /v1/collections returns all collections

- [ ] GET /v1/slide-groups?collection_id={id} returns slide groups#### Implementation: Sync Service with Token Management

- [ ] POST /v1/journal creates journal

- [ ] PUT /v1/journal updates journal```typescript

- [ ] DELETE /v1/journal deletes journal// services/sync_service.ts

- [ ] All endpoints require valid Keycloak tokenclass SyncService {

  private authService = AuthService.getInstance();

---  private isSyncing = false;

  

### Should Have (v1.1)  async processSyncQueue() {

    // Check network

- [ ] Full AI chat interface (deferred from v1.0)    if (!navigator.onLine) return;

- [ ] Draft/resume functionality    

- [ ] Daily streak tracking    // Check if already syncing

- [ ] Journal export (JSON, PDF)    if (this.isSyncing) return;

- [ ] Search/filter journals    

- [ ] Conflict resolution UI (if editing same entry offline + online)    // Get valid token

    const token = await this.authService.getValidAccessToken();

---    if (!token) {

      // Can't sync - tokens expired

### Could Have (Future)      this.showSyncBanner('Sign in to sync your journals');

      return;

- [ ] Voice-to-text journaling    }

- [ ] Photo attachments    

- [ ] Mood analytics dashboard    this.isSyncing = true;

- [ ] Custom Collections (user-created)    

- [ ] Share journal entries    try {

- [ ] Reminders/notifications      const queue = await SQLiteService.getInstance()

        .query('SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 10');

---      

      for (const item of queue) {

## 📋 Testing Checklist        await this.syncItem(item, token);

      }

### Before Merge      

    } catch (error) {

**Backend Tests:**      console.error('Sync failed:', error);

```bash    } finally {

cd tranquara_core_service      this.isSyncing = false;

go test ./cmd/api -v    }

```  }

  

**Manual QA:**  private async syncItem(item: SyncQueueItem, token: string) {

- [ ] Test offline journal creation (airplane mode)    try {

- [ ] Test Collections load from cache offline      const response = await fetch(`https://api.example.com/v1/journal`, {

- [ ] Test all 6 slide types render        method: item.operation === 'create' ? 'POST' : 'PUT',

- [ ] Test "Go Deeper" button (online)        headers: {

- [ ] Test "Go Deeper" disabled (offline)          'Authorization': `Bearer ${token}`,

- [ ] Test sync after going online          'Content-Type': 'application/json'

- [ ] Test "⏱️ Not synced" badge appears/disappears        },

- [ ] Test app restart (data persists)        body: item.payload

- [ ] Test 30-day offline journaling      });

- [ ] Test token refresh during sync      

- [ ] Test on Android device      if (!response.ok) throw new Error('Sync failed');

- [ ] Test on iOS device      

- [ ] Test TipTap editor formatting      // Remove from queue

      await SQLiteService.getInstance()

---        .run('DELETE FROM sync_queue WHERE id = ?', [item.id]);

        

## 🔗 Related Documentation      // Update local record

      await SQLiteService.getInstance()

- [Feature Overview](./00-OVERVIEW.md)        .run('UPDATE user_journals SET needs_sync = 0, synced_at = ? WHERE id = ?',

- [Journaling Flows](./01-JOURNALING-FLOWS.md)             [new Date().toISOString(), item.entity_id]);

- [IMPLEMENTATION-GUIDE-OLD.md](./IMPLEMENTATION-GUIDE-OLD.md) (Full 2,000-line version with all details)      

- [Database Schema](../00-DATABASE/SCHEMA_OVERVIEW.md)    } catch (error) {

      // Increment retry count

---      await SQLiteService.getInstance()

        .run('UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',

**Document Version:** 1.1.0               [error.message, item.id]);

**Last Updated:** November 29, 2025      }

**Status:** ✅ Ready for Implementation  }

  
  private showSyncBanner(message: string) {
    // Emit event to show UI banner
    window.dispatchEvent(new CustomEvent('sync-status', { 
      detail: { message, action: 'login' }
    }));
  }
}
```

#### UI Component: Sync Status Banner

```vue
<!-- components/SyncStatusBanner.vue -->
<template>
  <div v-if="showBanner" class="sync-banner">
    <UIcon name="i-heroicons-cloud-arrow-up" />
    <span>{{ message }}</span>
    <UButton 
      v-if="action === 'login'" 
      size="xs" 
      @click="handleLogin"
    >
      Sign In
    </UButton>
    <UButton 
      v-else-if="action === 'retry'" 
      size="xs" 
      @click="handleRetry"
    >
      Retry
    </UButton>
  </div>
</template>

<script setup lang="ts">
const showBanner = ref(false);
const message = ref('');
const action = ref<'login' | 'retry' | null>(null);

onMounted(() => {
  window.addEventListener('sync-status', (event: any) => {
    showBanner.value = true;
    message.value = event.detail.message;
    action.value = event.detail.action;
  });
});

const handleLogin = () => {
  // Navigate to login
  navigateTo('/auth/login');
};

const handleRetry = async () => {
  const syncService = SyncService.getInstance();
  await syncService.processSyncQueue();
};
</script>

<style scoped>
.sync-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-warning-soft);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
}
</style>
```

### Offline Workflow Examples

#### Example 1: User Journals Offline for 2 Days

```
Day 1 (Offline):
- User writes 3 journal entries
- All saved to SQLite with needs_sync=1
- No tokens needed, no errors

Day 2 (Offline):
- User reads previous entries (from SQLite)
- Writes 2 more entries
- Still no errors, fully functional

Day 3 (Online):
- App detects network connectivity
- Attempts token refresh (likely expired after 2 days)
- Refresh token still valid (30-day TTL)
- Silent refresh succeeds
- Background sync starts
- 5 journal entries uploaded to cloud
- UI shows nothing (transparent sync)
```

#### Example 2: Token Refresh Fails

```
User opens app after 35 days offline:
- Both access + refresh tokens expired
- App still opens normally
- User can read all journals (SQLite)
- User can write new journals (SQLite)
- Banner appears: "Sign in to sync your journals"
- Click "Sign In" → Navigate to Keycloak login
- After login: New tokens saved
- Background sync processes all pending entries
```

#### Example 3: AI Chat Request Without Token

```
User clicks "Go Deeper" button:
- AuthService.getValidAccessToken() called
- Tokens expired
- Return null
- AI chat blocked with message:
  "Sign in to use AI assistance"
- Button changes to "Sign In to Chat"
- User can still finish journaling without AI
```

### Testing Scenarios

#### Unit Tests for AuthService

```typescript
// __tests__/auth_service.test.ts
describe('AuthService', () => {
  test('returns null when tokens expired', async () => {
    const auth = AuthService.getInstance();
    await auth.saveTokens({
      access_token: 'old_token',
      refresh_token: 'old_refresh',
      expires_at: Date.now() / 1000 - 100, // Expired 100s ago
      refresh_expires_at: Date.now() / 1000 - 10 // Refresh also expired
    });
    
    const token = await auth.getValidAccessToken();
    expect(token).toBeNull();
  });
  
  test('refreshes token when access expired but refresh valid', async () => {
    // Mock fetch for token refresh endpoint
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new_token',
        refresh_token: 'new_refresh',
        expires_in: 300,
        refresh_expires_in: 2592000
      })
    });
    
    const auth = AuthService.getInstance();
    await auth.saveTokens({
      access_token: 'old_token',
      refresh_token: 'valid_refresh',
      expires_at: Date.now() / 1000 - 10, // Expired
      refresh_expires_at: Date.now() / 1000 + 86400 // Valid for 1 day
    });
    
    const token = await auth.getValidAccessToken();
    expect(token).toBe('new_token');
  });
});
```

#### Integration Test: Offline Journaling

```typescript
// __tests__/offline_journaling.test.ts
test('user can journal offline without errors', async () => {
  // Simulate offline
  Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
  
  const journal = {
    title: 'Offline Entry',
    content: { slides: [...] },
    mood_score: 7
  };
  
  const store = userJournalStore();
  await store.createJournal(journal);
  
  // Verify saved to SQLite
  const journals = await SQLiteService.getInstance()
    .query('SELECT * FROM user_journals WHERE title = ?', ['Offline Entry']);
  
  expect(journals.length).toBe(1);
  expect(journals[0].needs_sync).toBe(1);
  
  // Verify in sync queue
  const queue = await SQLiteService.getInstance()
    .query('SELECT * FROM sync_queue WHERE entity_id = ?', [journals[0].id]);
  
  expect(queue.length).toBe(1);
  expect(queue[0].operation).toBe('create');
});
```

### Performance Considerations

**Token Refresh Timing:**
- Refresh 30 seconds before expiry (4:30 into 5:00 lifetime)
- Prevents race conditions during API calls
- Background process - no UI blocking

**Sync Queue Processing:**
- Batch size: 10 items per sync cycle
- Retry logic: Exponential backoff (1min, 5min, 15min, 1hr)
- Network change listener: Immediate sync on reconnect

**SQLite Performance:**
- Indexes on `needs_sync`, `user_id`, `created_at`
- Vacuum on app startup (if >1000 deleted records)
- Journal content stored as TEXT (JSON.stringify), not BLOB

---

## 🧪 Testing Strategy
---

## 🧪 Testing Strategy

### Unit Testing

#### Frontend Unit Tests

**Stores (Pinia):**
```typescript
// __tests__/stores/user_journal.test.ts
describe('userJournalStore', () => {
  test('creates journal and saves to SQLite', async () => {
    const store = userJournalStore();
    const journal = {
      title: 'Test Entry',
      content: { slides: [...] },
      mood_score: 7
    };
    
    await store.createJournal(journal);
    
    // Verify SQLite write
    const saved = await SQLiteService.getInstance()
      .query('SELECT * FROM user_journals WHERE title = ?', ['Test Entry']);
    
    expect(saved.length).toBe(1);
    expect(saved[0].mood_score).toBe(7);
  });
  
  test('queues journal for sync when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    const store = userJournalStore();
    await store.createJournal({ title: 'Offline', content: {}, mood_score: 5 });
    
    const queue = await SQLiteService.getInstance()
      .query('SELECT * FROM sync_queue WHERE entity_type = ?', ['journal']);
    
    expect(queue.length).toBeGreaterThan(0);
  });
});
```

**Services:**
```typescript
// __tests__/services/auth_service.test.ts
describe('AuthService', () => {
  test('returns null when tokens expired', async () => {
    const auth = AuthService.getInstance();
    await auth.saveTokens({
      access_token: 'old',
      refresh_token: 'old_refresh',
      expires_at: Date.now() / 1000 - 100,
      refresh_expires_at: Date.now() / 1000 - 10
    });
    
    const token = await auth.getValidAccessToken();
    expect(token).toBeNull();
  });
  
  test('refreshes access token when expired', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new_token',
        refresh_token: 'new_refresh',
        expires_in: 300,
        refresh_expires_in: 2592000
      })
    });
    
    const auth = AuthService.getInstance();
    const token = await auth.getValidAccessToken();
    
    expect(token).toBe('new_token');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/token'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
```

#### Backend Unit Tests

**Go Service:**
```go
// internal/data/user_journal_test.go
func TestCreateJournal(t *testing.T) {
    db := setupTestDB(t)
    model := NewJournalModel(db)
    
    journal := &Journal{
        UserID:       "test-user-uuid",
        CollectionID: "collection-uuid",
        Title:        "Test Entry",
        Content:      `{"slides":[]}`,
        MoodScore:    7,
    }
    
    err := model.Insert(journal)
    assert.NoError(t, err)
    assert.NotEmpty(t, journal.ID)
}

func TestGetJournalsByUser(t *testing.T) {
    db := setupTestDB(t)
    model := NewJournalModel(db)
    
    journals, err := model.GetList("test-user-uuid")
    assert.NoError(t, err)
    assert.Greater(t, len(journals), 0)
}
```

### Integration Testing

**End-to-End Offline Flow:**
```typescript
// e2e/offline_journaling.spec.ts
test('complete offline journaling flow', async ({ page }) => {
  // Simulate offline mode
  await page.context().setOffline(true);
  
  // Navigate to collections
  await page.goto('/learn-and-prepare');
  await page.click('[data-test="collection-card-1"]');
  
  // Start slide group
  await page.click('[data-test="slide-group-start"]');
  
  // Fill emotion log
  await page.locator('[data-test="emotion-slider"]').fill('7');
  await page.click('[data-test="slide-next"]');
  
  // Fill journal prompt
  await page.locator('[data-test="journal-textarea"]')
    .fill('Today I felt anxious about my presentation');
  await page.click('[data-test="slide-next"]');
  
  // Complete session
  await page.click('[data-test="save-journal"]');
  
  // Verify saved locally
  const journals = await page.evaluate(() => {
    return window.localStorage.getItem('journals');
  });
  
  expect(journals).toContain('Today I felt anxious');
  
  // Go online
  await page.context().setOffline(false);
  
  // Wait for sync
  await page.waitForSelector('[data-test="sync-complete"]', { timeout: 5000 });
});
```

**AI Chat Integration:**
```typescript
// e2e/ai_chat.spec.ts
test('AI Go Deeper button', async ({ page }) => {
  await page.goto('/journal/prompt');
  
  // Type journal entry
  await page.locator('[data-test="journal-textarea"]')
    .fill('I felt overwhelmed today');
  
  // Click Go Deeper
  await page.click('[data-test="go-deeper-button"]');
  
  // Wait for AI response
  await page.waitForSelector('[data-test="ai-response"]');
  
  const aiText = await page.locator('[data-test="ai-response"]').textContent();
  expect(aiText).toContain('What made you feel overwhelmed?');
});
```

### Performance Testing

**SQLite Performance:**
```typescript
// __tests__/performance/sqlite.test.ts
test('SQLite handles 1000 journal entries', async () => {
  const start = Date.now();
  
  for (let i = 0; i < 1000; i++) {
    await SQLiteService.getInstance().run(
      'INSERT INTO user_journals (id, user_id, title, content, mood_score) VALUES (?, ?, ?, ?, ?)',
      [`journal-${i}`, 'user-1', `Entry ${i}`, '{}', Math.floor(Math.random() * 10) + 1]
    );
  }
  
  const insertTime = Date.now() - start;
  expect(insertTime).toBeLessThan(5000); // 5 seconds for 1000 inserts
  
  // Query performance
  const queryStart = Date.now();
  const results = await SQLiteService.getInstance()
    .query('SELECT * FROM user_journals ORDER BY created_at DESC LIMIT 50');
  
  const queryTime = Date.now() - queryStart;
  expect(queryTime).toBeLessThan(100); // <100ms for paginated query
  expect(results.length).toBe(50);
});
```

**Sync Queue Performance:**
```typescript
test('sync queue processes 100 items efficiently', async () => {
  // Add 100 items to queue
  for (let i = 0; i < 100; i++) {
    await SQLiteService.getInstance().run(
      'INSERT INTO sync_queue (entity_type, entity_id, operation, payload) VALUES (?, ?, ?, ?)',
      ['journal', `journal-${i}`, 'create', `{"id":"journal-${i}"}`]
    );
  }
  
  const syncService = SyncService.getInstance();
  const start = Date.now();
  
  await syncService.processSyncQueue();
  
  const syncTime = Date.now() - start;
  expect(syncTime).toBeLessThan(10000); // <10 seconds for 100 items
  
  const remaining = await SQLiteService.getInstance()
    .query('SELECT * FROM sync_queue');
  
  expect(remaining.length).toBe(0);
});
```

### Manual Testing Checklist

**Offline Scenarios:**
- [ ] Create journal entry while offline
- [ ] Edit existing journal while offline
- [ ] Delete journal while offline
- [ ] View journal history while offline
- [ ] Browse collections (cached) while offline
- [ ] App works after 7 days offline
- [ ] Sync queue processes all changes when back online

**Token Management:**
- [ ] Access token refreshes before expiry (4:30 into 5:00)
- [ ] Refresh token renews access token
- [ ] Expired tokens show "Sign in to sync" banner
- [ ] User can journal offline with expired tokens
- [ ] AI chat blocked with expired tokens
- [ ] Tokens persist after app restart

**Data Integrity:**
- [ ] Journal content preserves formatting (bold, italic, lists)
- [ ] Mood score (1-10) saves correctly
- [ ] Emotion log value persists
- [ ] AI chat history linked to correct journal
- [ ] No data loss during sync conflicts (last-write-wins)

**Edge Cases:**
- [ ] Device storage full - graceful error
- [ ] Network drops mid-sync - retry works
- [ ] User logs out - local data cleared
- [ ] Multiple devices - sync works correctly
- [ ] App killed mid-journal - draft saved

---

## 📚 Related Documentation

- [00-OVERVIEW.md](./00-OVERVIEW.md) - Feature purpose and design decisions
- [01-JOURNALING-FLOWS.md](./01-JOURNALING-FLOWS.md) - User journey flows
- [AI assist journaling.md](./AI%20assist%20journaling.md) - AI behavior specs
- [Content type schemas design.md](./Content%20type%20schemas%20design.md) - Slide schemas
- [SCHEMA_OVERVIEW.md](../00-DATABASE/SCHEMA_OVERVIEW.md) - Complete database schema
- [CAPACITOR-PLUGINS.md](../CAPACITOR-PLUGINS.md) - Plugin installation guide

---

## 📝 Next Steps

### Immediate Actions (Start Phase 1)

1. **Install Dependencies:**
   ```bash
   cd tranquara_frontend
   npm install @capacitor-community/sqlite @capacitor-community/secure-storage
   npx cap sync
   ```

2. **Create Database Service Skeleton:**
   ```bash
   mkdir -p services
   touch services/sqlite_service.ts
   touch services/auth_service.ts
   touch services/sync_service.ts
   ```

3. **Update Type Definitions:**
   - Rename `JournalTemplate` → `Collection` in `types/user_journal.ts`
   - Add `mood_score: number` field
   - Add `content_html: string` field

4. **Backend Migration:**
   ```bash
   cd tranquara_core_service
   migrate create -ext sql -dir ./migrations -seq update_journal_schema
   # Edit migration files with schema updates
   ```

5. **Review This Document:**
   - Verify all design decisions align with team expectations
   - Confirm Phase 1 priorities
   - Schedule kickoff meeting

---

**Document Version:** 1.1.0  
**Last Updated:** November 28, 2025  
**Author:** GitHub Copilot  
**Status:** ✅ Design Complete - Ready for Implementation

---

## Appendix: Quick Reference

### File Structure After Implementation

```
tranquara_frontend/
├── services/
│   ├── sqlite_service.ts          # Local database wrapper
│   ├── auth_service.ts            # Token management
│   └── sync_service.ts            # Background sync
│
├── stores/stores/
│   ├── user_journal.ts            # Refactored for SQLite
│   └── chatlog.ts                 # Enhanced with local storage
│
├── components/
│   ├── Slide/
│   │   └── EmotionLog.vue         # New component
│   ├── Journal/
│   │   └── ModalContents.vue      # Updated with Go Deeper
│   └── SyncStatusBanner.vue       # New component
│
├── types/
│   └── user_journal.ts            # Collection (renamed from Template)
│
└── plugins/
    └── auth.client.ts             # Auto token refresh
```

### API Endpoints Reference

```
Collections:
GET    /v1/collections              List all
GET    /v1/collections/:id          Get with slide groups
GET    /v1/slide-groups/:id         Get individual

Journals:
GET    /v1/journals                 List user journals
GET    /v1/journal?id={id}          Get single
POST   /v1/journal                  Create
PUT    /v1/journal                  Update
DELETE /v1/journal?id={id}          Delete

Chat:
GET    /v1/guider-chatlog?journal_id={id}  Get chat history
WS     ws://ai-service/ws/{user_uuid}      AI chat WebSocket
```

### Environment Variables

```env
# Frontend (.env)
KEYCLOAK_URL=https://auth.tranquara.com
KEYCLOAK_REALM=tranquara_auth
KEYCLOAK_CLIENT_ID=tranquara_app
API_BASE_URL=https://api.tranquara.com
AI_SERVICE_WS=wss://ai.tranquara.com

# Backend (Go)
DATABASE_DSN=postgres://user:pass@localhost/tranquara
RABBITMQ_URL=amqp://guest:guest@localhost:5672
KEYCLOAK_PUBLIC_KEY_PATH=./publicKey.pem

# AI Service (Python)
OPENAI_API_KEY=sk-...
QDRANT_URL=http://localhost:6333
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```
