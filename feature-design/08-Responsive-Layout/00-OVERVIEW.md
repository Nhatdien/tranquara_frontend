# Desktop & Tablet Responsive Layout — Overview

## Current State Analysis

### What exists today
TheraPrep is a **mobile-first SPA** (Nuxt 3 + Capacitor). The entire UI is designed for phone screens (~375–430px wide). There is **zero responsive adaptation** for tablet (768–1024px) or desktop (1024px+) screens.

### Current layout architecture
| File | Purpose | Responsive? |
|------|---------|-------------|
| `layouts/default.vue` | Main app shell: full-width flex-col + `<BottomNavigation>` fixed at bottom | ❌ No max-width, no side-nav |
| `layouts/auth.vue` | Auth pages (login/register): centered card, `max-w-md` | ✅ Already centered |
| `layouts/detail.vue` | Sub-pages (settings detail): full-width flex-col | ❌ No max-width |
| `layouts/slideGroup.vue` | Slide-based journaling: bare `<slot>` | ❌ No constraints |
| `components/Common/BottomNavigation.vue` | Fixed bottom tab bar, 4 items | ❌ Always bottom, never sidebar |
| `components/Settings/DetailView.vue` | Uses `USlideover` on ≥768px, hidden on mobile | ✅ Partially responsive |

### Current page patterns (all mobile-only)
- **Home (`index.vue`)**: Single column, `pb-20` for bottom nav, `px-4` padding
- **History (`history.vue`)**: Single column list, `px-4`
- **Toolkit (`toolkit/index.vue`)**: Single column sections, `px-4 py-6 pb-20`
- **Library (`learn_and_prepare/index.vue`)**: Single column with horizontal scroll carousels
- **Profile (`profile/index.vue`)**: Single column with `UContainer`, navigates to sub-pages
- **Progress (`progress.vue`)**: 2-col grid for summary cards, single column otherwise
- **Journaling (`journaling/index.vue`)**: Full-screen editor, fixed bottom toolbar
- **Slide Groups**: Full-screen carousel with `h-[70vh]` slides

### Key problems on larger screens
1. **Content stretches full width** — text lines become 200+ chars wide, unreadable
2. **Bottom navigation** — wastes space on desktop, should be sidebar
3. **Single-column layouts** — no use of horizontal space for side-by-side content
4. **Cards/lists** — don't use grid layouts on wider screens
5. **Modals/slideovers** — sized for mobile, look tiny on desktop
6. **Floating action button** — positioned for mobile bottom-right only
7. **Horizontal scroll carousels** — could be grids on wider screens

---

## Design Philosophy

### Breakpoint Strategy (Tailwind defaults)
| Breakpoint | Width | Target |
|-----------|-------|--------|
| `sm` | ≥640px | Large phones / small tablets |
| `md` | ≥768px | **Tablets (portrait)** |
| `lg` | ≥1024px | **Tablets (landscape) / Small desktop** |
| `xl` | ≥1280px | **Desktop** |
| `2xl` | ≥1536px | Large desktop |

### Core Principles
1. **Mobile stays untouched** — all changes use `md:`, `lg:`, `xl:` prefixes
2. **Content width cap** — max-width 640px for reading content (journals, slides), 1280px for dashboard layouts
3. **Navigation transformation** — Bottom tabs → Sidebar at `lg:` breakpoint
4. **Progressive enhancement** — Tablet gets centered content + grid; Desktop gets sidebar + multi-panel
5. **No layout shift** — same component structure, just CSS/class changes

---

## Implementation Phases

### Phase 1: Foundation (Layout Shell + Navigation)
Convert the app shell to support sidebar navigation on desktop and constrain content width.

### Phase 2: Content Pages (Home, History, Library, Toolkit)
Adapt main content pages to use wider screen real estate with grids and multi-column layouts.

### Phase 3: Detail Pages (Journaling, Slides, Profile, Settings)
Optimize detail/editor views, slide groups, and settings for larger screens.

### Phase 4: Polish & Components
Refine modals, cards, and interactive components for desktop interaction patterns.

---

## File Impact Summary

### New files to create
- `components/Common/SidebarNavigation.vue` — Desktop sidebar nav
- `components/Common/AppShell.vue` — Responsive shell wrapper (optional)

### Files to modify (high impact)
- `layouts/default.vue` — Add sidebar support, content max-width
- `layouts/detail.vue` — Add content max-width centering
- `layouts/slideGroup.vue` — Add content constraints
- `components/Common/BottomNavigation.vue` — Hide on desktop
- `pages/index.vue` — Grid layout for desktop
- `pages/history.vue` — Multi-column grid
- `pages/toolkit/index.vue` — Two-column layout
- `pages/learn_and_prepare/index.vue` — Grid for collections
- `pages/profile/index.vue` — Side panel layout

### Files to modify (low impact)
- `assets/scss/main.scss` — Root-level responsive utilities
- All slide components — Max-width centering
- All sub-pages — Content centering with `UContainer` or max-width
