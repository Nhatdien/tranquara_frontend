# Phase 4: Polish — Components, Modals, & Interaction Patterns

## Goal
Refine shared components, modals, and interaction patterns to feel native on desktop and tablet. Address hover states, keyboard interactions, and visual polish.

---

## 4.1 Modals & Dialogs

### Current behavior
All modals use `UModal` which renders as a centered overlay. This works on all screen sizes but can feel undersized on desktop.

### Improvements
No structural changes needed — Nuxt UI's `UModal` is already responsive. But ensure modals that contain forms have adequate width:

**Mood Picker Modal** (in journaling pages):
```diff
  <UModal v-model:open="showMoodPicker">
    <template #content>
-     <div class="p-6">
+     <div class="p-6 w-full max-w-md mx-auto">
```

**Delete Confirmation Modal** (in JournalDetailView):
Already fine — small content, centered.

**Filter Drawer** (in history page):
Currently uses a drawer/modal. On desktop, consider using `UPopover` anchored to the filter button for a more desktop-native feel, or keep the drawer.

---

## 4.2 Cards & Interactive Elements

### Hover states
All interactive cards already have `hover:bg-accented` or `hover:bg-neutral-800/50`. These work well with mouse interaction. No changes needed.

### Cursor
Cards with `@click` handlers already have `cursor-pointer`. ✅

### Focus rings
Nuxt UI components handle focus rings automatically. For custom buttons/cards, ensure:
```css
.cursor-pointer:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}
```

---

## 4.3 Floating Action Button

**`components/HomePage/FloatingActionButton.vue`:**

Adjust position for desktop (no bottom nav, sidebar present):
```diff
- class="fixed bottom-20 right-6 w-14 h-14 ..."
+ class="fixed bottom-20 right-6 w-14 h-14 ... lg:bottom-8 lg:right-8"
```

On desktop, the FAB sits at bottom-right of the viewport (closer to corner since no bottom nav). Could also consider replacing FAB with a prominent button in the sidebar or header on desktop, but keeping FAB is simpler and consistent.

---

## 4.4 Bottom Toolbars (Journal Editor)

Fixed bottom toolbars in journal editor need sidebar offset:

```diff
- <div class="fixed bottom-0 left-0 right-0 ...">
+ <div class="fixed bottom-0 left-0 right-0 lg:left-64 ...">
```

This applies to:
- `pages/journaling/index.vue` — bottom toolbar
- `pages/journaling/[id].vue` — bottom toolbar (edit mode)

---

## 4.5 Horizontal Scroll → Grid Conversion

Several components use horizontal scroll on mobile that should convert to grids on desktop:

| Component/Page | Mobile | Desktop |
|---------------|--------|---------|
| Library collections carousel | `overflow-x-auto` | `lg:grid lg:grid-cols-3` |
| Library category tabs | `overflow-x-auto` | Keep scroll (tabs work well) |
| Collection chapter cards | `overflow-x-auto` | `lg:grid lg:grid-cols-2` |

The pattern is consistent:
```html
<div class="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-N lg:overflow-visible">
  <div class="shrink-0 w-72 lg:w-auto lg:shrink">
    <!-- Card content -->
  </div>
</div>
```

---

## 4.6 Empty States

Empty states (no journals, no prep packs, etc.) should center nicely on desktop. Most already use `text-center py-12` which works. Ensure they span full grid width when inside a grid:

```html
<div v-if="isEmpty" class="md:col-span-full text-center py-12">
  ...
</div>
```

---

## 4.7 Sync Components

`SyncStatusBanner`, `SyncBadge`, `SyncMiniIndicator` — these are small status indicators that work at any screen size. No changes needed.

`SyncStatusDashboard` (in data.vue) — already within `UContainer`, will be constrained by Phase 1 layout changes.

---

## 4.8 Typography & Spacing

The global SCSS already has responsive heading sizes (breakpoints at 1200px, 992px, 768px, 576px). These are fine.

Consider adding a readable line-length utility for prose content:
```css
.prose {
  max-width: 65ch; /* ~65 characters per line — optimal for readability */
}
```

TailwindCSS Typography plugin already handles this with `prose` class, and `max-w-none` overrides it in journal content. On desktop, we might want to remove that override:
```diff
- <div class="prose dark:prose-invert max-w-none journal-content">
+ <div class="prose dark:prose-invert max-w-none md:max-w-prose journal-content">
```

---

## 4.9 Bottom Padding Cleanup

Every page that has `pb-20` (for bottom nav spacing) needs `lg:pb-0` added:

| Page | Current | Add |
|------|---------|-----|
| `pages/index.vue` | `pb-20` | `lg:pb-0` |
| `pages/history.vue` | `pb-20` | `lg:pb-0` |
| `pages/toolkit/index.vue` | `pb-20` | `lg:pb-0` |
| `pages/learn_and_prepare/index.vue` | `pb-20` | `lg:pb-0` |
| `pages/learn_and_prepare/collections.vue` | `pb-20` | `lg:pb-0` |
| `pages/profile/index.vue` | `pb-20` | `lg:pb-0` |
| `pages/progress.vue` | `pb-20` | `lg:pb-0` |
| `pages/toolkit/prep-pack/index.vue` | `pb-20` | `lg:pb-0` |
| `pages/profile/theme.vue` | `pb-20` | `lg:pb-0` |
| `pages/profile/about-you.vue` | `pb-20` | `lg:pb-0` |
| `pages/profile/data.vue` | `pb-20` | `lg:pb-0` |
| `pages/profile/notifications.vue` | `pb-20` | `lg:pb-0` |

This is a bulk find-and-replace: `pb-20` → `pb-20 lg:pb-0` across all page files.

---

## 4.10 Keyboard Navigation (Desktop Enhancement)

For desktop users, consider adding keyboard shortcuts (stretch goal):

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` / `⌘+N` | New journal entry |
| `Ctrl+S` / `⌘+S` | Save journal (already handled by TipTap) |
| `Esc` | Close modal / go back |
| `1-4` | Switch tabs (Today/Toolkit/Library/History) |

This is a **stretch goal** — implement via a `useKeyboardShortcuts()` composable.

---

## Verification Checklist

- [ ] All modals display correctly on desktop (not too small, not too large)
- [ ] FAB position adjusts for desktop (no overlap with sidebar or bottom nav)
- [ ] Journal editor bottom toolbar accounts for sidebar offset
- [ ] Horizontal carousels convert to grids on desktop
- [ ] Empty states span full grid width
- [ ] Prose content has readable line length on desktop
- [ ] All pages have `lg:pb-0` to remove bottom nav spacing
- [ ] No horizontal overflow on any screen size
- [ ] Hover states visible on interactive elements
- [ ] Focus rings visible for keyboard navigation
