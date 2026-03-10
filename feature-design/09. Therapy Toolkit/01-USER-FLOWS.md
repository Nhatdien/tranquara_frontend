# Therapy Toolkit — User Flows

---

## Flow 1: Preparation Journey (Moved from Library)

The 4 therapy-related collections from the Library are reorganized into a step-by-step journey on the Toolkit page. Users progress through them sequentially.

```
User opens Toolkit tab
    │
    ├── Sees "Preparation Journey" section
    │   ├── Step 1: Learn About Therapy           [✅ / 🔵 / ○]
    │   ├── Step 2: Your Mental Health History     [✅ / 🔵 / ○]
    │   ├── Step 3: Your Lifestyle & Support       [✅ / 🔵 / ○]
    │   └── Step 4: Prepare for Your Session       [✅ / 🔵 / ○]
    │
    ├── Taps on a step (e.g., Step 1: Learn About Therapy)
    │       │
    │       ├── Navigates to collection view showing slide groups (chapters):
    │       │   ├── "Signs that you need therapy"
    │       │   ├── "What to know before the first therapy session"
    │       │   └── "What happens in the first session?"
    │       │
    │       ├── Taps a chapter → opens existing Slide viewer
    │       │   (reuses /learn_and_prepare/collection/[id]/[slideGroupId] component)
    │       │   For learn-type: doc slides + further_reading
    │       │   For prepare-type: journal_prompt slides (user writes answers)
    │       │
    │       ├── On completing a chapter → marks as done in user_learned store
    │       │
    │       └── Back to Toolkit → step shows updated progress
    │
    └── When all 4 steps completed → celebration/milestone UI
        "You're prepared! Generate a Prep Pack to summarize your journey."
```

### Journey Steps Detail:

**Step 1: Learn About Therapy** (source: `Therapy Preparation` learn collection)
- Type: Educational slides (`doc` + `further_reading`)
- Chapters: Signs you need therapy, What to know before first session, What happens in first session
- Purpose: Knowledge foundation for therapy beginners

**Step 2: Your Mental Health History** (source: `Mental Health History` prepare collection)
- Type: Journal prompts (`journal_prompt`)
- Chapters: Previous diagnoses, Past treatment, Medications, History of emotional crisis
- Purpose: Structured self-reflection that feeds into Prep Pack

**Step 3: Your Lifestyle & Support** (source: `Lifestyle and Support` prepare collection)
- Type: Journal prompts (`journal_prompt`)
- Chapters: Sleep habits, Diet and exercise, Social support, Daily routines
- Purpose: Lifestyle context for therapist and AI

**Step 4: Prepare for Your Session** (source: `Therapy Preparation` prepare collection)
- Type: Mixed (`doc` + `journal_prompt`)
- Chapters: Goal for therapy, Past experience, Why now, Concerns, What therapist should know
- Purpose: Direct therapy session preparation

### Edge Cases:
- **Returning user** → can revisit any step, re-answer prompts (updates journal entries)
- **Skipping steps** → allowed, but Prep Pack notes incomplete steps
- **Offline** → all content works offline (slides + prompts stored in SQLite)
- **Already completed prepare collections in Library** → progress carries over via user_learned store

---

## Flow 2: Session Prep Pack Generation (AI)

```
User has been journaling (daily journals + preparation journey responses)
    │
    ├── On Toolkit main page → Sees "Session Prep Pack" card
    │
    ├── Taps [Generate Prep Pack]
    │       │
    │       ├── Select date range (default: "Last 7 days")
    │       │   ├── Last 7 days
    │       │   ├── Last 14 days
    │       │   ├── Last 30 days
    │       │   └── Custom range
    │       │
    │       ├── Loading state: "Analyzing your journals..."
    │       │   (AI Service: journals from SQLite + RAG from Qdrant + AI Memories)
    │       │
    │       └── Prep Pack generated → navigates to /toolkit/prep-pack/[id]
    │
    ├── Views Prep Pack:
    │   ├── 📊 Mood Overview (trend line + average)
    │   ├── 🏷️ Key Themes (tag chips)
    │   ├── ⚡ Emotional Highlights (notable entries linked)
    │   ├── 🔄 Patterns Noticed (from AI Memories)
    │   ├── 💬 Suggested Discussion Points
    │   ├── 🌱 Growth Moments
    │   └── 📚 Preparation Status (which journey steps completed/incomplete)
    │
    ├── Actions on Prep Pack:
    │   ├── [Share / Export] → Copy to clipboard / PDF (future)
    │   ├── [Add personal notes] → append user's own talking points
    │   └── [Save] → stored in SQLite for future reference
    │
    └── Past Prep Packs accessible from Toolkit main page
```

### Connection to Preparation Journey:
- Prep Pack includes a "Preparation Status" section showing which journey steps the user completed
- If user answered journal prompts from Step 2-4, those responses are included in analysis
- If steps are incomplete → Prep Pack suggests: "Complete Step 2: Mental Health History for a richer summary"

### Edge Cases:
- **No journals in date range** → "You haven't written any journals in this period. Try a wider range or start journaling today."
- **Very few journals (< 3)** → Warning: "Limited data — prep pack may not capture full picture."
- **Offline** → Can view previously saved Prep Packs, but cannot generate new ones (requires AI Service)
- **AI disabled in settings** → Hide Prep Pack card, show message: "Enable AI personalization to use Session Prep Packs"

---

## Flow 3: Session Tracker (Before & After)

```
User wants to log a therapy session
    │
    ├── From Toolkit main page → [New Session] or [Schedule Session]
    │
    ├── BEFORE SESSION (can be done anytime before)
    │   ├── "When is your session?" → Date & time picker
    │   ├── "How are you feeling right now?" → EmotionSliderV2 (mood 1-10)
    │   ├── "What do I want to talk about?" → Multi-line text input
    │   ├── "My top priority for this session" → Single-line input
    │   ├── [Link Prep Pack] → optionally attach a generated Prep Pack
    │   └── [Save] → stores "before" snapshot
    │
    ├── DURING SESSION (optional, minimal)
    │   └── Quick note-taking area (if user opens app during session)
    │
    ├── AFTER SESSION (prompted or manual)
    │   ├── "How do you feel after the session?" → EmotionSliderV2
    │   ├── "Key takeaways" → Multi-line text
    │   ├── "Homework / Action items" → Checklist-style input
    │   │   ├── [ ] Practice breathing when anxious
    │   │   ├── [ ] Journal about childhood memory
    │   │   └── [+ Add item]
    │   ├── "Rate this session" → 1-5 stars
    │   └── [Save] → stores "after" snapshot
    │
    └── Session card now shows on Toolkit main page:
        ├── Date
        ├── Topic summary
        ├── Mood before → after (visual comparison)
        └── Session rating stars
```

### Session Lifecycle:
```
[Scheduled] → [Before Notes Added] → [Session Day] → [After Notes Added] → [Completed]
```

### Reminder Flow (Future Enhancement):
```
Session scheduled for Thursday 2pm
    │
    ├── Wednesday evening notification:
    │   "Your therapy session is tomorrow. Want to review your Prep Pack?"
    │
    ├── Thursday morning notification:
    │   "Session today at 2pm. Take a moment to set your intention."
    │
    └── Thursday evening notification:
        "How did your session go? Capture your takeaways while they're fresh."
```

---

## Flow 4: Grounding & Coping Exercises

```
User feeling anxious / overwhelmed
    │
    ├── Opens Toolkit → Quick Tools grid
    │
    ├── BOX BREATHING
    │   ├── Full-screen breathing animation
    │   ├── 4 phases: Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
    │   ├── Visual: expanding/contracting circle or square
    │   ├── Optional haptic feedback on phase transitions
    │   ├── Duration: 1 min / 3 min / 5 min selector
    │   └── [Done] → optional mood check-in after
    │
    ├── 5-4-3-2-1 GROUNDING
    │   ├── Step-by-step guided flow:
    │   │   ├── "Name 5 things you can SEE" → text inputs or taps
    │   │   ├── "Name 4 things you can TOUCH"
    │   │   ├── "Name 3 things you can HEAR"
    │   │   ├── "Name 2 things you can SMELL"
    │   │   └── "Name 1 thing you can TASTE"
    │   ├── Calming transitions between steps
    │   └── Completion: "You're here. You're present. You're safe."
    │
    ├── BODY SCAN
    │   ├── Visual body outline
    │   ├── Guided focus areas: head → shoulders → chest → arms → stomach → legs → feet
    │   ├── At each area: "Notice any tension. Breathe into it."
    │   ├── Tap to advance through areas
    │   └── Completion summary
    │
    ├── QUICK JOURNAL
    │   ├── Shortcut to free-form journal entry
    │   ├── Pre-filled prompt: "Right now, I'm feeling..."
    │   └── Same flow as existing /journaling page
    │
    └── SAFETY AFFIRMATIONS
        ├── Scrollable cards of affirmations
        ├── Default set + user can add their own
        ├── Examples:
        │   ├── "This feeling is temporary."
        │   ├── "I am safe in this moment."
        │   ├── "I can handle this, one breath at a time."
        │   └── "It's okay to feel what I'm feeling."
        └── Tap to save favorites
```

### Offline Behavior:
- All grounding tools work **100% offline** (no API calls)
- Breathing patterns, body scan steps, and affirmations stored locally
- User-added affirmations saved in SQLite

---

## Flow 5: Toolkit Empty State (New User)

```
New user opens Toolkit for the first time
    │
    ├── Welcome message:
    │   "Your Therapy Toolkit"
    │   "Everything you need before, during, and after therapy."
    │
    ├── Preparation Journey is front and center:
    │   "Start your therapy preparation journey"
    │   Step 1: Learn About Therapy → [Begin]
    │   (journey steps guide the user naturally)
    │
    ├── Quick tools (Grounding) accessible immediately:
    │   (No data needed — breathing and affirmations work from day 1)
    │
    ├── Prep Pack + Session Tracker show encouraging empty state:
    │   "Once you've journaled a bit, you can generate a Prep Pack"
    │   "After your first session, track your progress here"
    │
    └── The preparation journey IS the onboarding for the Toolkit
```

---

## Flow 6: Homework Tracking (Cross-Feature)

```
After a therapy session, user adds homework items:
    ├── [ ] Practice box breathing daily
    ├── [ ] Write about childhood memory
    ├── [ ] Try the 5-4-3-2-1 exercise when anxious
    │
    ├── These items appear on the HOME page as gentle reminders
    │   (in a "Therapy Homework" card below Daily Check-In)
    │
    ├── User can check items off from home or toolkit
    │
    └── Next session's Prep Pack includes homework completion status
```

This creates a **closed loop**: Preparation Journey → Journal → Prep Pack → Session → Homework → Daily Practice → Journal
