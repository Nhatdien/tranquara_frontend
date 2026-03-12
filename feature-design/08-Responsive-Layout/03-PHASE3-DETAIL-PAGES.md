# Phase 3: Detail Pages — Journaling, Slides, Profile, Settings

## Goal
Optimize editor views, slide-based journaling, and settings pages for comfortable use on larger screens. These pages are "focused" experiences — they benefit from constrained width and centered content rather than multi-column expansion.

---

## 3.1 Free-form Journal Editor (`pages/journaling/index.vue`)

### Current layout
- Full-screen editor with header, title input, TipTap editor, fixed bottom toolbar
- Bottom toolbar fixed to screen bottom with mood selector + Go Deeper

### Tablet + Desktop layout
```
┌──────────────────────────────────────────────┐
│           ← New Journal          ✓            │
│  ─────────────────────────────────────────── │
│                                              │
│        Title (optional)                      │
│        Thursday, March 12, 2026              │
│                                              │
│        [TipTap Editor area]                  │
│        max-width: 680px, centered            │
│                                              │
│                                              │
│  ─────────────────────────────────────────── │
│  😊 Okay  |  ✨ Go Deeper  |    Auto-saved   │
└──────────────────────────────────────────────┘
```

### Implementation changes

**`pages/journaling/index.vue`:**

Center the writing area:
```diff
  <div class="flex flex-col min-h-screen bg-background">
    <header class="flex items-center justify-between p-4 border-b ...">
+     <!-- Header stays full-width but inner content centered -->
      ...
    </header>

-   <div class="px-4 pt-4">
+   <div class="px-4 pt-4 max-w-2xl mx-auto w-full">
      <input v-model="title" ... />
    </div>

-   <div class="px-4 py-2">
+   <div class="px-4 py-2 max-w-2xl mx-auto w-full">
      <span class="text-sm text-muted">{{ formattedDate }}</span>
    </div>

-   <div class="flex-1 px-4 pb-4">
+   <div class="flex-1 px-4 pb-4 max-w-2xl mx-auto w-full">
      <CommonMarkdownEditor ... />
    </div>

    <!-- Bottom toolbar: constrain to content width on desktop -->
-   <div class="fixed bottom-0 left-0 right-0 bg-background border-t ... p-4 flex ...">
+   <div class="fixed bottom-0 left-0 right-0 bg-background border-t ... p-4 flex ... lg:left-64">
+     <div class="max-w-2xl mx-auto w-full flex items-center justify-between">
        ...
+     </div>
    </div>
  </div>
```

Key points:
- `max-w-2xl` (672px) — optimal reading/writing width
- `lg:left-64` on bottom toolbar — accounts for sidebar offset
- Same change applies to `pages/journaling/[id].vue` in edit mode

---

## 3.2 Journal Detail View (`components/Journal/DetailView.vue`)

### Current layout
- Full-screen view with header, meta info, rendered HTML content

### Desktop layout
Content should be centered and width-constrained for readability.

```diff
- <main class="flex-1 overflow-y-auto p-4 space-y-6">
+ <main class="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full">
```

The header can also be constrained or left full-width (it already has a max-width on the title with `max-w-[180px]` — increase this on desktop):
```diff
- <h1 class="text-xl font-bold truncate max-w-[180px]">
+ <h1 class="text-xl font-bold truncate max-w-[180px] md:max-w-sm lg:max-w-md">
```

---

## 3.3 Slide Group / Carousel (`components/Journal/ModalContents.vue`)

### Current layout
- Full-screen carousel with `h-[70vh]` slides
- Navigation arrows at bottom-right
- Dots indicator

### Desktop layout
The slide experience should remain phone-like even on desktop — centered with a max-width.

The parent layout (`layouts/slideGroup.vue`) handles this in Phase 1 with `max-w-lg` centering.

**Additional changes in `ModalContents.vue`:**
```diff
- <section class="p-4">
+ <section class="p-4 max-w-lg mx-auto">
```

The slide height should adapt:
```diff
- <div class="h-[70vh] max-h-[700px]">
+ <div class="h-[70vh] max-h-[700px] lg:h-[60vh]">
```

Navigation buttons should stay within the centered container:
```diff
- <div class="flex fixed justify-between w-full bottom-8 right-4">
+ <div class="flex fixed justify-between bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
```

---

## 3.4 Collection Detail Page (`pages/learn_and_prepare/collection/[id]/index.vue`)

### Current layout
- Collection title, description
- Horizontal carousel of chapter cards

### Desktop layout
Chapter cards can be displayed in a grid instead of carousel:

```diff
  <!-- Chapter cards -->
- <div class="flex gap-4 overflow-x-auto ...">
+ <div class="flex gap-4 overflow-x-auto ... lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:overflow-visible">
```

Page content centered:
```diff
  <section class="...">
+   <div class="max-w-4xl mx-auto">
      ...
+   </div>
  </section>
```

---

## 3.5 Profile Page (`pages/profile/index.vue`)

### Current layout
- Single column with UContainer
- Navigates to sub-pages on mobile, uses `SettingsDetailView` (USlideover) on desktop (≥768px)

### This page is already partially responsive!
The `SettingsDetailView` component uses `useWindowSize()` and renders a `USlideover` on ≥768px.

### Desktop enhancements
The profile page already uses `UContainer` which provides some centering. Additional tweaks:

```diff
  <div class="min-h-screen bg-default pb-20">
+ <div class="min-h-screen bg-default pb-20 lg:pb-0">
```

For the profile sub-pages (`theme.vue`, `about-you.vue`, `data.vue`, `notifications.vue`):
They use `layout: 'detail'` which Phase 1 already constrains with `max-w-2xl`.

Consider hiding the mobile sub-page navigation on desktop (users use slideover instead):
- The sub-pages still work as fallback, but on desktop the slideover is the primary interaction
- No code change needed — `SettingsDetailView` already handles this

---

## 3.6 Prep Pack Detail (`pages/toolkit/prep-pack/[id].vue`)

### Current layout
- Single column with mood overview, themes, emotional highlights, detected patterns, discussion points, growth moments

### Desktop layout
This is a rich content page that benefits from a two-column layout:

```
┌──────────────────────────────────────────────────┐
│ ← Prep Pack                                       │
│   Feb 25 – Mar 11 · 1 journals analyzed           │
├─────────────────────────┬────────────────────────┤
│ Mood Overview           │ Key Themes              │
│ ┌─────────────────────┐ │ ┌────────────────────┐ │
│ │ Avg: 8.0 Trend:Stable│ │ │ nightmares, ...   │ │
│ └─────────────────────┘ │ └────────────────────┘ │
│                         │                        │
│ Emotional Highlights    │ Detected Patterns       │
│ ┌─────────────────────┐ │ ┌────────────────────┐ │
│ │ Before Session...   │ │ │ Recurring night... │ │
│ └─────────────────────┘ │ └────────────────────┘ │
├─────────────────────────┴────────────────────────┤
│ Discussion Points (full width)                    │
│ Growth Moments (full width)                       │
│ Preparation Journey (full width)                  │
└──────────────────────────────────────────────────┘
```

### Implementation
Wrap the card sections in a responsive grid:
```html
<div class="lg:grid lg:grid-cols-2 lg:gap-6">
  <div><!-- Mood Overview --></div>
  <div><!-- Key Themes --></div>
  <div><!-- Emotional Highlights --></div>
  <div><!-- Detected Patterns --></div>
</div>
<!-- Full-width sections below -->
<div><!-- Discussion Points --></div>
<div><!-- Growth Moments --></div>
```

---

## 3.7 Session Pages (`pages/toolkit/session/new.vue`, `[id].vue`)

These are form-based pages (schedule session, before/after session questions). They should be centered with a comfortable form width.

```diff
  <section class="px-4 py-6 pb-20">
+ <section class="px-4 py-6 pb-20 lg:pb-0 max-w-2xl mx-auto">
```

---

## 3.8 Auth Pages (`pages/login.vue`, `pages/register.vue`)

### Already responsive!
The `auth` layout already centers content with `max-w-md`. No changes needed. The login and register cards look fine on all screen sizes.

---

## Verification Checklist

### Journal Editor
- [ ] Mobile: full-width editor, unchanged
- [ ] Desktop: editor centered at ~672px, bottom toolbar accounts for sidebar offset
- [ ] TipTap editor keyboard shortcuts work on desktop

### Slide Groups  
- [ ] Mobile: full-screen carousel
- [ ] Desktop: centered carousel (~512px), phone-like experience
- [ ] Navigation dots and arrows stay within centered container

### Profile/Settings
- [ ] Mobile: navigate to sub-pages
- [ ] Desktop: slideover opens for settings sections (already works)
- [ ] No bottom padding on desktop

### Prep Pack Detail
- [ ] Mobile: single column
- [ ] Desktop: 2-col grid for card sections, full-width for discussion/growth
