# Phase 2: Content Pages — Home, History, Library, Toolkit

## Goal
Adapt the four main content pages to leverage wider screens with multi-column layouts, grids, and better space utilization while keeping the mobile experience identical.

---

## 2.1 Home Page (`pages/index.vue`)

### Current layout (mobile)
```
[DateHeader - full width]
[DailyCheckIn - full width card]
[DailyPrompt - full width]
[HomeworkCard - full width]
[LatestEntries - single column list]
[FAB - bottom right]
```

### Tablet layout (md: 768px+)
- Content centered with max-width
- DailyCheckIn + DailyPrompt side by side (2-col grid)
- Entries remain single column but with wider cards

### Desktop layout (lg: 1024px+)
```
┌──────────────────────────────────────────────────┐
│ [DateHeader - full width within container]         │
├─────────────────────────┬────────────────────────┤
│ [DailyCheckIn]          │ [DailyPrompt]          │
│                         │                        │
├─────────────────────────┴────────────────────────┤
│ [HomeworkCard - full width]                       │
├──────────────────────────────────────────────────┤
│ [YOUR ENTRIES]                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ Entry 1  │ │ Entry 2  │ │ Entry 3  │          │
│ └──────────┘ └──────────┘ └──────────┘          │
└──────────────────────────────────────────────────┘
```

### Implementation changes

**`pages/index.vue`:**
```diff
- <div class="flex flex-col w-full min-h-screen pb-20">
+ <div class="flex flex-col w-full min-h-screen pb-20 lg:pb-0">
    <HomePageDateHeader />
    
-   <HomePageDailyCheckIn />
-   <HomePageDailyPrompt />
+   <!-- Hero section: side-by-side on desktop -->
+   <div class="md:grid md:grid-cols-2 md:gap-4 md:px-4">
+     <HomePageDailyCheckIn />
+     <HomePageDailyPrompt />
+   </div>

    <ToolkitHomeworkCard ... />
    
    <div class="px-4">
      <h3 class="...">{{ $t('home.yourEntries') }}</h3>
      <HomePageLatestEntries />
    </div>
    
    <HomePageFloatingActionButton />
  </div>
```

**`components/HomePage/LatestEntries.vue`:**
```diff
- <section class="space-y-3 pb-6">
+ <section class="space-y-3 pb-6 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3">
```

Make entry cards fill the grid cells instead of stacking. The empty state and "See All" button should span full width:
```diff
+ <div class="md:col-span-2 xl:col-span-3"> <!-- empty state / see all -->
```

**`components/HomePage/DailyCheckIn.vue`:**
```diff
- <div class="px-4 mb-6">
+ <div class="px-4 mb-6 md:px-0 md:mb-0">
```
Remove horizontal padding when inside the grid (parent handles it).

**`components/HomePage/FloatingActionButton.vue`:**
On desktop, the FAB can be positioned relative to the content area:
```diff
- class="fixed bottom-20 right-6 ..."
+ class="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 ..."
```
Adjust position since there's no bottom nav on desktop.

---

## 2.2 History Page (`pages/history.vue`)

### Current layout (mobile)
- Single column list grouped by date
- Filter drawer (bottom sheet)

### Desktop layout (lg:)
```
┌──────────────────────────────────────────────────┐
│ History                              [Filter btn] │
│ Your journal entries over time                    │
├──────────────────────────────────────────────────┤
│ [Active filters badges]                           │
├──────────────────────────────────────────────────┤
│ WEDNESDAY, 03.11                                  │
│ ┌──────────────────┐ ┌──────────────────┐        │
│ │ After Session    │ │ Before Session   │        │
│ │ Good · 10:16 PM  │ │ Okay · 9:18 PM   │        │
│ └──────────────────┘ └──────────────────┘        │
│ ┌──────────────────┐ ┌──────────────────┐        │
│ │ After Session    │ │ Before Session   │        │
│ │ Very Good·11:50  │ │ Very Good·11:49  │        │
│ └──────────────────┘ └──────────────────┘        │
└──────────────────────────────────────────────────┘
```

### Implementation changes

**`pages/history.vue`:**
```diff
- <div class="flex flex-col w-full min-h-screen pb-20 px-4">
+ <div class="flex flex-col w-full min-h-screen pb-20 lg:pb-0 px-4">
```

For the entries list within each date group:
```diff
- <div class="space-y-3">
+ <div class="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3">
```

For the filter drawer — on desktop, convert from bottom drawer to a sidebar filter panel or a popover:
- **Option A (Recommended):** Use `UPopover` on desktop instead of drawer
- **Option B:** Keep the `UDrawer` / `USlideover` — it already works, just looks slightly mobile-ish

---

## 2.3 Library Page (`pages/learn_and_prepare/index.vue`)

### Current layout (mobile)
- Featured cards (stacked)
- Collections (horizontal scroll carousel)
- Categories (horizontal scroll tabs)
- Category items (single column list)

### Desktop layout (lg:)
```
┌──────────────────────────────────────────────────┐
│ Library                                    [👤]   │
├──────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐  │
│ │ Featured: Sleep     │ │ Featured: Journaling│  │
│ └─────────────────────┘ └─────────────────────┘  │
├──────────────────────────────────────────────────┤
│ Collections                          See All >    │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │ Sleep  │ │ Journal│ │ Mind   │ │ Self   │     │
│ └────────┘ └────────┘ └────────┘ └────────┘     │
├──────────────────────────────────────────────────┤
│ All Categories                                    │
│ [self_care] [gratitude] [relationships] ...       │
│                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ Daily    │ │ Emotional│ │ Morning  │          │
│ │ Check-In │ │ Check-In │ │          │          │
│ └──────────┘ └──────────┘ └──────────┘          │
└──────────────────────────────────────────────────┘
```

### Implementation changes

**Featured section** — side by side on tablet+:
```diff
- <div class="flex flex-col gap-3 mb-8">
+ <div class="flex flex-col gap-3 mb-8 md:grid md:grid-cols-2">
```

**Collections carousel** — switch from horizontal scroll to grid on desktop:
```diff
- <div class="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
+ <div class="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:overflow-visible lg:mx-0 lg:px-0">
```

Collection cards need to lose `flex-shrink-0 w-72` on desktop:
```diff
- class="flex-shrink-0 w-72 p-5 rounded-xl ..."
+ class="flex-shrink-0 w-72 lg:w-auto lg:flex-shrink p-5 rounded-xl ..."
```

**Category items grid**:
```diff
- <div class="grid grid-cols-1 gap-3 mb-4">
+ <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
```

**Page padding:**
```diff
- <section class="px-4 py-6 pb-20">
+ <section class="px-4 py-6 pb-20 lg:pb-0">
```

---

## 2.4 Toolkit Page (`pages/toolkit/index.vue`)

### Current layout (mobile)
- Prep Pack section
- Session Tracker section
- Past Sessions
- Therapy Homework
- All stacked single column

### Desktop layout (lg:)
```
┌──────────────────────────────────────────────────┐
│ Therapy Toolkit                                   │
│ Your companion for therapy preparation            │
├─────────────────────────┬────────────────────────┤
│ PREP PACK               │ SESSION TRACKER         │
│ ┌─────────────────────┐ │ ┌────────────────────┐ │
│ │ Generate summary... │ │ │ Schedule session...│ │
│ │ [View All]          │ │ │ [Schedule]         │ │
│ └─────────────────────┘ │ └────────────────────┘ │
│                         │                        │
│                         │ PAST SESSIONS          │
│                         │ ┌────────────────────┐ │
│                         │ │ Mar 11, 2026       │ │
│                         │ │ ★★★★☆  Completed   │ │
│                         │ └────────────────────┘ │
├─────────────────────────┴────────────────────────┤
│ THERAPY HOMEWORK                            0/3   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ □ hw 1   │ │ □ hw 2   │ │ □ hw 3   │          │
│ └──────────┘ └──────────┘ └──────────┘          │
└──────────────────────────────────────────────────┘
```

### Implementation changes

**`pages/toolkit/index.vue`:**
```diff
- <section class="px-4 py-6 pb-20">
+ <section class="px-4 py-6 pb-20 lg:pb-0">
    <div class="mb-8">...</div>

-   <!-- Sections stacked -->
-   <div class="mb-8"><!-- Prep Pack --></div>
-   <div class="mb-8"><!-- Session Tracker --></div>
+   <!-- Two-column on desktop -->
+   <div class="lg:grid lg:grid-cols-2 lg:gap-6">
+     <div class="mb-8 lg:mb-0"><!-- Prep Pack --></div>
+     <div class="mb-8 lg:mb-0"><!-- Session Tracker + Past Sessions --></div>
+   </div>

    <!-- Homework stays full width -->
    <div class="mb-8"><!-- Therapy Homework --></div>
```

---

## 2.5 Collections List Page (`pages/learn_and_prepare/collections.vue`)

### Implementation changes

Collection cards in grid on desktop:
```diff
- <div class="px-4 flex flex-col gap-4">
+ <div class="px-4 flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
```

---

## 2.6 Progress/Stats Page (`pages/progress.vue`)

### Current
Already has `grid grid-cols-2` for summary cards. This works well.

### Desktop enhancements
```diff
  <!-- Summary Cards -->
- <div class="grid grid-cols-2 gap-3">
+ <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
```

Put all 4 stat cards in a single row on tablet+. The chart sections can remain single-column as they benefit from full width.

**Page padding:**
```diff
  <div class="min-h-screen bg-default pb-20">
+ <div class="min-h-screen bg-default pb-20 lg:pb-0">
```

---

## Verification Checklist

### Home Page
- [ ] Mobile: unchanged
- [ ] Tablet: CheckIn + Prompt side by side, entries in 2-col grid
- [ ] Desktop: Same as tablet + sidebar, entries in 3-col grid, no bottom padding

### History Page
- [ ] Mobile: unchanged
- [ ] Tablet: entries in 2-col grid within date groups
- [ ] Desktop: entries in 3-col grid, filter works as popover or drawer

### Library Page
- [ ] Mobile: horizontal scrolling carousels work
- [ ] Tablet: Featured items side-by-side, category items in 2-col grid
- [ ] Desktop: Collections as grid (no scroll), items in 3-col grid

### Toolkit Page
- [ ] Mobile: unchanged
- [ ] Desktop: Prep Pack + Session Tracker side by side

### Progress Page
- [ ] Mobile: 2-col grid
- [ ] Tablet+: 4-col grid for summary cards
