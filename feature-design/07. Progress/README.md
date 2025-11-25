# 📊 Progress Tracking Feature

> Informative insights into journaling habits and learning journey

---

## 📑 Core Documentation

| File | Description |
|------|-------------|
| **[00-OVERVIEW.md](./00-OVERVIEW.md)** | Feature purpose, user value, and design decisions |
| **[01-PROGRESS-FLOWS.md](./01-PROGRESS-FLOWS.md)** | User journeys with Mermaid diagrams for all flows |
| **[02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md)** | Real-time updates, metric calculations, export generation |
| **[03-DATA-MODELS.md](./03-DATA-MODELS.md)** | Database schemas and progress queries |

---

## 🎯 Quick Summary

**Status**: 🧠 Planned (P0)  
**Priority**: High  
**Target**: v1.0

### What This Feature Does

Users get:
- **Bottom navigation tab**: Access Progress between Journal and Library
- **Comprehensive journaling metrics**: Entry count, streaks, word count, sentiment trends, sleep quality, emotion patterns
- **Learning progress**: Total lessons completed, topic distribution, recently completed
- **Time period toggle**: View Daily / Weekly / Monthly (default: Last 30 Days) / All Time
- **Real-time updates**: Metrics refresh immediately after journaling or completing lessons
- **Export reports**: Generate PDF or screenshot for personal use or therapist sharing
- **Empty state guidance**: "Start journaling" CTA with sample metrics for new users

### Design Philosophy

- **Informational, not gamified**: No pressure, badges, or congratulatory messages
- **Journaling metrics prioritized**: Mental health focus (journaling > learning)
- **Mixed visualization**: Numbers for quick scanning, charts for trend analysis
- **Accessibility-first**: WCAG AA compliant, screen-reader friendly, color-blind safe

---

## 📊 Metrics Displayed

### Journaling Section (Top Priority)

#### Key Numbers
- **📝 Entry Count**: Total journal entries in period
- **🔥 Current Streak**: Consecutive journaling days (+ longest streak)
- **📊 Word Count**: Total words written

#### Trend Charts
- **📈 Sentiment Trend**: Line chart showing mood patterns (positive/negative over time)
- **😴 Sleep Quality Trend**: Line chart of average sleep hours from sleep_check slides
- **🎨 Emotion Variety**: Bar showing diversity of emotions expressed (0-1 scale)
- **🏷️ Dominant Emotions**: Top 5 most frequent emotions with counts (tappable to filter journals)

### Learning Section (Secondary)

- **📚 Total Lessons Completed**: Simple counter
- **🗂️ Topic Distribution**: Radar or pie chart showing category breakdown
  - Mindfulness
  - Therapy Prep
  - Stress Management
  - Emotional Regulation
  - Journaling Basics
- **📖 Recently Completed**: Last 3 lessons with titles and completion dates

---

## 🗂️ Bottom Navigation Structure

```
┌─────────────────────────────────────────────┐
│  [Home]  [Journal]  [Progress]  [Library]  │
│    🏠       ✍️         📊          📚       │
└─────────────────────────────────────────────┘
```

**Note**: Profile/Settings accessible from top-right icon on Home screen (not in bottom nav).

**Tab Order Rationale**:
- **Home** → Main dashboard
- **Journal** → Core therapeutic feature
- **Progress** → Reflection on habits ← **NEW**
- **Library** → Learning content

---

## 🔧 Technology

- **Frontend**: Nuxt 3 + Vue 3 + Capacitor
- **Backend API**: Go (tranquara_core_service)
- **Database**: PostgreSQL (aggregated metrics tables)
- **Real-Time**: WebSocket (primary) or polling (fallback)
- **Charts**: `chart.js` + `vue-chartjs` (cross-platform)
- **Export**: Server-side PDF generation (Go + gofpdf) or frontend screenshot
- **Caching**: Redis (5-minute TTL for metric summaries)
- **Metric Calculation**: RabbitMQ + Python AI service (sentiment/emotion extraction)

---

## 🔗 Related Features

- **[Journaling](../02.%20Jounral%20Feature/)** - Primary data source (journals, emotions, sleep)
- **[Micro Learning](../03.%20Micro%20learning/)** - Learning progress data
- **[Database Schema](../00-DATABASE/)** - `journal_metrics_daily`, `user_streaks`, `lesson_progress_metrics`
- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile accessed from Home (not bottom nav)

---

## 🚀 Implementation Status

**Core Files Created:**
- [x] 00-OVERVIEW.md - Feature purpose and design decisions
- [x] 01-PROGRESS-FLOWS.md - User flows with Mermaid diagrams
- [x] 02-TECHNICAL-SPEC.md - Architecture and real-time updates
- [x] 03-DATA-MODELS.md - Database schemas and queries
- [x] README.md - Feature summary and navigation

**Feature Checklist:**
- [ ] Database tables: `journal_metrics_daily`, `user_streaks`, `lesson_progress_metrics` (already exist)
- [ ] Optional: `user_journal_responses` for sleep/emotion tracking
- [ ] Backend API endpoints for progress summary
- [ ] Real-time metric calculation worker (RabbitMQ consumer)
- [ ] WebSocket or polling implementation for live updates
- [ ] Frontend Progress screen UI component
- [ ] Chart components (sentiment, sleep, topic distribution)
- [ ] Time period toggle functionality
- [ ] PDF export generation
- [ ] Empty state with sample metrics
- [ ] Performance optimization (caching, lazy loading)
- [ ] Accessibility testing (WCAG AA)

---

## 📈 Key Metrics to Track

**Performance:**
- Progress tab load time (target: < 1.5s)
- Time period toggle speed (target: < 500ms cached)
- Real-time update latency (target: < 2s)
- Export generation time (target: < 5s)

**Usage:**
- Progress tab engagement (% of sessions)
- Most viewed time period (Daily vs Weekly vs Monthly vs All Time)
- Export feature usage rate
- Chart interaction rate (taps on data points)

**User Feedback:**
- Clarity of metrics (survey: "Do you understand your progress?")
- Usefulness for therapy prep (% using exports)
- Desired additional metrics (open feedback)

---

## 📱 UI Preview (Conceptual)

```
┌─────────────────────────────────┐
│  Progress         [Export PDF]  │ ← Header
├─────────────────────────────────┤
│  [Daily] [Weekly] [Monthly] [All] │ ← Time Toggle
│           ▲ Selected             │
├─────────────────────────────────┤
│  📝 JOURNALING                   │
│                                 │
│  ┌─────┐  ┌─────┐  ┌─────┐     │
│  │ 23  │  │ 5🔥 │  │12,450│    │
│  │Entry│  │Streak│  │Words │    │
│  └─────┘  └─────┘  └─────┘     │
│                                 │
│  📈 Sentiment Trend             │
│  [Line Chart: Last 30 Days]    │
│                                 │
│  😴 Sleep Quality               │
│  [Line Chart: Avg Hours]       │
│                                 │
│  🏷️ Dominant Emotions           │
│  😌 Calm: 15  😟 Anxious: 8     │
│  😊 Happy: 7  😔 Sad: 4         │
│                                 │
├─────────────────────────────────┤
│  📚 LEARNING                     │
│                                 │
│  Total Lessons: 26              │
│                                 │
│  🗂️ Topic Distribution          │
│  [Radar Chart]                  │
│                                 │
│  📖 Recently Completed          │
│  • What to Expect - Nov 22     │
│  • Managing Anxiety - Nov 20   │
│  • Journaling Basics - Nov 18  │
└─────────────────────────────────┘
```

---

## 🎨 Empty State Example

```
┌─────────────────────────────────┐
│  Progress                       │
├─────────────────────────────────┤
│  [Start Journaling] ← CTA       │
├─────────────────────────────────┤
│  Your progress journey starts   │
│  here. Write your first journal │
│  to begin tracking.             │
│                                 │
│  📝 Entry Count: 0              │
│  (Will show total entries)      │
│                                 │
│  🔥 Streak: 0 days              │
│  (Track your consistency)       │
│                                 │
│  📈 Sentiment Trend             │
│  [Grayed dotted line chart]    │
│  (Your mood patterns)           │
│                                 │
│  📚 Lessons: 0                  │
│  (Start learning to see here)  │
└─────────────────────────────────┘
```

---

## 🔮 Future Enhancements

- [ ] Emotion heatmap calendar (GitHub-style)
- [ ] Compare time periods (This Week vs Last Week)
- [ ] AI-generated insights ("Your mood improved by 15% this month")
- [ ] Custom date range picker
- [ ] Correlation analysis (Better sleep → Better mood)
- [ ] Share progress directly to therapist (secure, consent-based)
- [ ] Weekly summary notifications (opt-in)
- [ ] Voice-over summary (accessibility)

---

**Last Updated**: November 23, 2025
