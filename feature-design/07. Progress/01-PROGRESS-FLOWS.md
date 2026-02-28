# 🗺️ Progress Tracking - User Flows

## Overview

This document outlines all user journeys within the Progress feature. The Progress page is a **detail page** accessed via the 🔥 streak icon on the Home screen — not a bottom navigation tab.

---

## Flow A: Navigate to Progress Page

```mermaid
flowchart TD
    A[User on Home Screen] --> B[DateHeader Component]
    B --> C[🔥 Streak Icon with Count]
    
    C --> D{User Taps Streak Icon}
    D -->|Tap| E[router.push /progress]
    D -->|No Tap| F[Stay on Home]
    
    E --> G[pages/progress.vue loads]
    G --> H[Layout: detail with back button]
    
    H --> I{Has Journal Data?}
    I -->|Yes| J[Compute Metrics from Local SQLite]
    I -->|No| K[Show Empty State]
    
    J --> L[Display Stats Page with Charts]
    K --> M[Start Journaling CTA]
    
    M --> N{User Taps CTA}
    N -->|Yes| O[Navigate to /journaling]
    N -->|No| M
```

**Entry Point**: 🔥 streak icon in `components/HomePage/DateHeader.vue`
**Result**: User lands on Progress page with either real metrics or empty state.

---

## Flow B: View Progress Metrics

```mermaid
flowchart TD
    A[Progress Page Loaded] --> B[onMounted Hook]
    
    B --> C{streakStore has data?}
    C -->|No| D[Fetch from Backend<br/>GET /v1/user_streaks]
    C -->|Yes| E[Use Cached Streak]
    
    D --> E
    E --> F[Read journalStore.journals<br/>Already in memory from SQLite]
    
    F --> G[Vue Computed Properties Calculate:]
    G --> H[Summary Cards:<br/>📝 Total Completed Days<br/>📊 Words Written<br/>😊 Avg Mood<br/>📓 Journal Entries]
    
    H --> I[General Section:<br/>🔥 Current Streak<br/>📅 Total Completed Days<br/>🏆 Longest Streak<br/>😊 Average Mood]
    
    I --> J[Charts Section:<br/>🎨 Emotion Distribution Pie<br/>📅 Journaling Heatmap Calendar]
    
    J --> K[User Scrolls to View All]
    K --> L{User Action}
    L -->|Back Button| M[Return to Home]
    L -->|Continue Viewing| K
```

**Data Sources**: Local SQLite journals + backend streak API
**Result**: User sees comprehensive stats with charts.

---

## Flow C: View Emotion Distribution Chart

```mermaid
flowchart TD
    A[User on Progress Page] --> B[Scroll to Emotion Distribution]
    B --> C[ECharts Pie Chart Shows:<br/>Emotion Frequency]
    
    C --> D[Example:<br/>😌 Calm: 15<br/>😟 Anxious: 8<br/>😊 Happy: 7<br/>😔 Sad: 4<br/>😠 Frustrated: 3]
    
    D --> E{User Interacts}
    E -->|Tap Slice| F[Tooltip Shows:<br/>Emotion: Calm<br/>Count: 15 37%]
    E -->|No Interaction| G[Continue Scrolling]
    
    F --> H[User Gains Insight:<br/>What are my dominant emotions?]
    G --> I[View Heatmap Below]
```

**Chart Library**: ECharts via vue-echarts
**Result**: Users see their emotion patterns at a glance.

---

## Flow D: View Journaling Heatmap

```mermaid
flowchart TD
    A[User on Progress Page] --> B[Scroll to Heatmap Section]
    B --> C[ECharts Calendar Heatmap:<br/>GitHub-style grid<br/>Last 6 months]
    
    C --> D[Color Intensity:<br/>⬜ No entries<br/>🟩 1 entry<br/>🟩🟩 2-3 entries<br/>🟩🟩🟩 4+ entries]
    
    D --> E{User Interacts}
    E -->|Tap Cell| F[Tooltip Shows:<br/>Date: Jan 15, 2026<br/>Entries: 2]
    E -->|Visual Scan| G[User Sees Patterns:<br/>Which days do I journal?<br/>Any gaps in consistency?]
    
    F --> G
    G --> H[Insight for Therapy:<br/>Identify journaling habits]
```

**Result**: Users visualize their journaling consistency over time.

---

## Flow E: Metrics Refresh After Journaling

```mermaid
flowchart TD
    A[User on Progress Page] --> B[Taps Back Button]
    B --> C[Returns to Home Screen]
    C --> D[Taps Journal Tab]
    D --> E[Writes New Journal Entry]
    E --> F[Saves Journal]
    
    F --> G[Journal Saved to Local SQLite]
    G --> H[journalStore.journals Updated]
    
    H --> I[User Returns to Home]
    I --> J[Taps 🔥 Streak Icon]
    J --> K[Progress Page Loads]
    
    K --> L[Computed Properties Recalculate]
    L --> M[All Metrics Updated:<br/>Entry Count +1<br/>Words Written +N<br/>Heatmap adds today<br/>Emotion chart updates]
    
    M --> N[Charts Re-render<br/>No Manual Refresh Needed]
```

**Key Point**: No WebSocket or polling — Vue reactivity handles updates when the page re-enters.
**Result**: Metrics update seamlessly when user navigates to Progress after journaling.

---

## Flow F: Empty State (New User)

```mermaid
flowchart TD
    A[New User on Home Screen] --> B[Sees 🔥 0 Streak]
    B --> C[Taps Streak Icon]
    C --> D[Progress Page Loads]
    
    D --> E[streakStore.totalEntries === 0]
    E --> F[Show Empty State]
    
    F --> G[Message: Your progress journey<br/>starts here. Write your first<br/>journal to begin tracking.]
    
    G --> H[Start Journaling Button]
    H --> I{User Taps}
    I -->|Yes| J[Navigate to /journaling]
    I -->|No| K[User Explores Empty Page]
    
    J --> L[User Writes First Journal]
    L --> M[Saves and Returns]
    M --> N[Next Visit to Progress:<br/>Metrics appear!]
```

**Result**: New users understand what will be tracked and have a clear path to start.

---

## Summary: Key User Paths

| Flow | Entry Point | Exit Point | Key Data |
|------|-------------|------------|----------|
| **Navigate to Progress** | 🔥 Streak icon (Home) | Progress detail page | Local SQLite + backend streak |
| **View Metrics** | Progress page | Scrollable stats view | Computed from journals |
| **Emotion Distribution** | Charts section | Pie chart tooltip | Grouped emotion_log data |
| **Journaling Heatmap** | Charts section | Calendar grid tooltip | Journal dates → day counts |
| **Metric Refresh** | After journaling | Updated progress page | Vue reactivity recomputes |
| **Empty State** | New user, 0 entries | Start Journaling CTA | Empty + encouraging message |

---

**Last Updated**: February 28, 2026
