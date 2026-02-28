# ⚙️ Progress Tracking - Technical Specification

## Overview

This document details the technical implementation of the Progress feature. The Progress page is a **detail page** accessed via the 🔥 streak icon on the Home screen. All metrics are **computed client-side** from local SQLite journals (offline-first), with streak data fetched from the backend.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile/Web Frontend                       │
│              (Nuxt 3 + Vue 3 + Capacitor)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Progress     │  │ ECharts      │  │ Pinia        │      │
│  │ Page         │  │ Components   │  │ Stores       │      │
│  │ (detail      │  │ (Emotion Pie,│  │ (Journal,    │      │
│  │  layout)     │  │  Heatmap)    │  │  Streak,     │      │
│  │              │  │              │  │  Learned)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └────── computed properties ────────┘               │
│                         │                                   │
│              ┌──────────▼──────────┐                        │
│              │   Local SQLite DB    │                        │
│              │   (journals, learned)│                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                          │
              Backend (streak data only)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Backend API (Go)                           │
│              tranquara_core_service                          │
│                                                              │
│  GET  /v1/user_streaks     - Fetch streak data              │
│  PUT  /v1/user_streaks     - Update streak data             │
│  GET  /v1/emotion_log      - Fetch emotion logs             │
└─────────┬───────────────────────────────────────────────────┘
          │
          │ PostgreSQL
          │
┌─────────▼────────────────┐
│   PostgreSQL Database    │
│                          │
│  - user_streaks          │
│  - emotion_logs          │
│  - user_learned_slide_   │
│    groups                │
└──────────────────────────┘
```

---

## 📊 Metric Computation Strategy

### Client-Side Computation (Primary Approach)

All metrics are computed from data already available in Pinia stores, which are populated from local SQLite on app initialization. **No dedicated backend progress API endpoints are needed.**

#### Entry & Day Counts (✅ Implemented)
```
Source: userJournalStore.journals (local SQLite)
Computation: 
  - totalEntries → streakStore.totalEntries (from backend)
  - totalCompletedDays → count unique dates from journal created_at
  - totalWordsWritten → strip HTML/TipTap JSON → split by whitespace → count
```

#### Average Mood (✅ Implemented)
```
Source: userJournalStore.journals[].mood_score (1-10 scale)
Computation:
  - Filter journals where mood_score != null && mood_score > 0
  - Calculate average → round to nearest integer
  - Map to label: {1: 'Terrible', 2: 'Very Bad', ..., 10: 'Fantastic'}
```

#### Streak Data (✅ Implemented)
```
Source: useUserStreakStore (fetched from backend GET /v1/user_streaks)
Data: current_streak, longest_streak, total_entries, last_active
Note: This is the ONLY metric requiring a backend API call
```

#### Emotion Distribution (🔜 To Implement — Priority #1)
```
Source: userJournalStore.journals[].emotion_log (local SQLite)
Computation:
  - Group emotions by name/type
  - Count frequency of each emotion
  - Format for ECharts pie chart
Chart: ECharts pie chart (donut style) showing emotion frequency
```

#### Journaling Heatmap (🔜 To Implement — Priority #1)
```
Source: userJournalStore.journals[].created_at (local SQLite)
Computation:
  - Extract date from each journal's created_at
  - Count entries per day
  - Map to heatmap grid: [{date: '2026-01-15', count: 2}, ...]
Chart: ECharts calendar heatmap (GitHub-style contribution grid)
  - Color intensity based on journal count per day
  - Shows last 6 months of activity
```

---

## 🎨 Chart Rendering

### Library: ECharts + vue-echarts

Already installed in the project:
- `echarts`: ^5.6.0
- `vue-echarts`: ^7.0.3
- Plugin: `plugins/echarts.client.ts`

### Emotion Distribution Chart

**Type**: Pie chart (donut style)

**Data Computation**:
```typescript
const emotionDistribution = computed(() => {
  const emotionCounts: Record<string, number> = {};
  journalStore.journals
    .filter(j => !j.is_deleted && j.emotion_log)
    .forEach(j => {
      const emotion = j.emotion_log; // e.g., "calm", "anxious"
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  return Object.entries(emotionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
});
```

**ECharts Option**:
```typescript
const emotionChartOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: emotionDistribution.value,
    emphasis: { itemStyle: { shadowBlur: 10 } },
    label: { show: true, formatter: '{b}: {c}' }
  }]
}));
```

### Journaling Heatmap Calendar

**Type**: ECharts calendar heatmap (GitHub-style)

**Data Computation**:
```typescript
const heatmapData = computed(() => {
  const dayCounts: Record<string, number> = {};
  journalStore.journals
    .filter(j => !j.is_deleted)
    .forEach(j => {
      const date = new Date(j.created_at).toISOString().split('T')[0];
      dayCounts[date] = (dayCounts[date] || 0) + 1;
    });
  return Object.entries(dayCounts).map(([date, count]) => [date, count]);
});
```

**ECharts Option**:
```typescript
const heatmapOption = computed(() => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);

  return {
    tooltip: {
      formatter: (p: any) => `${p.data[0]}: ${p.data[1]} entries`
    },
    visualMap: {
      min: 0, max: 5, show: false,
      inRange: {
        color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
      }
    },
    calendar: {
      range: [
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      ],
      cellSize: ['auto', 15],
      dayLabel: { firstDay: 1 },
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: heatmapData.value
    }]
  };
});
```

---

## 🔄 Data Flow

### Page Load Flow

```
User taps 🔥 streak icon (DateHeader component on Home screen)
    ↓
router.push('/progress')
    ↓
pages/progress.vue loads (layout: 'detail')
    ↓
onMounted:
  1. Check if streakStore.streak exists
     → If not: await streakStore.fetchStreak() (GET /v1/user_streaks)
  2. journalStore.journals already loaded from SQLite on app init
  3. learnedStore data already loaded from SQLite on app init
    ↓
Vue computed properties recalculate:
  - totalCompletedDays, totalWordsWritten, averageMoodLabel
  - emotionDistribution, heatmapData
    ↓
ECharts components render charts reactively
    ↓
UI displays immediately (< 500ms)
```

### Metric Refresh After Journaling

```
User writes journal → saves → navigates back to Home
    ↓
Journal saved to local SQLite → journalStore.journals updates
    ↓
User taps 🔥 streak icon again
    ↓
progress.vue re-enters → computed properties recalculate (Vue reactivity)
    ↓
Charts re-render with updated data automatically
    ↓
No manual refresh or API call needed for local metrics
```

---

## 📁 File Structure

```
pages/progress.vue                    → Main progress page (detail layout)
components/HomePage/DateHeader.vue    → 🔥 streak icon → navigateTo('/progress')
stores/stores/user_streak.ts          → Streak data from backend
stores/stores/user_journal.ts         → Local journal data (SQLite)
stores/stores/user_learned.ts         → Local learned data (SQLite)
plugins/echarts.client.ts             → ECharts plugin setup
```

---

## 📦 Dependencies

### Frontend (Already Installed)
- `echarts`: ^5.6.0 — Chart rendering engine
- `vue-echarts`: ^7.0.3 — Vue 3 wrapper for ECharts
- `lucide-vue-next` — Icons (Flame, CalendarCheck, Trophy, SmilePlus)

### Backend (Already Exists)
- `GET /v1/user_streaks` — Streak data (current, longest, total)
- `PUT /v1/user_streaks` — Update streak on journal save
- `GET /v1/emotion_log` — Emotion log history (optional enhancement)

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| **Progress page load** | < 500ms (data is local) |
| **Chart render** | < 300ms (ECharts) |
| **Metric computation** | < 100ms (client-side, even with 1000+ journals) |

### Performance Notes
- All data is already in memory (Pinia stores loaded from SQLite at app init)
- No API calls needed except streak data (cached after first fetch)
- ECharts lazy-loaded via client-side plugin (no SSR overhead)
- Heatmap limited to last 6 months to keep chart performant

---

## 🔮 Future Enhancements

- [ ] Time period toggle (filter metrics by Daily/Weekly/Monthly/All Time)
- [ ] Sentiment trend line chart (mood_score over time)
- [ ] Learning section (lessons completed, topic distribution)
- [ ] Export as screenshot (html2canvas → Capacitor Filesystem)
- [ ] Sleep quality trend (if sleep_check data is tracked)
- [ ] AI-generated insights ("Your mood improved by 15% this month")

---

**Last Updated**: February 28, 2026
