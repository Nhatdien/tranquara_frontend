# 📊 Progress Tracking - Overview

## 🎯 Purpose

Provide users with clear, informative insights into their journaling habits and learning journey. The Progress screen consolidates metrics from journaling and learning features, helping users see their growth, patterns, and engagement without pressure or gamification.

## 📊 Status

- **Current Status**: 🧠 Planned
- **Priority**: High (P0)
- **Target Release**: v1.0
- **Dependencies**: 
  - Journaling feature ✅
  - Micro Learning feature ✅
  - Database metrics tables (`journal_metrics_daily`, `user_metrics`, `lesson_progress_metrics`)
  - Real-time metric calculation system

## 🎨 User Value

- **Self-awareness**: Understand journaling patterns and emotional trends
- **Growth visibility**: See learning progress and topic exploration
- **Informed reflection**: Data-driven insights for therapy discussions
- **Habit tracking**: Monitor consistency without pressure
- **Exportable insights**: Generate reports for personal use or therapist sharing

## 🔑 Key Features

### Core Progress Display
- **Bottom Navigation Tab**: Quick access between Journal, Progress, and Library
- **Time Period Toggle**: View metrics for Daily / Weekly / Monthly / All Time
- **Default View**: Last 30 days
- **Real-Time Updates**: Metrics refresh immediately after journaling or completing lessons

### Journaling Metrics (Priority #1)
- **Entry Count**: Total journal entries in selected period
- **Streak Tracking**: Current streak + longest streak (with 🔥 icon)
- **Word Count**: Total words written
- **Sentiment Trend**: Mood chart showing positive/negative patterns over time
- **Sleep Quality Trend**: Line chart from sleep_check slides
- **Emotion Variety**: Diversity index of emotions expressed (0-1 scale)
- **Dominant Emotions**: Top 3-5 most frequent emotions (calm, anxious, happy, etc.)

### Learning Metrics (Secondary)
- **Total Lessons Completed**: Simple counter
- **Topic Distribution**: Radar or pie chart showing category breakdown
- **Recently Completed**: Last 3 lessons with completion dates

### Data Export
- **Export Progress Report**: Generate PDF or screenshot of current view
- **Share-Ready Format**: Formatted for therapist review (future: direct share)

### Empty State Handling
- **Quick Action**: "Write your first journal" button at top
- **Sample Metrics**: Grayed-out placeholders showing what will be tracked
- **Encouraging Tone**: Gentle invitation to start journey

## 📋 Success Criteria

- [ ] Progress tab loads within 1 second
- [ ] Metrics update in real-time after journaling/learning actions
- [ ] Time period toggle works smoothly without lag
- [ ] Charts are accessible and readable (WCAG AA)
- [ ] Export generates clean, shareable PDF
- [ ] Empty state is clear and actionable
- [ ] Users understand their metrics without confusion
- [ ] No performance impact when calculating metrics for large datasets

## 🔗 Related Features

- **[Journaling](../02.%20Jounral%20Feature/)** - Primary data source for journaling metrics
- **[Micro Learning](../03.%20Micro%20learning/)** - Source for learning progress
- **[Database Schema](../00-DATABASE/)** - `journal_metrics_daily`, `user_metrics`, `lesson_progress_metrics`
- **[User Settings](../06.%20User%20profile%20and%20Settings/)** - Profile accessed from Home screen (not bottom nav)

## 📝 Notes

### Design Decisions

1. **Why Bottom Navigation for Progress?**
   - Central to user experience (equal importance to Journal/Library)
   - Frequent access expected (users check progress regularly)
   - Tab order: Home → Journal → **Progress** → Library → (Profile in top-right)
   - Progress between Journal and Library creates logical flow

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

4. **Why Real-Time Updates?**
   - Immediate feedback reinforces positive behavior
   - Users see impact of their actions (wrote journal → count increases)
   - Prevents confusion ("I just journaled, why doesn't it show?")
   - Modern app expectation (users expect live data)
   - Daily aggregation would feel outdated

5. **Why Mixed Visualization Style?**
   - Numbers for quick scanning (entry count, streak, lessons)
   - Charts for trend analysis (sentiment line chart, topic distribution)
   - Balance: not overwhelming, not too sparse
   - Accessible to different user preferences (visual vs. numeric)

6. **Why Default to "Last 30 Days"?**
   - Meaningful timeframe for pattern recognition
   - Not too short (daily = noisy) or too long (all time = overwhelming)
   - Aligns with therapy session frequency (monthly check-ins)
   - Users can toggle to Weekly for granular view or All Time for big picture

7. **Why Export Feature?**
   - Enables therapy preparation (bring insights to sessions)
   - Personal record-keeping without screenshots
   - Privacy-friendly (user controls export, not auto-share)
   - Future: Direct therapist sharing (requires consent flow)

### Metric Calculation Strategy

**Real-Time Calculation Approach:**

```
User Action (Journal/Lesson)
    ↓
Backend saves data
    ↓
Trigger metric recalculation
    ↓
Update aggregated tables:
  - journal_metrics_daily
  - lesson_progress_metrics
    ↓
WebSocket/Polling: Frontend fetches latest
    ↓
UI updates immediately
```

**Performance Optimization:**
- Pre-aggregate daily metrics (avoid recalculating from scratch)
- Incremental updates (add new entry to existing count, not full scan)
- Cache computed metrics (invalidate on new data)
- Lazy-load charts (fetch only when user switches time period)

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

- [ ] Emotion heatmap calendar (GitHub-style contribution grid)
- [ ] Compare time periods (This Week vs. Last Week)
- [ ] Insights/suggestions ("Your mood improved by 15% this month")
- [ ] Custom date range picker (e.g., "Jan 1 - Jan 15")
- [ ] Correlation analysis ("Better sleep → better mood")
- [ ] Share progress directly to therapist (secure, consent-based)
- [ ] Weekly summary notifications (opt-in)
- [ ] Voice-over summary of progress (accessibility + convenience)

---

**Last Updated**: November 23, 2025
