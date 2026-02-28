# 📊 Progress Tracking - Overview

## 🎯 Purpose

Provide users with clear, informative insights into their journaling habits and learning journey. The Progress screen consolidates metrics from journaling and learning features, helping users see their growth, patterns, and engagement without pressure or gamification.

## 📊 Status

- **Current Status**: 🔄 In Progress (basic stats page exists, charts pending)
- **Priority**: Medium
- **Target Release**: v1.0
- **Dependencies**: 
  - Journaling feature ✅
  - Micro Learning feature ✅
  - `user_streaks` table ✅ (backend)
  - `user_learned_slide_groups` table ✅ (backend)
  - Local SQLite journals ✅ (client-side metric computation)

## 🎨 User Value

- **Self-awareness**: Understand journaling patterns and emotional trends
- **Growth visibility**: See learning progress and topic exploration
- **Informed reflection**: Data-driven insights for therapy discussions
- **Habit tracking**: Monitor consistency without pressure
- **Exportable insights**: Generate reports for personal use or therapist sharing

## 🔑 Key Features

### Core Progress Display
- **Detail Page**: Accessed by tapping the 🔥 streak icon in the Home screen `DateHeader` component
- **Layout**: Uses `detail` layout (back button, no bottom nav) — page at `pages/progress.vue`
- **Client-Side Computation**: All metrics computed locally from SQLite journals (offline-first)
- **Backend Streaks**: `user_streaks` table provides current_streak, longest_streak, total_entries

### Journaling Metrics (Priority #1 — ✅ Partially Implemented)
- **Entry Count**: Total journal entries ✅
- **Streak Tracking**: Current streak + longest streak (with 🔥 icon) ✅
- **Word Count**: Total words written (strips HTML/TipTap JSON) ✅
- **Average Mood**: Mapped from mood_score (1-10 scale) to labels ✅
- **Total Completed Days**: Unique journaling days ✅
- **Emotion Distribution**: Pie/radar chart showing emotion frequency 🔜
- **Journaling Heatmap**: GitHub-style calendar showing journaling activity 🔜

### Learning Metrics (Secondary — Not Yet Implemented)
- **Total Lessons Completed**: Counter from `useLearnedStore` 🔜
- **Recently Completed**: Last lessons with completion dates 🔜

### Empty State Handling ✅
- **Quick Action**: "Start Journaling" button
- **Encouraging Tone**: Gentle invitation to start journey

## 📋 Success Criteria

- [ ] Progress page loads within 1 second
- [ ] Metrics computed from local SQLite journals (offline-first)
- [ ] Emotion distribution chart renders correctly (ECharts)
- [ ] Journaling heatmap calendar renders correctly (ECharts)
- [ ] Charts are accessible and readable (WCAG AA)
- [ ] Empty state is clear and actionable
- [ ] Users understand their metrics without confusion
- [ ] No performance impact when computing metrics from large journal sets

## 🔗 Related Features

- **[Journaling](../02.%20Jounral%20Feature/)** - Primary data source for journaling metrics
- **[Micro Learning](../03.%20Micro%20learning/)** - Source for learning progress
- **[Database Schema](../00-DATABASE/)** - `user_streaks`, `user_learned_slide_groups`
- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile accessed from Home screen top-right icon

## 📝 Notes

### Design Decisions

1. **Why Detail Page (Not Bottom Navigation)?**
   - Progress is secondary to the core journaling workflow
   - Accessed via the 🔥 streak icon in `DateHeader` on the Home screen
   - Keeps bottom nav focused: Home → Journaling → Library
   - Less cluttered navigation, intentional access when user wants stats
   - Uses `detail` layout with back button for clean navigation

2. **Why Client-Side Metric Computation (Not Backend Aggregation)?**
   - Offline-first: Works without internet (journals stored in SQLite)
   - No additional backend tables needed (simpler architecture)
   - Instant: No API call latency for metric display
   - Data already available locally via `userJournalStore`
   - Streak data from backend (`user_streaks`) supplements local computation

2. **Why Journaling Metrics First?**
   - Core feature of the app (therapeutic journaling)
   - More data-rich (sentiment, emotions, sleep, streaks)
   - Primary value proposition for mental health focus
   - Learning is supplementary (educational, not treatment)

3. **Why "Informational Only" (No Gamification)?**
   - Avoids pressure or guilt ("I broke my streak!")
   - Mental health focus: progress without judgment
   - Streak tracking is observational, not competitive
   - No badges, milestones, or congratulatory popups
   - Users in crisis shouldn't feel "behind"

4. **Why Immediate Refresh on Page Visit?**
   - Metrics recompute from local SQLite on each page load (fast, no API delay)
   - Streak data fetched from backend if not cached
   - No WebSocket or polling needed — data is local
   - User navigates back from journaling → progress page recomputes

5. **Why Mixed Visualization Style?**
   - Numbers for quick scanning (entry count, streak, lessons)
   - Charts for trend analysis (sentiment line chart, topic distribution)
   - Balance: not overwhelming, not too sparse
   - Accessible to different user preferences (visual vs. numeric)

6. **Why No Time Period Toggle for v1.0?**
   - Client-side computation always uses all local journals (no period filtering yet)
   - Simpler UX: users see their all-time stats on first visit
   - Period filtering is a future enhancement when data grows large
   - Heatmap calendar provides visual time context instead

7. **Why ECharts for Charts?**
   - Already installed in project (`echarts ^5.6.0`, `vue-echarts ^7.0.3`)
   - Rich chart types: heatmap calendar, pie/radar, line charts
   - Good mobile performance with Capacitor
   - Plugin already set up: `plugins/echarts.client.ts`

### Metric Calculation Strategy

**Client-Side Computation Approach:**

```
User Opens Progress Page (taps 🔥 streak icon)
    ↓
Frontend reads local SQLite journals (userJournalStore)
    ↓
Computed properties calculate:
  - totalCompletedDays (unique dates)
  - totalWordsWritten (strip HTML/TipTap → word count)
  - averageMoodLabel (mood_score avg → label mapping)
  - emotionDistribution (group emotion_logs by emotion)
  - heatmapData (journal dates → calendar grid)
    ↓
Streak data from backend (useUserStreakStore)
  - currentStreak, longestStreak, totalEntries
    ↓
ECharts renders emotion distribution + heatmap
    ↓
UI displays immediately (no API wait)
```

**Data Sources:**
- `userJournalStore.journals` — local SQLite via `JournalsRepository`
- `useUserStreakStore` — backend `GET /v1/user_streaks`
- `useLearnedStore` — local SQLite via `LearnedRepository`

### Empty State Philosophy

**Goal**: Encourage without pressure

**Bad Example** (avoid):
> "You haven't journaled yet. Start now to see your progress!"

**Good Example** (use):
> "Your progress journey starts here. Write your first journal to begin tracking your reflections."

**Visual Design**:
- Grayed-out metrics with sample values
- Soft illustrations (not harsh empty boxes)
- Clear CTA button at top: "Start Journaling"
- Show one sample chart (with placeholder data) so users understand what they'll see

### Accessibility Considerations

- **Color Blindness**: Charts use patterns + colors (not color alone)
- **Screen Readers**: All metrics have descriptive labels
- **Font Size**: Respects system font scaling
- **Contrast**: WCAG AA compliance for all text/charts
- **Touch Targets**: Buttons/toggles meet 44x44px minimum
- **Motion**: Respect `prefers-reduced-motion` for chart animations

### Future Enhancements

- [ ] Time period toggle (Daily / Weekly / Monthly / All Time)
- [ ] Sentiment trend line chart (mood_score over time)
- [ ] Compare time periods (This Week vs. Last Week)
- [ ] AI-generated insights ("Your mood improved by 15% this month")
- [ ] Custom date range picker
- [ ] Export progress as PDF or screenshot
- [ ] Share progress directly to therapist (secure, consent-based)
- [ ] Learning topic distribution chart
- [ ] Weekly summary notifications (opt-in)

---

**Last Updated**: February 28, 2026
