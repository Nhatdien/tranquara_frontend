# 🗺️ Progress Tracking - User Flows

## Overview

This document outlines all user journeys within the Progress feature, from navigating to the tab to viewing metrics, toggling time periods, and exporting reports.

---

## Flow A: Navigate to Progress Tab

```mermaid
flowchart TD
    A[User Opens App] --> B[Home Screen]
    B --> C{Bottom Navigation}
    
    C -->|Tap Home| B
    C -->|Tap Journal| D[Journal Tab]
    C -->|Tap Progress| E[Progress Tab]
    C -->|Tap Library| F[Library Tab]
    
    E --> G{Has Data?}
    G -->|Yes| H[Load Progress Screen<br/>with Metrics]
    G -->|No| I[Show Empty State<br/>Sample Metrics Grayed]
    
    I --> J[Quick Action Button<br/>Start Journaling]
    J --> K{User Taps Button}
    K -->|Yes| D
    K -->|No| I
    
    H --> L[Display Metrics<br/>Default: Last 30 Days]
```

**Result**: User lands on Progress screen with either real metrics or empty state.

---

## Flow B: View Progress Metrics (Default: Last 30 Days)

```mermaid
flowchart TD
    A[Progress Screen Loaded] --> B[Fetch Metrics from Backend]
    B --> C[GET /api/progress/summary<br/>?period=30d]
    
    C --> D[Backend Queries:<br/>- journal_metrics_daily<br/>- user_metrics<br/>- lesson_progress_metrics]
    
    D --> E[Return Aggregated Data]
    E --> F[Frontend Renders<br/>Metrics Sections]
    
    F --> G[Journaling Section TOP]
    G --> H[Display Cards:<br/>📝 Entry Count<br/>🔥 Streak Current/Longest<br/>📊 Word Count]
    
    H --> I[Charts:<br/>📈 Sentiment Trend Line<br/>😴 Sleep Quality Line<br/>🎨 Emotion Variety Bar<br/>🏷️ Dominant Emotions Tags]
    
    I --> J[Learning Section BOTTOM]
    J --> K[Display Cards:<br/>📚 Total Lessons<br/>🗂️ Topic Distribution Chart<br/>📖 Recently Completed List]
    
    K --> L[User Scrolls to View All]
    L --> M{User Action}
    M -->|Tap Time Period| N[Flow C: Toggle Period]
    M -->|Tap Export| O[Flow D: Export Report]
    M -->|Tap Lesson in Recent| P[Navigate to Lesson Detail]
    M -->|Back to Top| G
```

**Result**: User sees comprehensive view of their journaling and learning progress.

---

## Flow C: Toggle Time Period

```mermaid
flowchart TD
    A[User on Progress Screen] --> B[Time Period Toggle<br/>Daily | Weekly | Monthly | All Time]
    B --> C[Current: Last 30 Days selected]
    
    C --> D{User Taps Period}
    D -->|Daily| E[Fetch Today's Metrics]
    D -->|Weekly| F[Fetch Last 7 Days]
    D -->|Monthly| G[Fetch Last 30 Days DEFAULT]
    D -->|All Time| H[Fetch All User Data]
    
    E --> I[Update URL Parameter<br/>?period=1d]
    F --> J[Update URL Parameter<br/>?period=7d]
    G --> K[Update URL Parameter<br/>?period=30d]
    H --> L[Update URL Parameter<br/>?period=all]
    
    I --> M[Backend Query:<br/>Filter by Date Range]
    J --> M
    K --> M
    L --> M
    
    M --> N[Recalculate Metrics<br/>for Selected Period]
    N --> O[Return New Data]
    
    O --> P[Frontend Updates:]
    P --> Q[Entry Count changes<br/>Streak recalculated if not All Time<br/>Charts re-render with new data]
    
    Q --> R[Show Loading Indicator<br/>during Transition]
    R --> S[Smooth Animation<br/>Charts/Numbers Update]
    
    S --> T[User Sees Updated Metrics<br/>for New Time Period]
```

**Result**: Metrics dynamically update to reflect selected time period.

---

## Flow D: Export Progress Report

```mermaid
flowchart TD
    A[User on Progress Screen] --> B[Tap Export Button<br/>Top-Right Corner]
    B --> C[Export Modal Opens]
    
    C --> D[Options:<br/>📄 PDF<br/>📸 Screenshot<br/>❌ Cancel]
    
    D --> E{User Selects}
    E -->|PDF| F[Generate PDF Request]
    E -->|Screenshot| G[Capture Current View]
    E -->|Cancel| H[Close Modal]
    
    F --> I[POST /api/progress/export<br/>period=30d&format=pdf]
    I --> J[Backend:<br/>1. Fetch current metrics<br/>2. Render PDF template<br/>3. Return PDF blob]
    
    J --> K[Download PDF<br/>filename: progress_YYYY-MM-DD.pdf]
    K --> L[Success Toast:<br/>Report downloaded!]
    
    G --> M[Use Native Screenshot<br/>or HTML Canvas]
    M --> N[Save to Photos/Downloads]
    N --> O[Success Toast:<br/>Screenshot saved!]
    
    L --> P[User Can Share File<br/>via Native Share Sheet]
    O --> P
    H --> Q[Return to Progress Screen]
    P --> Q
```

**Result**: User exports progress as PDF or screenshot for personal use or therapist sharing.

---

## Flow E: Real-Time Metric Updates

```mermaid
flowchart TD
    A[User on Progress Screen<br/>Viewing Last 30 Days] --> B[Switch to Journal Tab]
    B --> C[Write New Journal Entry]
    C --> D[Save Journal]
    
    D --> E[Backend:<br/>1. Save to user_journals<br/>2. Trigger Metric Update]
    
    E --> F[Update journal_metrics_daily<br/>for Today's Date]
    F --> G[Recalculate:<br/>- Entry Count +1<br/>- Streak if consecutive<br/>- Sentiment analysis<br/>- Emotion extraction<br/>- Word count +N]
    
    G --> H[Publish WebSocket Event<br/>OR Set Update Flag]
    
    H --> I{User Still on Progress Tab?}
    I -->|No switched away| J[Flag for Next Load]
    I -->|Yes| K[Frontend Receives Update]
    
    K --> L[Fetch Latest Metrics<br/>GET /api/progress/summary]
    L --> M[Backend Returns:<br/>Updated Entry Count<br/>New Streak if changed<br/>Recalculated charts]
    
    M --> N[Frontend Updates UI:<br/>Numbers increment smoothly<br/>Charts re-render<br/>Dominant emotions update]
    
    N --> O[User Sees:<br/>Entry Count: 12 → 13<br/>Streak: 2 → 3 days 🔥<br/>Sentiment chart adds point]
    
    O --> P[No Manual Refresh Needed]
    
    J --> Q[Next Time User Visits<br/>Progress Tab]
    Q --> K
```

**Result**: Metrics update immediately when user creates journal entry or completes lesson, even if Progress tab is open.

---

## Flow F: View Sentiment Trend Chart (Drill-Down)

```mermaid
flowchart TD
    A[User on Progress Screen] --> B[Scroll to Sentiment Chart]
    B --> C[Line Chart Shows:<br/>Last 30 Days Sentiment<br/>Y-axis: -1 to +1<br/>X-axis: Dates]
    
    C --> D{User Interaction}
    D -->|Tap/Hover Data Point| E[Tooltip Shows:<br/>Date: Nov 15<br/>Sentiment: +0.6 Positive<br/>Entries: 2]
    D -->|Pinch/Zoom optional| F[Zoom into Date Range]
    D -->|Scroll Past| G[Continue to Sleep Chart]
    
    E --> H[User Sees Daily Detail<br/>Can Tap to View Journals]
    H --> I{Tap Date}
    I -->|Yes| J[Navigate to Journal History<br/>Filtered by Nov 15]
    I -->|No| K[Close Tooltip]
    
    J --> L[Journal Tab<br/>Shows Entries from Nov 15]
    L --> M[User Reads Journal Context]
    
    K --> C
    G --> N[View Sleep Chart Next]
```

**Result**: Users can drill down into specific dates from charts to see related journal entries.

---

## Flow G: Empty State (New User)

```mermaid
flowchart TD
    A[New User First Opens App] --> B[Navigate to Progress Tab]
    B --> C[Backend Query Returns:<br/>No journal entries<br/>No completed lessons]
    
    C --> D[Frontend Renders<br/>Empty State Screen]
    
    D --> E[Top Section:<br/>Start Journaling Button<br/>Write your first journal to<br/>begin tracking your reflections]
    
    E --> F[Grayed-Out Metrics<br/>with Sample Data]
    
    F --> G[Journaling Section SAMPLE]
    G --> H[📝 Entry Count: 0<br/>Placeholder: Will show entries]
    
    H --> I[🔥 Streak: 0 days<br/>Placeholder: Track consistency]
    
    I --> J[📊 Word Count: 0<br/>Placeholder: Total words written]
    
    J --> K[📈 Sentiment Chart<br/>Grayed dotted line<br/>Label: Your mood trend]
    
    K --> L[Learning Section SAMPLE]
    L --> M[📚 Lessons: 0<br/>Placeholder: Start learning]
    
    M --> N{User Action}
    N -->|Tap Start Journaling| O[Navigate to Journal Tab<br/>Pre-fill Quick Prompt]
    N -->|Tap Start Learning| P[Navigate to Library Tab]
    N -->|Just Exploring| Q[Scroll to See All Placeholders]
    
    O --> R[User Writes First Journal]
    R --> S[Save Entry]
    S --> T[Return to Progress]
    T --> U[Empty State → Real Data<br/>Entry Count: 0 → 1<br/>Streak: 0 → 1 day 🔥]
```

**Result**: New users understand what will be tracked and have clear path to start.

---

## Flow H: View Dominant Emotions

```mermaid
flowchart TD
    A[User on Progress Screen] --> B[Scroll to Dominant Emotions Section]
    B --> C[Display Top 5 Emotions<br/>Based on Frequency]
    
    C --> D[Emotion Tags with Count:<br/>😌 Calm: 15<br/>😟 Anxious: 8<br/>😊 Happy: 7<br/>😔 Sad: 4<br/>😠 Frustrated: 3]
    
    D --> E{User Taps Emotion Tag}
    E -->|Tap Calm| F[Filter Journal History<br/>Show entries tagged Calm]
    E -->|Tap Anxious| G[Filter Journal History<br/>Show entries tagged Anxious]
    E -->|No Tap| H[Continue Scrolling]
    
    F --> I[Navigate to Journal Tab<br/>Filtered View: Calm Entries]
    G --> I
    
    I --> J[User Reads Past Journals<br/>with That Emotion]
    J --> K[Context for Therapy:<br/>What triggers calm?<br/>What causes anxiety?]
    
    H --> L[View Other Metrics]
```

**Result**: Users can explore patterns by filtering journals by dominant emotions.

---

## Flow I: View Learning Topic Distribution

```mermaid
flowchart TD
    A[User on Progress Screen] --> B[Scroll to Learning Section]
    B --> C[Topic Distribution Chart<br/>Radar or Pie Chart]
    
    C --> D[Shows Categories:<br/>Mindfulness: 6 lessons<br/>Stress Management: 3<br/>Therapy Prep: 8<br/>Emotional Regulation: 4<br/>Journaling Basics: 5]
    
    D --> E{User Interaction}
    E -->|Tap Category Slice| F[Highlight Category<br/>Show Tooltip: Therapy Prep 8]
    E -->|Hover/View| G[See Distribution Balance]
    E -->|No Interaction| H[Continue to Recent Lessons]
    
    F --> I{Tap Again or Action Button}
    I -->|View Lessons| J[Navigate to Library<br/>Filter: Therapy Prep]
    I -->|Close Tooltip| D
    
    J --> K[Library Tab Shows<br/>Only Therapy Prep Lessons]
    K --> L[User Browses Category]
    
    G --> M[User Notes:<br/>I focus more on therapy prep<br/>Should explore mindfulness more]
    
    H --> N[View Recently Completed List]
```

**Result**: Users see learning balance and can navigate to specific categories.

---

## Flow J: View Recently Completed Lessons

```mermaid
flowchart TD
    A[User on Progress Screen] --> B[Scroll to Recently Completed]
    B --> C[List Shows Last 3 Lessons:<br/>1. What to Expect in Therapy Nov 22<br/>2. Managing Anxiety Nov 20<br/>3. Journaling Basics Nov 18]
    
    C --> D{User Taps Lesson}
    D -->|Tap Lesson 1| E[Navigate to Lesson Detail<br/>What to Expect in Therapy]
    D -->|Tap Lesson 2| F[Navigate to Managing Anxiety]
    D -->|No Tap| G[Continue Viewing]
    
    E --> H[Lesson Detail Screen<br/>Shows Completed Badge]
    H --> I{User Action}
    I -->|Retake Lesson| J[Start Lesson Slides]
    I -->|View Related Journal| K[Filter Journals from Lesson]
    I -->|Back| L[Return to Progress]
    
    F --> H
    G --> M[End of Progress Screen]
```

**Result**: Users can quickly revisit recently completed lessons.

---

## Summary: Key User Paths

| Flow | Entry Point | Exit Point | Key Data |
|------|-------------|------------|----------|
| **Navigate to Progress** | Bottom Nav | Progress Screen | Load metrics for 30 days |
| **View Metrics** | Progress Screen | Scrollable View | journal_metrics, learning_metrics |
| **Toggle Period** | Time Period Toggle | Updated Metrics | Recalculated for period |
| **Export Report** | Export Button | Downloaded PDF/Screenshot | Current view snapshot |
| **Real-Time Update** | Background (Journal/Lesson) | UI Auto-Refresh | WebSocket or polling |
| **Drill-Down Chart** | Tap Chart Point | Journal History Filtered | Date-specific entries |
| **Empty State** | New User | Start Journaling CTA | Sample metrics |
| **View Emotions** | Dominant Emotions | Filtered Journals | Emotion-tagged entries |
| **Topic Distribution** | Learning Section | Library Filtered | Category lessons |
| **Recent Lessons** | Recently Completed | Lesson Detail | Last 3 completions |

---

**Last Updated**: November 23, 2025
