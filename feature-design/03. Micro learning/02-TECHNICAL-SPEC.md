# ⚙️ Micro Learning - Technical Specification

## Overview

This document details the technical implementation of the micro-learning feature, including offline bundling strategy, AI recommendations, search architecture, and system integrations.

---

## 🏗️ System Architecture

```mermaid
┌─────────────────────────────────────────────────────────────┐
│                    Mobile/Web Frontend                       │
│                  (Expo/React Native + Web)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Lesson       │  │ Search       │  │ Progress     │      │
│  │ Library      │  │ Engine       │  │ Tracker      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼───────────────┐
│                   Local Storage Layer                        │
│              SQLite (Mobile) / IndexedDB (Web)              │
│                                                              │
│  - Bundled core lessons (20-30)                            │
│  - User progress (user_learned_lessons)                    │
│  - Sync queue for offline completions                      │
│  - Cached search results                                   │
└─────────┬────────────────────────────────────────┬──────────┘
          │                                        │
          │ Online Sync                            │ Background Sync
          │                                        │
┌─────────▼────────────────────────────────────────▼──────────┐
│                  Backend API (Go)                            │
│              tranquara_core_service                          │
│                                                              │
│  GET  /api/lessons                  - List all lessons      │
│  GET  /api/lessons/search           - Search lessons        │
│  GET  /api/lessons/:id              - Get lesson detail     │
│  POST /api/lessons/:id/complete     - Mark complete         │
│  GET  /api/lessons/recommendations  - AI suggestions        │
│  GET  /api/progress/lessons         - User stats            │
└─────────┬────────────────────────────────────────┬──────────┘
          │                                        │
          │ PostgreSQL                             │ RabbitMQ
          │                                        │
┌─────────▼────────────────┐          ┌───────────▼───────────┐
│   PostgreSQL Database    │          │   AI Service (Python) │
│                          │          │   tranquara_ai_service│
│  - collections           │          │                       │
│  - slide_groups          │◄─────────┤  - Journal analysis   │
│  - user_learned_lessons  │  Vector  │  - Lesson matching    │
│  - user_journals         │  Search  │  - Qdrant queries     │
│  - user_informations     │          │                       │
└──────────────────────────┘          └───────────┬───────────┘
                                                  │
                                      ┌───────────▼───────────┐
                                      │   Qdrant Vector DB    │
                                      │                       │
                                      │  - Lesson embeddings  │
                                      │  - Journal embeddings │
                                      │  - Semantic search    │
                                      └───────────────────────┘
```

---

## 📦 Offline Bundling Strategy

### Bundled Content Approach

**Core lessons included in app bundle at installation time.**

#### Bundle Composition

```
app-bundle/
├── assets/
│   └── lessons/
│       ├── collections.json      # Pre-seeded collections metadata
│       └── slide_groups.json     # Pre-seeded lesson content
├── illustrations/
│   └── lesson_*.png              # Lesson cover images
└── ...
```

**Example: `collections.json`**

_[JSON code implementation removed - to be added during development]_

**Example: `slide_groups.json`**

_[JSON code implementation removed - to be added during development]_

#### Installation Flow

1. **App First Launch**:
   - Check local database (`lessons` table in SQLite/IndexedDB)
   - If empty → Load from bundled JSON files
   - Insert into local database with `bundled: true` flag

2. **Database Schema for Local Storage**:

_[SQL code implementation removed - to be added during development]_

3. **Bundle Size Optimization**:
   - Target: **20-30 core lessons** (~5-10MB total)
   - Compress JSON (gzip)
   - Lazy-load images (download on first view)
   - Prioritize essential categories:
     - Journaling Basics (5 lessons)
     - Therapy Prep (8 lessons)
     - Mindfulness (5 lessons)
     - Emotional Awareness (5 lessons)
     - Stress Management (5 lessons)

#### Background Sync

_[TYPESCRIPT code implementation removed - to be added during development]_

---

## 🔍 Search Implementation

### Hybrid Search Architecture

**Two-tier search: PostgreSQL (primary) + Qdrant (fallback semantic search)**

#### Tier 1: PostgreSQL Full-Text Search

**Backend Endpoint**: `GET /api/lessons/search?q=<query>`

**PostgreSQL Implementation (Go)**:

_[SQL code implementation removed - to be added during development]_

**Also search within slide content**:

_[SQL code implementation removed - to be added during development]_

**Score Threshold**: If `rank < 0.1`, trigger semantic search fallback.

---

#### Tier 2: Qdrant Semantic Search

**When PostgreSQL returns weak matches:**

**Flow**:
1. Go backend sends query to Python AI service via RabbitMQ
2. Python service:
   - Generates embedding for user query using HuggingFace model
   - Queries Qdrant vector database
   - Returns top K semantically similar lessons

**RabbitMQ Message** (Go → Python):

_[JSON code implementation removed - to be added during development]_

**Python AI Service (Qdrant Query)**:

_[PYTHON code implementation removed - to be added during development]_

**Qdrant Collection Schema**:

_[PYTHON code implementation removed - to be added during development]_

**Response to Go Backend**:

_[JSON code implementation removed - to be added during development]_

**Frontend Display**:

_[TYPESCRIPT code implementation removed - to be added during development]_

---

### Search Caching

**Cache search results locally for 24 hours** to improve offline experience.

_[SQL code implementation removed - to be added during development]_

---

## 🤖 AI Recommendation System

### Opt-In Architecture

**User Setting**: `settings.ai_recommendations` (boolean, default `false`)

**Settings UI** (in User Profile):

```
┌─────────────────────────────────────┐
│ AI Features                         │
├─────────────────────────────────────┤
│ 🧠 Personalized Lesson Suggestions  │
│                                     │
│ Let AI analyze your journal entries │
│ to recommend relevant lessons       │
│                                     │
│ [Toggle: OFF]  [Learn More]        │
│                                     │
│ ⚠️ This feature uses your journal  │
│    content to find helpful lessons. │
│    No data is shared externally.   │
└─────────────────────────────────────┘
```

#### When User Enables AI Recommendations

**Frontend → Backend**:

_[TYPESCRIPT code implementation removed - to be added during development]_

**Backend → Database**:

_[SQL code implementation removed - to be added during development]_

**Trigger Initial Analysis** (async job):

_[GO code implementation removed - to be added during development]_

---

### Recommendation Generation Flow

**Python AI Service** (consuming RabbitMQ task):

_[PYTHON code implementation removed - to be added during development]_

---

### Displaying Recommendations

**Frontend Fetches**:

_[TYPESCRIPT code implementation removed - to be added during development]_

**Backend Response**:

_[JSON code implementation removed - to be added during development]_

**UI Display** (Home Screen or Library):

```
┌───────────────────────────────────────────┐
│ 💡 Suggested for You                      │
├───────────────────────────────────────────┤
│ 📘 5-Minute Stress Relief Techniques      │
│                                           │
│ We noticed you wrote about 'stress'      │
│ 3 times this week. This lesson might help│
│                                           │
│ [Start Lesson]  [Not Now]                │
└───────────────────────────────────────────┘
```

**User Actions**:
- **Start Lesson** → Track as "accepted suggestion" (metric)
- **Not Now** → Track as "dismissed" → Don't suggest again for 7 days
- **Ignore** → Keep showing until replaced by new recommendations

---

### Recommendation Refresh Schedule

- **Trigger**: Every 3 days (if AI enabled)
- **Or**: When user completes 3+ new journal entries since last recommendation
- **Or**: Manual "Refresh Suggestions" button in Settings

---

## 📊 Progress Tracking

### Backend API

**Endpoint**: `GET /api/progress/lessons`

**Response**:

_[JSON code implementation removed - to be added during development]_

**Query**:

_[SQL code implementation removed - to be added during development]_

---

## 🔄 Sync Queue for Offline Completions

When user completes lesson offline:

**Local Save**:

_[SQL code implementation removed - to be added during development]_

**Background Sync**:

_[TYPESCRIPT code implementation removed - to be added during development]_

---

## 🛡️ Error Handling & Fallbacks

| Scenario | Behavior |
|----------|----------|
| **No network during browse** | Load from local database, show offline badge |
| **Lesson not cached locally** | Show "Requires internet" message |
| **Search fails (server down)** | Fall back to local filter by category/title |
| **AI recommendations unavailable** | Hide suggestion section, show browse library CTA |
| **Sync fails 3 times** | Notify user in Settings: "Some progress waiting to sync" |
| **Corrupted bundled data** | Re-download core pack from server |

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| **Library load time** | < 1s (local), < 3s (first load) |
| **Search response** | < 500ms (keyword), < 2s (semantic) |
| **Lesson load** | < 200ms (cached), < 1s (fresh) |
| **Sync completion** | < 5s (background) |
| **AI recommendation generation** | < 10s (async, not blocking) |
| **Bundle size** | < 10MB (core lessons + images) |

---

## 🔐 Security & Privacy

1. **AI Recommendations Opt-In**: Default OFF, clear consent required
2. **No External Sharing**: Journal analysis happens in-house (Python service), never sent to third-party APIs
3. **Data Encryption**: Journal content encrypted at rest in PostgreSQL
4. **Temporary Embeddings**: Qdrant vectors can be regenerated, not permanently tied to user data
5. **Audit Logging**: Track when AI recommendations are generated and accessed

---

**Last Updated**: November 22, 2025
