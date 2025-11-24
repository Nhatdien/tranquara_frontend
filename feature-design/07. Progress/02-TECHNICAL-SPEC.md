# ⚙️ Progress Tracking - Technical Specification

## Overview

This document details the technical implementation of the Progress feature, including real-time metric updates, calculation strategies, export generation, and API specifications.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile/Web Frontend                       │
│                  (Expo/React Native + Web)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Progress     │  │ Charts       │  │ Export       │      │
│  │ Screen       │  │ Renderer     │  │ Generator    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
          │                 │                 │ WebSocket
┌─────────▼─────────────────▼─────────────────▼───────────────┐
│                   Backend API (Go)                           │
│              tranquara_core_service                          │
│                                                              │
│  GET  /api/progress/summary?period=30d  - Fetch metrics     │
│  GET  /api/progress/journal?period=30d  - Journal metrics   │
│  GET  /api/progress/learning?period=30d - Learning metrics  │
│  POST /api/progress/export              - Generate PDF      │
│  WS   /api/progress/live                - Real-time updates │
└─────────┬────────────────────────────────────────┬──────────┘
          │                                        │
          │ PostgreSQL                             │ RabbitMQ
          │                                        │
┌─────────▼────────────────┐          ┌───────────▼───────────┐
│   PostgreSQL Database    │          │   Metric Calculator   │
│                          │          │   (Background Worker) │
│  - user_journals         │          │                       │
│  - journal_metrics_daily │◄─────────┤  - Incremental updates│
│  - user_metrics          │  Trigger │  - Aggregation jobs   │
│  - user_learned_lessons  │          │  - Sentiment analysis │
│  - lesson_progress       │          │  - Emotion extraction │
└──────────────────────────┘          └───────────────────────┘
```

---

## 📊 Metric Calculation Strategy

### Real-Time Incremental Updates

**Goal**: Update metrics immediately when user journals or completes lesson, without full recalculation.

#### Journaling Metric Update Flow

```
User Saves Journal Entry
    ↓
Backend: POST /api/journals
    ↓
1. Insert into user_journals
    ↓
2. Trigger Metric Update (async)
    ↓
3. Publish to RabbitMQ:
   {
     "type": "journal_created",
     "user_id": "...",
     "journal_id": "...",
     "content": "...",
     "created_at": "2025-11-23T10:30:00Z"
   }
    ↓
4. Metric Calculator Worker Consumes:
   - Extract sentiment (HuggingFace)
   - Extract emotions (NLP keywords)
   - Count words
   - Check for sleep_check data
    ↓
5. Update journal_metrics_daily (today):
   - entry_count += 1
   - avg_sentiment = recalculated average
   - dominant_emotions = updated frequency
   - emotion_word_freq = merge new emotions
    ↓
6. Update user_streaks:
   - Check if consecutive day
   - Increment current_streak or reset
   - Update longest_streak if needed
    ↓
7. Publish WebSocket event:
   {
     "type": "metrics_updated",
     "user_id": "...",
     "metrics": { ... }
   }
    ↓
8. Frontend receives WebSocket → Refresh UI
```

**Performance Optimization:**
- **Incremental**: Only recalculate affected metrics (today's date)
- **Cached Aggregations**: Pre-computed daily summaries (not raw scan)
- **Async Processing**: Metric calculation doesn't block journal save (returns immediately)
- **Debouncing**: If multiple journals in 1 minute, batch update

---

### Learning Metric Update Flow

```
User Completes Lesson
    ↓
Backend: POST /api/lessons/:id/complete
    ↓
1. Insert into user_learned_lessons
    ↓
2. Update lesson_progress_metrics (atomic):
   - total_lessons += 1
   - topic_distribution[category] += 1
   - last_completed_at = NOW()
    ↓
3. Return success immediately
    ↓
4. Optional: Publish WebSocket (if user on Progress tab)
```

**Simpler than Journaling** because:
- No sentiment/emotion analysis needed
- Just counters (no complex aggregation)
- Can update synchronously (fast operation)

---

## 🔄 Real-Time Update Implementation

### Option 1: WebSocket (Recommended)

**Pros**: Instant updates, bidirectional, efficient for real-time
**Cons**: More complex setup, requires persistent connection

**Backend (Go)**:

_[GO code implementation removed - to be added during development]_

**Frontend (React Native)**:

_[TYPESCRIPT code implementation removed - to be added during development]_

---

### Option 2: Polling (Fallback)

**Pros**: Simple, works everywhere, no persistent connection
**Cons**: Less efficient, 5-10s delay

**Frontend**:

_[TYPESCRIPT code implementation removed - to be added during development]_

**Recommendation**: Use WebSocket for mobile, polling for web (easier fallback).

---

## 📈 Metric Aggregation Queries

### Query 1: Fetch Summary (Last 30 Days)

**Endpoint**: `GET /api/progress/summary?period=30d`

**SQL** (Go backend):

_[SQL code implementation removed - to be added during development]_

**Response Example**:

_[JSON code implementation removed - to be added during development]_

---

### Query 2: Time Period Toggle

**Backend Logic**:

_[GO code implementation removed - to be added during development]_

---

## 📄 Export Progress Report

### PDF Generation Strategy

**Approach**: Server-side PDF generation using Go template + library.

**Backend Endpoint**: `POST /api/progress/export`

**Request**:

_[JSON code implementation removed - to be added during development]_

**Implementation** (Go):

_[GO code implementation removed - to be added during development]_

**Frontend**:

_[TYPESCRIPT code implementation removed - to be added during development]_

---

### Screenshot Alternative (Simpler)

**Frontend-Only** (no backend):

_[TYPESCRIPT code implementation removed - to be added during development]_

**Trade-off**: Screenshots less professional than PDFs, but much simpler to implement.

---

## 🎨 Chart Rendering

### Sentiment Trend Line Chart

**Library**: Use `react-native-chart-kit` or `recharts` (web)

**Data Format**:

_[TYPESCRIPT code implementation removed - to be added during development]_

**Component**:

_[TSX code implementation removed - to be added during development]_

---

### Topic Distribution Radar Chart

**Library**: `react-native-chart-kit` (radar chart)

**Data**:

_[TYPESCRIPT code implementation removed - to be added during development]_

**Component**:

_[TSX code implementation removed - to be added during development]_

---

## 🔧 Performance Optimization

### 1. Caching Strategy

**Backend** (Go):

_[GO code implementation removed - to be added during development]_

---

### 2. Lazy Loading

**Frontend**:

_[TYPESCRIPT code implementation removed - to be added during development]_

---

### 3. Database Indexing

**Required Indexes** (PostgreSQL):

_[SQL code implementation removed - to be added during development]_

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| **Progress tab load** | < 1.5s (initial) |
| **Time period toggle** | < 500ms (cached), < 2s (uncached) |
| **Real-time update** | < 2s (from action to UI) |
| **Chart render** | < 1s |
| **PDF export** | < 5s |
| **Screenshot capture** | < 2s |
| **WebSocket latency** | < 100ms |

---

**Last Updated**: November 23, 2025
