# 📊 Progress Tracking Feature

> Informative insights into journaling habits — accessed via the 🔥 streak icon

---

## 📑 Core Documentation

| File | Description |
|------|-------------|
| **[00-OVERVIEW.md](./00-OVERVIEW.md)** | Feature purpose, user value, and design decisions |
| **[01-PROGRESS-FLOWS.md](./01-PROGRESS-FLOWS.md)** | User journeys with Mermaid diagrams for all flows |
| **[02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md)** | Client-side architecture, ECharts charts, metric computation |
| **[03-DATA-MODELS.md](./03-DATA-MODELS.md)** | Data sources: local SQLite + backend streak API |

---

## 🎯 Quick Summary

**Status**: 🔄 In Progress (basic stats page exists, charts pending)
**Priority**: Medium
**Target**: v1.0

### What This Feature Does

Users get:
- **Detail page**: Accessed by tapping the 🔥 streak icon on the Home screen (`DateHeader`)
- **Summary cards**: Total completed days, words written, avg mood, journal entries
- **General stats**: Current streak, longest streak, total days, avg mood
- **Emotion distribution chart**: ECharts pie/donut showing emotion frequency 🔜
- **Journaling heatmap**: GitHub-style calendar showing journaling activity 🔜
- **Empty state**: "Start journaling" CTA with encouraging message ✅

### Architecture Approach

- **Client-side computation**: All metrics computed from local SQLite journals (offline-first)
- **No backend aggregation tables**: No `journal_metrics_daily`, no `user_metrics`
- **Backend streak only**: `user_streaks` table provides streak data via API
- **ECharts for charts**: Already installed (`echarts ^5.6.0`, `vue-echarts ^7.0.3`)
- **No WebSocket/polling**: Vue reactivity handles updates on page re-entry

### Design Philosophy

- **Informational, not gamified**: No pressure, badges, or congratulatory messages
- **Journaling metrics prioritized**: Mental health focus
- **Offline-first**: Works without internet (data in local SQLite)
- **Simple navigation**: Detail page from streak icon, not bottom nav tab

---

## 📊 Metrics Displayed

### Summary Cards (✅ Implemented)
- **📅 Total Completed Days**: Unique journaling days
- **📊 Words Written**: Total across all journals
- **😊 Avg Mood**: Mood score average mapped to label
- **📓 Journal Entries**: Total count (from streak store)

### General Section (✅ Implemented)
- **🔥 Current Streak**: Consecutive journaling days
- **📅 Total Completed Days**: Unique journaling days
- **🏆 Longest Streak**: All-time best
- **😊 Average Mood**: Mood label

### Charts (🔜 To Implement)
- **🎨 Emotion Distribution**: Pie chart showing emotion frequency
- **📅 Journaling Heatmap**: Calendar heatmap (GitHub-style, last 6 months)

---

## 🔧 Technology

- **Frontend**: Nuxt 3 + Vue 3 + Capacitor
- **Charts**: ECharts (`echarts ^5.6.0`) + vue-echarts (`^7.0.3`)
- **Data**: Local SQLite (journals) + Backend PostgreSQL (streaks)
- **Navigation**: Detail page via `DateHeader` streak icon → `router.push('/progress')`
- **Layout**: `detail` layout (back button, no bottom nav)

---

## 📁 Key Files

```
pages/progress.vue                    → Main progress page
components/HomePage/DateHeader.vue    → 🔥 streak icon entry point
stores/stores/user_streak.ts          → Streak data (backend)
stores/stores/user_journal.ts         → Journal data (local SQLite)
stores/stores/user_learned.ts         → Learned data (local SQLite)
plugins/echarts.client.ts             → ECharts setup
```

---

## 🔗 Related Features

- **[Journaling](../02.%20Jounral%20Feature/)** - Primary data source (journals, emotions, mood)
- **[Micro Learning](../03.%20Micro%20learning/)** - Learning progress data (future)
- **[Database Schema](../00-DATABASE/)** - `user_streaks`, `user_learned_slide_groups`

---

## 🚀 Implementation Status

**Implemented:**
- [x] Progress page with summary cards and general stats section
- [x] Streak data from backend (`useUserStreakStore`)
- [x] Client-side metrics: totalCompletedDays, totalWordsWritten, averageMoodLabel
- [x] Empty state with "Start Journaling" CTA
- [x] Navigation via 🔥 streak icon in DateHeader
- [x] Detail layout with back button

**To Implement:**
- [ ] Emotion distribution chart (ECharts pie/donut)
- [ ] Journaling heatmap calendar (ECharts calendar heatmap)
- [ ] Learning section (lessons completed from learned store)

**Future:**
- [ ] Time period toggle (Daily/Weekly/Monthly/All Time)
- [ ] Sentiment trend line chart (mood over time)
- [ ] Export as screenshot
- [ ] AI-generated insights

---

## 📱 UI Preview (Current)

```
┌─────────────────────────────────┐
│  ← Back        Stats           │ ← Header (detail layout)
├─────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐     │
│  │   23    │  │ 12,450  │     │
│  │Completed│  │  Words  │     │
│  │  Days   │  │ Written │     │
│  └─────────┘  └─────────┘     │
│  ┌─────────┐  ┌─────────┐     │
│  │  Good   │  │   47    │     │
│  │Avg Mood │  │ Entries │     │
│  └─────────┘  └─────────┘     │
│                                 │
│  ── GENERAL ──                  │
│  🔥 Current streak    5 days   │
│  📅 Total days        23 days  │
│  🏆 Longest streak    12 days  │
│  😊 Average mood      Good     │
│                                 │
│  ── EMOTIONS ──          🔜    │
│  [Pie Chart: Emotion Freq]     │
│                                 │
│  ── ACTIVITY ──          🔜    │
│  [Heatmap Calendar Grid]       │
└─────────────────────────────────┘
```

---

## 🔮 Future Enhancements

- [ ] Time period toggle
- [ ] Sentiment trend line chart
- [ ] Learning topic distribution
- [ ] Export as PDF/screenshot
- [ ] AI-generated insights
- [ ] Compare time periods

---

**Last Updated**: February 28, 2026
