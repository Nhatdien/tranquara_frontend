# Desktop Redesign — Analysis & Improvement Plan

## Executive Summary

The current "responsive" implementation is **a stretched mobile app**, not a real desktop experience. Two systemic issues must be fixed:

1. **Broken Light Mode**: ~80% of pages use hardcoded dark-only Tailwind classes (`bg-neutral-900`, `border-neutral-700`, `text-neutral-400`) instead of Nuxt UI's theme-aware semantic tokens. This means pages look broken in light mode.
2. **Still Feels Mobile**: The layout is just a mobile column with wider margins. Desktop users expect **higher information density, multi-pane layouts, component swapping**, and purpose-built navigation — not a phone screen stretched to 1400px.

---

## Part 1: Critical Bug — Dark/Light Mode Broken

### Root Cause

Pages were written with hardcoded Tailwind neutral color classes that only look correct in dark mode:

```html
<!-- ❌ BROKEN: Only looks right in dark mode -->
<div class="bg-neutral-900/50 border-neutral-700 text-neutral-400">

<!-- ✅ CORRECT: Adapts to light AND dark mode automatically -->
<div class="bg-elevated border-default text-muted">
```

### Nuxt UI Semantic Token Reference

Nuxt UI provides CSS variable-based utility classes that automatically switch between light and dark mode:

| Purpose | ❌ Hardcoded (dark-only) | ✅ Semantic (theme-aware) |
|---------|-------------------------|--------------------------|
| **Page background** | `bg-neutral-950` | `bg-default` |
| **Card background** | `bg-neutral-900/50` | `bg-elevated` |
| **Subtle card bg** | `bg-neutral-800/50` | `bg-muted` |
| **Hover bg** | `hover:bg-neutral-800` | `hover:bg-accented` |
| **Primary text** | `text-white` | `text-highlighted` |
| **Body text** | `text-neutral-300` | `text-default` |
| **Muted text** | `text-neutral-400` | `text-muted` |
| **Dimmed text** | `text-neutral-500` | `text-dimmed` |
| **Toned text** | `text-neutral-600` | `text-toned` |
| **Card border** | `border-neutral-700` | `border-default` |
| **Subtle border** | `border-neutral-800` | `border-muted` |
| **Hover border** | `border-neutral-600` | `border-accented` |
| **Inverted bg** | `bg-white` (in dark) | `bg-inverted` |

### Files Requiring Token Replacement

**High Priority (visible in screenshots, clearly broken):**

| File | Hardcoded Classes Count | Notes |
|------|------------------------|-------|
| `pages/toolkit/index.vue` | ~30+ | Entire page is dark-only |
| `pages/toolkit/prep-pack/index.vue` | ~15 | All cards dark-only |
| `pages/toolkit/prep-pack/[id].vue` | ~25+ | All sections dark-only |
| `pages/toolkit/session/[id].vue` | ~15 | Dark-only cards/borders |
| `pages/learn_and_prepare/index.vue` | ~20 | Featured, collections, categories |
| `pages/learn_and_prepare/collections.vue` | ~5 | Collection cards |
| `pages/learn_and_prepare/category/[id].vue` | ~5 | Slide group cards |
| `components/HomePage/DailyCheckIn.vue` | 2 | `bg-neutral-900`, `text-white` |
| `components/Toolkit/HomeworkCard.vue` | ~8 | Entire component |
| `components/Toolkit/JourneyStepCard.vue` | ~6 | Entire component |
| `components/Journal/TemplateListV2.vue` | ~3 | Slide group cards |
| `pages/toolkit/grounding/*.vue` | ~5 each | All grounding exercises |

**Medium Priority:**

| File | Notes |
|------|-------|
| `pages/history.vue` | Entry cards already use `bg-muted` ✅, but date headers may use hardcoded |
| `pages/progress.vue` | Chart backgrounds may be hardcoded |
| `components/Slide/*.vue` | Slide components may have hardcoded colors |

### Replacement Strategy

Systematic find-and-replace with manual review:

```
bg-neutral-900/50  →  bg-elevated
bg-neutral-900/30  →  bg-muted
bg-neutral-900/20  →  bg-muted
bg-neutral-800/50  →  bg-muted
bg-neutral-800     →  bg-accented
border-neutral-700 →  border-default
border-neutral-800 →  border-muted
text-neutral-300   →  text-default
text-neutral-400   →  text-muted
text-neutral-500   →  text-dimmed
text-neutral-600   →  text-toned
text-white         →  text-highlighted  (when used as body text)
hover:bg-neutral-800/50  →  hover:bg-accented
hover:text-white   →  hover:text-highlighted
active:bg-neutral-800/50 →  active:bg-accented
```

---

## Part 2: Desktop Design Patterns (Research)

### Material Design 3 — The 5 Questions Framework

When adapting from mobile to desktop, ask:

1. **What should be REVEALED?** — Navigation drawer opens permanently. Secondary panels become visible. Hidden metadata becomes always-shown.
2. **How should the screen be DIVIDED?** — Single pane → two/three panes. Master-detail patterns. Dashboard grid layouts.
3. **What should be RESIZED?** — Cards grow. Typography can increase. White space increases for breathing room.
4. **What should be REPOSITIONED?** — Bottom actions → top/side. Stacked elements → side-by-side. FAB → prominent button.
5. **What should be SWAPPED?** — Bottom nav → sidebar (done ✅). Bottom sheets → side panels. Full-screen modals → inline panels or popovers. Horizontal carousels → grids.

### Component Swap Table (Mobile → Desktop)

| Mobile Pattern | Desktop Equivalent | Status |
|---------------|-------------------|--------|
| Bottom Navigation Bar | Sidebar Navigation | ✅ Done |
| Full-screen page push | Master-detail / split view | ❌ Not done |
| Bottom sheet / modal | Side panel (USlideover) or inline expand | ❌ Not done |
| Horizontal carousel | Grid layout | ✅ Partially done |
| FAB (Floating Action Button) | Prominent button in sidebar or header | ❌ Still using FAB |
| Stacked single column | Multi-column dashboard grid | ✅ Partially done |
| Full-width cards | Constrained-width cards with margins | ✅ Partially done |
| Back button in header | Breadcrumbs | ❌ Not done |
| Full-screen entry view | Side panel or split-view | ❌ Not done |
| Tap-only interactions | Hover states, tooltips, right-click | ❌ Not done |

---

## Part 3: Page-by-Page Desktop Improvements

### 3.1 Home Page (`pages/index.vue`)

**Current Problems (Screenshot 1):**
- DateHeader still shows mobile-sized profile icon and streak button that look tiny on desktop
- DailyCheckIn hero card stretches too wide — 1000px+ black card looks odd
- "YOUR ENTRIES" section has 3 equal-width cards but no visual hierarchy
- The "today." title in the header is redundant when sidebar already shows "Today" as active

**Desktop Improvements:**
- **DateHeader**: On desktop (≥lg), hide the profile icon (sidebar has it), enlarge the streak indicator, make the date/greeting more prominent
- **DailyCheckIn**: Constrain to `max-w-xl` and center, or redesign as a smaller prompt card rather than a full hero banner
- **LatestEntries**: First card (most recent) should be larger/featured. Remaining cards in a standard grid. Consider showing more metadata (word count, time spent)
- **HomeworkCard**: On desktop, show inline on the home page rather than a collapsed card — or move to a sidebar widget

### 3.2 Toolkit Page (`pages/toolkit/index.vue`)

**Current Problems (Screenshot 2):**
- Entire page is dark-only (broken in light mode)
- "Prep Pack" and "Session Tracker" side-by-side is good ✅
- "PAST SESSIONS" section sits under Session Tracker but with too much vertical space
- Homework section stretches full width unnecessarily
- Journey steps are a nice 2-col grid ✅ but the cards are too wide
- Grounding exercises 3-col grid is good ✅

**Desktop Improvements:**
- Fix all hardcoded neutral-* classes (priority!)
- Past Sessions list should be inside the Session Tracker card or immediately below it, not a separate section that spans both columns
- Homework section: constrain width or make it a sidebar widget
- Add subtle card shadows/elevation for visual depth instead of flat borders

### 3.3 Library Page (`pages/learn_and_prepare/index.vue`)

**Current Problems (Screenshot 3):**
- All dark-only styling (broken in light mode)
- Profile icon in top-right duplicates sidebar profile link
- "Featured" section has 2 cards — fine but could use better visual treatment
- "Collections" shows a grid of cards that look cramped — titles are truncating ("Self-Compassion" is cut off, "Introduction to Journaling" wraps awkwardly)
- Category icons at bottom look disconnected from the category content

**Desktop Improvements:**
- Fix theme tokens
- Hide the top-right profile icon on desktop (sidebar has it)
- Collections grid: use `xl:grid-cols-5` to prevent text truncation, or increase card width
- Featured section: on desktop, could become a horizontal banner with description text alongside

### 3.4 Prep Pack Page (`pages/toolkit/prep-pack/index.vue`)

**Current Problems (Screenshot 4):**
- All dark-only (broken in light mode)
- "New Prep Pack" card is too wide for its content
- Date range selector buttons are good but look like they're floating without context
- "Past Prep Packs" list is fine but could benefit from more information density

**Desktop Improvements:**
- Fix theme tokens
- Constrain "New Prep Pack" form to `max-w-lg` and center
- Past Prep Packs: show in a table-like layout with more columns (date range, journals analyzed, generated date) instead of stacked cards

### 3.5 Toolkit Detail Page (Screenshot 5 — Preparation Journey + Grounding)

**Current Problems:**
- Journey step cards and grounding cards look fine layout-wise ✅
- But all styling is dark-only

**Desktop Improvements:**
- Fix theme tokens
- Already good grid layout

### 3.6 Collection Detail Page (Screenshot 6 — Introduction to Journaling)

**Current Problems:**
- The 2 chapter cards look small and lost on the desktop screen
- Massive empty space below
- Cards are too narrow (`max-w-md` mobile constraint is still active on grid items)

**Desktop Improvements:**
- Cards should fill the grid columns properly (already fixed with `lg:w-auto lg:max-w-none` ✅)
- Add more descriptive content: estimated time, completion status, progress bar
- Consider a different layout: horizontal cards with description on the right

---

## Part 4: Implementation Priority

### Phase A: Theme Token Fix (CRITICAL — fixes light mode)
**Effort: ~4 hours | Impact: High**

Systematically replace hardcoded neutral-* classes with Nuxt UI semantic tokens across all affected files. This is the single most impactful change.

**Files (in order):**
1. `pages/toolkit/index.vue` — largest file, most visible
2. `components/Toolkit/HomeworkCard.vue`
3. `components/Toolkit/JourneyStepCard.vue`
4. `pages/toolkit/prep-pack/index.vue`
5. `pages/toolkit/prep-pack/[id].vue`
6. `pages/toolkit/session/[id].vue`
7. `pages/learn_and_prepare/index.vue`
8. `pages/learn_and_prepare/collections.vue`
9. `pages/learn_and_prepare/category/[id].vue`
10. `components/HomePage/DailyCheckIn.vue`
11. `components/Journal/TemplateListV2.vue`
12. `pages/toolkit/grounding/*.vue` (4 files)

### Phase B: Layout Density & Component Swaps
**Effort: ~6 hours | Impact: Medium-High**

Make the desktop layout feel like a real web app:

1. **Home page redesign**: Constrain DailyCheckIn, featured first entry card, hide duplicate nav elements
2. **Master-detail on History**: On desktop, clicking a journal entry opens it in a side panel instead of navigating away
3. **Toolkit page refinement**: Past sessions inside tracker card, homework constrained
4. **Library page refinement**: Better collection card sizing, hide duplicate profile icon
5. **FAB → Sidebar action**: On desktop, add "New Journal" button to sidebar instead of FAB

### Phase C: Visual Polish
**Effort: ~3 hours | Impact: Medium**

1. Card elevation/shadows for visual depth
2. Hover states and transitions
3. Typography scaling for desktop
4. Breadcrumbs for detail pages
5. Better empty states with illustrations

---

## Part 5: Quick Reference — Nuxt UI CSS Variables

### Backgrounds
| Class | Light | Dark |
|-------|-------|------|
| `bg-default` | `white` | `neutral-900` |
| `bg-muted` | `neutral-50` | `neutral-800` |
| `bg-elevated` | `neutral-100` | `neutral-800` |
| `bg-accented` | `neutral-200` | `neutral-700` |
| `bg-inverted` | `neutral-900` | `white` |

### Text
| Class | Light | Dark |
|-------|-------|------|
| `text-default` | `neutral-700` | `neutral-200` |
| `text-muted` | `neutral-500` | `neutral-400` |
| `text-dimmed` | `neutral-400` | `neutral-500` |
| `text-toned` | `neutral-600` | `neutral-300` |
| `text-highlighted` | `neutral-900` | `white` |
| `text-inverted` | `white` | `neutral-900` |

### Borders
| Class | Light | Dark |
|-------|-------|------|
| `border-default` | `neutral-200` | `neutral-800` |
| `border-muted` | `neutral-200` | `neutral-700` |
| `border-accented` | `neutral-300` | `neutral-700` |
| `border-inverted` | `neutral-900` | `white` |

---

## Decision Required

Before implementing, I need your input:

1. **Phase A (theme fix) first?** — This fixes light mode across the entire app. Most impactful single change.
2. **Which pages to prioritize for Phase B?** — Home, Toolkit, Library, or History?
3. **Master-detail pattern for History?** — Should clicking a journal on desktop open a side panel instead of navigating to a new page?
4. **FAB on desktop** — Keep as FAB or move to sidebar "New Journal" button?
