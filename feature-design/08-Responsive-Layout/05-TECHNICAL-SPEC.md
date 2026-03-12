# Technical Specification — Desktop & Tablet Responsive Layout

## Quick Reference

| Spec | Value |
|------|-------|
| Tailwind Breakpoints | `md:768px` `lg:1024px` `xl:1280px` |
| Sidebar Width | `w-64` (256px) at `lg:` |
| Content Max Width | `max-w-screen-lg` (1024px) for dashboards |
| Reading Max Width | `max-w-2xl` (672px) for editors/detail |
| Slide Max Width | `max-w-lg` (512px) for carousel slides |
| Bottom Nav | Visible `< lg:`, hidden `≥ lg:` |
| Sidebar Nav | Hidden `< lg:`, visible `≥ lg:` |

---

## Breakpoint Behavior Matrix

| Screen | Width | Nav | Content | Layout |
|--------|-------|-----|---------|--------|
| Phone | < 640px | Bottom tabs | Full width | Single column |
| Large phone | 640–767px | Bottom tabs | Full width | Single column |
| Tablet portrait | 768–1023px | Bottom tabs | Centered, max-w | 2-col grids |
| Tablet landscape | 1024–1279px | Left sidebar | Offset + max-w | 2-col grids |
| Desktop | 1280px+ | Left sidebar | Offset + max-w | 2-3 col grids |

---

## Implementation Priority & Effort

| Phase | Task | Files | Effort | Impact |
|-------|------|-------|--------|--------|
| 1.1 | Create SidebarNavigation | 1 new | Medium | High |
| 1.2 | Hide BottomNav on desktop | 1 edit (1 class) | Trivial | High |
| 1.3 | Update default.vue layout | 1 edit | Medium | Critical |
| 1.4 | Update detail.vue layout | 1 edit | Small | Medium |
| 1.5 | Update slideGroup.vue layout | 1 edit | Small | Medium |
| 2.1 | Home page grid layout | 2–3 edits | Medium | High |
| 2.2 | History page grid | 1 edit | Small | Medium |
| 2.3 | Library page grid conversion | 3–4 edits | Medium | High |
| 2.4 | Toolkit 2-column layout | 1 edit | Small | Medium |
| 2.5 | Collections grid | 1 edit | Small | Low |
| 2.6 | Progress 4-col cards | 1 edit | Trivial | Low |
| 3.1 | Journal editor centering | 2 edits | Small | High |
| 3.2 | Journal detail view centering | 1 edit | Small | Medium |
| 3.3 | Slide group centering | 1 edit | Small | Medium |
| 3.4 | Collection detail grid | 1 edit | Small | Low |
| 3.5 | Profile pb-20 removal | 1 edit | Trivial | Low |
| 3.6 | Prep Pack 2-col | 1 edit | Small | Low |
| 4.1 | Modal widths | 2 edits | Trivial | Low |
| 4.2 | FAB position adjustment | 1 edit | Trivial | Low |
| 4.3 | Bottom toolbar sidebar offset | 2 edits | Small | Medium |
| 4.4 | pb-20 → pb-20 lg:pb-0 bulk | ~12 edits | Small | Medium |

**Total:** ~1 new component + ~30 file edits
**Estimated effort:** 2-3 days for all phases

---

## Complete File Change List

### New Files
| File | Description |
|------|-------------|
| `components/Common/SidebarNavigation.vue` | Desktop left sidebar navigation |

### Modified Files

#### Phase 1 — Foundation
| File | Change |
|------|--------|
| `components/Common/BottomNavigation.vue` | Add `lg:hidden` |
| `layouts/default.vue` | Add sidebar, content wrapper with max-width, flex-row |
| `layouts/detail.vue` | Add `max-w-2xl mx-auto` wrapper |
| `layouts/slideGroup.vue` | Add `max-w-lg` centering |

#### Phase 2 — Content Pages
| File | Change |
|------|--------|
| `pages/index.vue` | Grid for hero section, `lg:pb-0` |
| `components/HomePage/LatestEntries.vue` | Grid for entry cards |
| `components/HomePage/DailyCheckIn.vue` | Remove px when in grid |
| `components/HomePage/FloatingActionButton.vue` | Adjust position for desktop |
| `pages/history.vue` | Grid for entry cards, `lg:pb-0` |
| `pages/learn_and_prepare/index.vue` | Grid for collections/categories, `lg:pb-0` |
| `pages/learn_and_prepare/collections.vue` | Grid for collection cards, `lg:pb-0` |
| `pages/toolkit/index.vue` | 2-col layout, `lg:pb-0` |
| `pages/progress.vue` | 4-col summary grid, `lg:pb-0` |

#### Phase 3 — Detail Pages
| File | Change |
|------|--------|
| `pages/journaling/index.vue` | `max-w-2xl` centering, toolbar offset |
| `pages/journaling/[id].vue` | `max-w-2xl` centering, toolbar offset |
| `components/Journal/DetailView.vue` | `max-w-2xl` content centering |
| `components/Journal/ModalContents.vue` | `max-w-lg` centering |
| `pages/profile/index.vue` | `lg:pb-0` |
| `pages/toolkit/prep-pack/[id].vue` | 2-col grid |
| `pages/toolkit/session/new.vue` | `max-w-2xl` centering |

#### Phase 4 — Polish
| File | Change |
|------|--------|
| Multiple page files | `pb-20` → `pb-20 lg:pb-0` |
| `pages/journaling/index.vue` | Bottom toolbar `lg:left-64` |
| `pages/journaling/[id].vue` | Bottom toolbar `lg:left-64` |
| `assets/scss/main.scss` | Optional: prose max-width utility |

---

## Testing Strategy

### Manual Testing
1. Open app in Chrome DevTools responsive mode
2. Test at: 375px (iPhone), 768px (iPad portrait), 1024px (iPad landscape), 1440px (desktop)
3. Verify each page at each breakpoint
4. Test window resize transitions (no layout jumps)

### Key Test Scenarios
- [ ] Navigate between all 4 main tabs via bottom nav (mobile) and sidebar (desktop)
- [ ] Open and close modals/drawers at each breakpoint
- [ ] Create and save a journal entry at desktop width
- [ ] Complete a slide-based check-in at desktop width
- [ ] View prep pack detail at desktop width
- [ ] Use history filter at desktop width
- [ ] Profile settings slideover works at desktop width (already tested)
- [ ] Auth pages (login/register) look correct at all widths (already correct)

---

## External References

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Nuxt UI Components](https://ui.nuxt.com/)
- [Material Design Responsive Layout Grid](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [Apple Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Web Content Accessibility Guidelines (WCAG) - Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)
