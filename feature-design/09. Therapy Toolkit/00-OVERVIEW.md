# 🧰 Feature 09: Therapy Toolkit

> **Replaces**: Inspirations tab (bottom nav)  
> **Status**: 🧠 Planned  
> **Priority**: High  
> **Nav Label**: "Toolkit" (icon: `Briefcase` or `HeartHandshake`)

---

## 🎯 Why This Feature?

The app is called **TheraPrep** — *Therapy Preparation*. The current "Inspirations" page (generic quotes + past prompts) doesn't meaningfully contribute to the therapy journey.

Meanwhile, **therapy preparation content is buried inside the Library** — mixed in with general wellness collections. The Library currently holds 4 therapy-specific collections:

| Collection | Type | Content |
|---|---|---|
| **Therapy Preparation** (learn) | `learn` | Signs you need therapy, what to know before first session, what happens in first session |
| **Mental Health History** | `prepare` | Previous diagnoses, past treatment, medications, emotional crisis history |
| **Lifestyle and Support** | `prepare` | Sleep habits, diet/exercise, social support, daily routines |
| **Therapy Preparation** (prepare) | `prepare` | Goals for therapy, past experience, why now, concerns, what therapist should know |

These collections are **the heart of "TheraPrep"** but they're hidden in a Library page alongside unrelated collections like Productivity, Gratitude, and Stress. Users may never find them.

### The Solution

**Move all therapy-specific collections out of the Library and into a dedicated Toolkit tab** that replaces the Inspirations tab. The Toolkit becomes the single home for everything therapy-related:

1. The moved `prepare` and therapy `learn` collections → structured preparation journey
2. New: **AI Prep Pack** → synthesize journals into therapist-ready summaries
3. New: **Session Tracker** → before/after notes for ongoing therapy
4. New: **Grounding Exercises** → interactive coping tools (not just educational slides)

The Library stays focused on **general wellness learning**: journaling basics, stress management, anxiety education, mindfulness, gratitude, relationships, etc.

---

## 💡 Feature: Therapy Toolkit

The Toolkit tab replaces Inspirations and becomes **the therapy hub** — combining the moved preparation collections with new active tools.

### Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TOOLKIT TAB                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SECTION 1: Therapy Preparation Journey                  │  │
│  │  (Moved from Library)                                     │  │
│  │                                                           │  │
│  │  Step-by-step guided path through:                        │  │
│  │  1. Learn about therapy (signs, first session, etc.)      │  │
│  │  2. Reflect on your history (diagnoses, treatment, meds)  │  │
│  │  3. Explore your lifestyle (sleep, diet, support)         │  │
│  │  4. Set goals & prepare (goals, concerns, therapist info) │  │
│  │                                                           │  │
│  │  → Same slide/journal_prompt content, new presentation    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SECTION 2: Session Prep Pack (AI-Generated) [NEW]       │  │
│  │                                                           │  │
│  │  AI synthesizes your journals + memories into a           │  │
│  │  therapist-ready summary: mood trends, themes,            │  │
│  │  patterns, discussion points, growth moments              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SECTION 3: Session Tracker [NEW]                        │  │
│  │                                                           │  │
│  │  Before/after notes for each therapy session:             │  │
│  │  mood, talking points, takeaways, homework, rating        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SECTION 4: Grounding & Coping Exercises [NEW]           │  │
│  │                                                           │  │
│  │  Interactive tools: Box Breathing, 5-4-3-2-1,            │  │
│  │  Body Scan, Quick Journal, Safety Affirmations            │  │
│  │  (100% offline, for in-the-moment use)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Section 1: 📚 Therapy Preparation Journey (Moved from Library)

The 4 therapy-specific collections are reorganized into a **sequential preparation path** on the Toolkit page. Instead of being scattered cards in the Library, they become a clear step-by-step journey.

**Presentation change (not content change):**
- Same underlying slide_group/slide content (reuses existing Slide components)
- Displayed as a numbered journey/checklist on the Toolkit page
- Progress tracked per step (reuses existing `user_learned` store)

**The Journey Steps:**

| Step | Source Collection | Content Type | Purpose |
|------|-------------------|-------------|---------|
| 1. **Learn About Therapy** | Therapy Preparation (`learn`) | Educational slides + further reading | Understand what therapy is, signs you need it, first session expectations |
| 2. **Your Mental Health History** | Mental Health History (`prepare`) | Journal prompts | Reflect on diagnoses, past treatment, medications, crisis history |
| 3. **Your Lifestyle & Support** | Lifestyle and Support (`prepare`) | Journal prompts | Reflect on sleep, diet, social support, daily routines |
| 4. **Prepare for Your Session** | Therapy Preparation (`prepare`) | Mixed (doc + journal prompts) | Set goals, reflect on past therapy, address concerns, share with therapist |

**What changes for the Library:**
- These 4 collections are **filtered out** from the Library page (filter by `type !== 'prepare'` and exclude the therapy `learn` collection by ID)
- Library keeps its focus on general wellness: Journaling basics, Stress, Anxiety, Sleep, Mindfulness, Gratitude, Relationships, Emotions, Self-Compassion, Productivity, Daily Reflection, Check-ins

---

### Section 2: 🗂️ Session Prep Pack (AI-Generated) — NEW

After the user has journaled (through the prep journey or daily journaling), the AI synthesizes everything into a therapist-ready summary.

**What it generates:**
- **Mood Overview** — trend, average, highs/lows for selected period
- **Key Themes** — recurring topics (e.g., "work stress" appeared 4 times)
- **Emotional Highlights** — significant mood shifts, notable entries
- **Patterns Noticed** — behavioral/emotional patterns (from AI Memories)
- **Suggested Discussion Points** — questions to bring to therapy
- **Growth Moments** — positive changes detected
- **Preparation Status** — which journey steps the user completed (links back to Section 1)

**How it connects to Section 1:**
- If the user completed the "Prepare for Your Session" step, those journal responses (goals, concerns, what therapist should know) feed directly into the Prep Pack
- Prep Pack notes which journey steps are incomplete → "Consider completing Step 2: Mental Health History for a more comprehensive summary"

**Infrastructure:** Uses existing GPT-4o-mini + Qdrant RAG + AI Memories — no new AI services needed.

---

### Section 3: 📝 Session Tracker — NEW

For ongoing therapy — tracks every session, not just first-time preparation.

**Before session:**
- Quick mood check-in (reuses EmotionSliderV2)
- "What do I want to talk about today?" (free-text)
- "My top priority" (single line)
- Link a Prep Pack (optional)

**After session:**
- "How do I feel now?" (mood check-in)
- "Key takeaways" (what the therapist said/suggested)
- "Homework / Action items" (checklist)
- "Rate this session" (1-5 stars)

**Homework loop:** Homework items appear on the Home page as gentle reminders. Completed homework feeds back into the next Prep Pack.

---

### Section 4: 🆘 Grounding & Coping Exercises — NEW

Interactive exercises for in-the-moment use. These go beyond the Library's educational slides about grounding — they're **tools you use, not lessons you read**.

| Exercise | What It Does | Offline? |
|----------|-------------|---------|
| **Box Breathing** | Animated 4-4-4-4 breathing guide with visual + optional haptic | ✅ |
| **5-4-3-2-1 Grounding** | Interactive step-by-step sensory exercise (user types responses) | ✅ |
| **Body Scan** | Visual body outline with guided attention, tap-to-advance | ✅ |
| **Quick Journal** | "What am I feeling right now?" → shortcut to free-form entry | ✅ |
| **Safety Affirmations** | Customizable calming statements (defaults + user-added) | ✅ |

All work **100% offline** — critical for anxiety/crisis moments.

---

## 🏗️ Page Structure

```
/toolkit                          → Main Toolkit page (bottom nav tab)
/toolkit/journey/[collectionId]/[slideGroupId]
                                  → Preparation journey slides (reuses existing Slide components)
/toolkit/prep-pack                → Prep Pack generation + list
/toolkit/prep-pack/[id]           → View specific saved prep pack
/toolkit/session/new              → New session (before/after flow)
/toolkit/session/[id]             → View past session notes
/toolkit/grounding/breathing      → Box breathing exercise
/toolkit/grounding/five-senses    → 5-4-3-2-1 grounding exercise
/toolkit/grounding/body-scan      → Body scan exercise
/toolkit/grounding/affirmations   → Safety affirmations
```

---

## 📱 UI Layout (Toolkit Main Page)

```
┌─────────────────────────────────┐
│  toolkit.                       │  ← page title (lowercase, period — matches app style)
│  Your therapy companion         │
│                                 │
│  ── preparation journey ──      │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ① Learn About Therapy    ✅ ││  ← Completed (green check)
│  │    3 chapters               ││
│  ├─────────────────────────────┤│
│  │ ② Your Mental Health Hx  🔵 ││  ← In progress (partial)
│  │    4 chapters · 2/4 done    ││
│  ├─────────────────────────────┤│
│  │ ③ Your Lifestyle & Support ○ ││  ← Not started
│  │    4 chapters               ││
│  ├─────────────────────────────┤│
│  │ ④ Prepare for Session     ○ ││
│  │    5 chapters               ││
│  └─────────────────────────────┘│
│                                 │
│  ── session prep pack ──        │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🗂️ Generate a summary of   ││
│  │ your journals for therapy   ││
│  │                             ││
│  │ [Generate Prep Pack]        ││
│  │ Last: Mar 7 · 12 journals   ││
│  └─────────────────────────────┘│
│                                 │
│  ── upcoming session ──         │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📅 No session scheduled     ││
│  │ [Schedule Session]          ││
│  └─────────────────────────────┘│
│                                 │
│  ── quick tools ──              │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🫁   │ │ 👁️   │ │ 🧘   │   │
│  │Breath│ │Ground│ │ Scan │   │
│  └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐            │
│  │ ✏️   │ │ 💬   │            │
│  │Quick │ │Affirm│            │
│  │Write │ │ation │            │
│  └──────┘ └──────┘            │
│                                 │
│  ── therapy homework ──         │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ☑ Practice box breathing    ││
│  │ ☐ Journal about childhood   ││
│  └─────────────────────────────┘│
│                                 │
│  ── past sessions ──            │
│                                 │
│  ┌─────────────────────────────┐│
│  │ Mar 3 — "Work anxiety"     ││
│  │ Mood: � → �  ⭐⭐⭐⭐     ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

---

## 🔗 Integration with Existing Systems

| Existing System | How Toolkit Uses It |
|---|---|
| **Library Collections** | 4 therapy collections MOVED to Toolkit; Library filters them out |
| **Slide Components** | Preparation journey reuses existing Slide page components from learn_and_prepare |
| **user_learned Store** | Tracks progress through preparation journey steps |
| **AI Service (GPT-4o-mini)** | Generates Prep Pack summaries from journal data |
| **Qdrant (RAG)** | Retrieves semantically relevant past journals for Prep Pack |
| **AI Memories** | Feeds detected patterns into Prep Pack |
| **SQLite** | Stores session notes, prep packs, homework, affirmations |
| **EmotionSliderV2** | Reused for before/after session mood check-ins |
| **Pinia Stores** | New `therapy_toolkit_store.ts` for state management |
| **TranquaraSDK** | New mixin for Prep Pack generation + session CRUD |
| **Offline-first** | Grounding tools work fully offline; cached Prep Packs viewable offline |

---

## 🔄 Impact on Library Page

The Library page (`/learn_and_prepare`) needs these changes:

1. **Filter out therapy collections** — exclude collections where `type === 'prepare'` AND the therapy-specific `learn` collection (ID: `33333333-3333-3333-3333-333333333333`)
2. **Remove `prepare` type** from featured/collection displays
3. **No content deletion** — collections still exist in the database; they're just rendered in Toolkit instead of Library

**Collections remaining in Library after move:**

| Collection | Type | Category |
|---|---|---|
| Introduction to Journaling | `learn` | mental_health |
| Understanding Anxiety | `learn` | anxiety |
| Better Sleep | `learn` | sleep |
| Understanding Emotions | `learn` | emotions |
| Mindfulness | `learn` | mindfulness |
| Self-Compassion | `learn` | compassion |
| Daily Reflection | (journal) | self_care |
| Checkins | (journal) | self_care |
| Productivity | (journal) | self_care |
| Stress | (journal) | mental_health |
| Relationships & Connection | (journal) | relationships |
| Gratitude Practice | (journal) | gratitude |

---

## 🆚 Inspirations vs. Therapy Toolkit

| Inspirations (Current) | Therapy Toolkit (Proposed) |
|---|---|
| Generic quotes | Structured therapy preparation journey |
| Static past prompts | AI-generated prep packs from user's own data |
| No actionable outcome | Exportable summary for therapist |
| Passive consumption | Interactive grounding exercises |
| Therapy content buried in Library | Therapy content front and center |
| Doesn't justify the app name | **IS** the "TheraPrep" differentiator |

---

## 🔄 The TheraPrep Loop

The Toolkit creates a **closed feedback loop** across the entire app:

```
  ┌────────────────────────────────────────────────────────────┐
  │                                                            │
  │   TOOLKIT                                                  │
  │                                                            │
  │   1. Preparation Journey                                   │
  │      Learn → Reflect History → Lifestyle → Set Goals       │
  │      (moved from Library, one-time guided path)            │
  │                                                            │
  │   2. Generate Prep Pack                                    │
  │      AI synthesizes ALL your journals + memories           │
  │      (including responses from step 1)                     │
  │                                                            │
  │   3. Session Tracker                                       │
  │      Before: mood + talking points + linked Prep Pack      │
  │      After: takeaways + homework + rating                  │
  │                                                            │
  │   4. Use Grounding Tools                                   │
  │      Breathing, 5-4-3-2-1, Body Scan (before/during)      │
  │                                                            │
  │                          ↓                                 │
  │                                                            │
  │   DAILY JOURNALING (Home)                                  │
  │   5. Work on homework, journal daily                       │
  │   6. AI "Go Deeper" reflects on progress                   │
  │                                                            │
  │                          ↓                                 │
  │                                                            │
  │   BACK TO TOOLKIT                                          │
  │   7. Next Prep Pack includes homework status               │
  │   8. Schedule next session → repeat from step 2            │
  │                                                            │
  └────────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Metrics

1. **Preparation Journey Completion** — % of users who complete all 4 journey steps
2. **Prep Pack Generation Rate** — % of users who generate ≥1 prep pack per month
3. **Session Note Completion** — % of sessions with both "before" and "after" notes
4. **Grounding Tool Usage** — frequency of breathing/grounding exercises per week
5. **Homework Completion Rate** — % of homework items checked off between sessions
6. **Library Clarity** — does removing therapy content improve Library navigation?

---

## 📂 Related Documentation

- [Feature Backlog — Profile Summarizing](../Feature%20backlog/Feature%20recommendation.md) — Prep Pack builds on this idea
- [02. Journal Feature](../02.%20Jounral%20Feature/) — Core journaling that feeds Prep Pack
- [03. Micro Learning](../03.%20Micro%20learning/) — Library system that therapy collections move FROM
- [07. Progress](../07.%20Progress/) — Mood data reused in Prep Pack summaries
- [AI Service Processor](../../../tranquara_ai_service/service/ai_service_processor.py) — RAG pipeline for Prep Pack generation
