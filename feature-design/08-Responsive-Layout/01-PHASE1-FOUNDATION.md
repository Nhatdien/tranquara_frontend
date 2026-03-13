# Phase 1: Foundation — Layout Shell & Navigation

## Goal
Transform the app shell so that on `lg:` (≥1024px) screens the bottom tab bar becomes a left sidebar, and all page content is width-constrained and centered.

---

## 1.1 Create `SidebarNavigation.vue`

**File:** `components/Common/SidebarNavigation.vue`

A vertical sidebar using the same `bottomNavSchema` data source. Only rendered at `lg:` and above.

```
┌─────────────────────────────────────────────┐
│ [Logo]                                       │
│                                              │
│  🏠 Today                                    │
│  💛 Toolkit                                  │
│  📖 Library                                  │
│  🕐 History                                  │
│                                              │
│              (spacer)                        │
│                                              │
│  👤 Profile                                  │
│  ⚙️ Settings                                 │
└─────────────────────────────────────────────┘
```

**Design specs:**
- Width: `w-64` (16rem) — collapsible to `w-20` (icon-only) as stretch goal
- Background: `bg-elevated` with right border
- Fixed left, full height
- Active item: `text-primary` with subtle background highlight
- Hover: `bg-accented` transition
- Bottom section: Profile link + optional settings shortcut

**Implementation:**
```vue
<template>
  <aside class="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-elevated border-r z-50">
    <!-- Logo -->
    <div class="p-6">
      <h1 class="text-xl font-bold text-primary">TheraPrep</h1>
    </div>
    
    <!-- Nav Items -->
    <nav class="flex-1 px-3 space-y-1">
      <NuxtLink v-for="item in navItems" :key="item.link" :to="item.link" ...>
        <component :is="iconComponents[item.icon]" />
        <span>{{ $t(item.titleKey) }}</span>
      </NuxtLink>
    </nav>
    
    <!-- Bottom: Profile -->
    <div class="p-3 border-t">
      <NuxtLink to="/profile" ...>
        <User /> <span>Profile</span>
      </NuxtLink>
    </div>
  </aside>
</template>
```

---

## 1.2 Update `BottomNavigation.vue`

**File:** `components/Common/BottomNavigation.vue`

**Change:** Hide on `lg:` screens.

```diff
- <nav class="fixed bottom-0 left-0 w-full h-16 bg-elevated border-t z-50">
+ <nav class="fixed bottom-0 left-0 w-full h-16 bg-elevated border-t z-50 lg:hidden">
```

One class addition. That's it.

---

## 1.3 Update `layouts/default.vue`

**File:** `layouts/default.vue`

Transform from single-column mobile to sidebar + content area on desktop.

**Current:**
```vue
<div class="min-h-screen bg-[var(--ui-bg)] flex flex-col">
  <main class="flex-1 overflow-y-auto">
    <slot />
  </main>
  <BottomNavigation />
</div>
```

**New:**
```vue
<div class="min-h-screen bg-[var(--ui-bg)] flex">
  <!-- Desktop Sidebar (hidden on mobile) -->
  <SidebarNavigation />
  
  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col lg:ml-64">
    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-screen-lg">
        <slot />
      </div>
    </main>
    
    <!-- Bottom Nav (hidden on desktop) -->
    <BottomNavigation />
  </div>
</div>
```

**Key changes:**
- Outer container: `flex` (row direction) instead of `flex-col`
- Content area: `lg:ml-64` to offset for sidebar width
- Content wrapper: `max-w-screen-lg mx-auto` (1024px max) to prevent content from stretching
- Sidebar and bottom nav are mutually exclusive via `lg:hidden` / `hidden lg:flex`

---

## 1.4 Update `layouts/detail.vue`

**File:** `layouts/detail.vue`

Add content centering for detail pages (settings, journal view, etc.)

**Current:**
```vue
<div class="min-h-screen bg-[var(--ui-bg)] flex flex-col">
  <main class="flex-1 overflow-y-auto">
    <slot />
  </main>
</div>
```

**New:**
```vue
<div class="min-h-screen bg-[var(--ui-bg)] flex flex-col">
  <main class="flex-1 overflow-y-auto">
    <div class="mx-auto w-full max-w-2xl">
      <slot />
    </div>
  </main>
</div>
```

The `max-w-2xl` (672px) keeps detail content at a comfortable reading width.

---

## 1.5 Update `layouts/slideGroup.vue`

**File:** `layouts/slideGroup.vue`

Center slide content with a max-width to prevent slides from stretching.

**New:**
```vue
<main class="min-h-screen flex items-center justify-center">
  <div class="w-full max-w-lg">
    <slot />
  </div>
</main>
```

The `max-w-lg` (512px) keeps slides at a phone-like width even on desktop, which is appropriate for the carousel/step UX.

---

## 1.6 Global CSS Adjustments

**File:** `assets/scss/main.scss`

Add a utility to remove extra bottom padding on desktop (since no bottom nav):

```scss
/* Remove bottom-nav padding on desktop */
@media (min-width: 1024px) {
  .pb-20 {
    /* Override only in page containers that use pb-20 for bottom nav spacing */
    /* This is handled by lg:pb-0 in Tailwind instead */
  }
}
```

Better approach: Add `lg:pb-0` to every page that has `pb-20`. This is more explicit and Tailwind-native.

---

## Verification Checklist

- [ ] Mobile: Bottom nav visible, no sidebar, full-width content
- [ ] Tablet (768–1023px): Bottom nav visible, no sidebar, content centered with max-width
- [ ] Desktop (≥1024px): Sidebar visible, no bottom nav, content offset by sidebar width, max-width applied
- [ ] Active nav item highlights correctly in both bottom nav and sidebar
- [ ] All navigation links work identically in both nav components
- [ ] Profile page accessible from sidebar on desktop
- [ ] No horizontal scroll on any screen size
- [ ] Smooth transition when resizing browser window (no layout jumps)
