# 📚 Micro Learning Feature

> Self-directed, bite-sized psychology lessons for mental wellness education

---

## 📑 Core Documentation

| File | Description |
|------|-------------|
| **[00-OVERVIEW.md](./00-OVERVIEW.md)** | Feature purpose, user value, and design decisions |
| **[01-LEARNING-FLOWS.md](./01-LEARNING-FLOWS.md)** | User journeys with Mermaid diagrams for all flows |
| **[02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md)** | Architecture, offline bundling, AI recommendations, search |
| **[03-DATA-MODELS.md](./03-DATA-MODELS.md)** | Database schemas (PostgreSQL + SQLite via @capacitor-community/sqlite) |

---

## 📂 Additional Documentation

| File/Folder | Description |
|-------------|-------------|
| **[Micro Learning Feature Design (v1 Draft).md](./Micro%20Learning%20Feature%20Design%20(v1%20Draft).md)** | Initial design draft (historical reference) |
| **[1. How the Journal will display...md](./1.%20How%20the%20Journal%20will%20display%20in%20history%20if%20it's%20taken%20from%20a%20lesson.md)** | Journal integration details |
| **[2. How to search...md](./2.%20How%20to%20search%20for%20the%20learning%20material.md)** | Search implementation notes |
| **[3. What metric to be recorded...md](./3.%20What%20metric%20to%20be%20recorded%20in%20the%20progress%20with%20lessons.md)** | Progress metrics spec |
| **[4. how to find image illustration...md](./4.%20how%20to%20find%20image%20illustration%20for%20lessons.md)** | Content illustration strategy |

---

## 🎯 Quick Summary

**Status**: 🧠 Planned  
**Priority**: High  
**Target**: v1.1

### What This Feature Does

Users get:
- **Library-based learning**: Browse and choose 2-5 minute psychology lessons
- **Therapy preparation**: Dedicated collection covering therapy basics
- **Interactive content**: Using existing slide types (doc, cta, journal_prompt, etc.)
- **Offline-first**: Core lessons bundled with app installation (~20-30 lessons)
- **Optional AI recommendations**: Opt-in personalized suggestions based on journal patterns
- **Simple progress tracking**: Counter showing total completed lessons
- **Journal integration**: Lessons can prompt journaling that links back to source

### Technology

- **Content Storage**: PostgreSQL (`collections`, `slide_groups`)
- **Progress Tracking**: `user_learned_lessons`, `lesson_progress_metrics`
- **Search**: PostgreSQL full-text + Qdrant vector search (semantic fallback)
- **AI Recommendations**: Python AI service + Qdrant (opt-in only, manual trigger)
- **Offline**: Core lessons bundled with app, synced via SQLite (`@capacitor-community/sqlite`)
- **Content Format**: JSONB slide schemas (reuses journaling slide types)

---

## 📚 Content Categories

All lessons use `type: "learn"` with different `category` values:

- **Mindfulness**: Present-moment awareness, meditation basics
- **Emotional Regulation**: Understanding and managing emotions
- **Stress Management**: Coping strategies, relaxation techniques
- **Therapy Prep**: What to expect, first session prep, common approaches (CBT, DBT)
- **Journaling Skills**: Reflection techniques, therapeutic writing prompts
- **Communication**: Relationship patterns, boundaries, assertiveness
- **Self-Compassion**: Treating yourself with kindness, reducing self-criticism
- **Sleep Wellness**: Sleep hygiene, rest and recovery

---

## 🔗 Related Features

- **[Journaling](../02.%20Jounral%20Feature/)** - Lessons include journal prompts that create linked entries
- **[User Profile](../06.%20User%20profile%20and%20Settings/)** - AI recommendation opt-in setting
- **[Database Schema](../00-DATABASE/)** - `collections`, `slide_groups`, `user_learned_lessons`

---

## 🚀 Implementation Status

**Core Files Created:**
- [x] 00-OVERVIEW.md - Updated with clarifications
- [x] 01-LEARNING-FLOWS.md - Complete user journeys with Mermaid diagrams
- [x] 02-TECHNICAL-SPEC.md - Architecture, offline, AI, search specs
- [x] 03-DATA-MODELS.md - Database schemas (server + client)
- [x] README.md - Updated navigation

**Feature Checklist:**
- [ ] Content schema implemented in database
- [ ] Lesson library UI component
- [ ] Slide renderer (reuse journaling components)
- [ ] Search implementation (PostgreSQL + Qdrant)
- [ ] Offline bundling system
- [ ] Progress tracking API + UI
- [ ] AI recommendation engine (opt-in)
- [ ] Journal integration (collection_id, source_type)
- [ ] 20-30 core lessons authored
- [ ] Therapy prep collection content

---

## 📊 Key Metrics

**Engagement:**
- Total lessons completed (per user)
- Lesson completion rate (started → finished)
- Time spent per lesson
- Search usage and click-through

**Content Performance:**
- Completion rate by category
- Drop-off points (abandoned slides)
- "Was this helpful?" feedback scores
- Further reading link clicks

**AI Recommendations (when enabled):**
- Opt-in rate
- Suggestion acceptance rate
- Relevance scores (user feedback)
- Journal theme → lesson match accuracy

---

## ✍️ Content Guidelines

- **Length**: 2-5 minutes reading time (5-8 slides max)
- **Language**: Simple, jargon-free, compassionate tone
- **Evidence**: Cite psychology research when appropriate (in further_reading)
- **Non-Clinical**: Educational, not prescriptive or diagnostic
- **Accessibility**: WCAG AA compliant, screen-reader friendly
- **Inclusivity**: Culturally sensitive, gender-neutral language

---

## 🎨 Slide Type Usage

Lessons can use any combination of these slide types:

| Slide Type | Purpose | Example Use |
|------------|---------|-------------|
| `doc` | Text content | Explain concepts, provide context |
| `cta` | Interactive component | Breathing exercise, emotion check-in |
| `journal_prompt` | Reflection question | Trigger journaling with pre-filled prompt |
| `further_reading` | External links | Research articles, videos, resources |
| `emotion_log` | Emotion slider | Quick mood check within lesson |
| `sleep_check` | Sleep slider | Track rest quality (if relevant to topic) |

See **[Content Type Schemas](../02.%20Jounral%20Feature/Content%20type%20schemas%20design.md)** for detailed specifications.

---

## 🗂️ Example Lesson Structure

**Title**: "What to Expect in Your First Therapy Session"  
**Category**: `therapy_prep`  
**Duration**: 4 minutes  
**Slides**:

1. **doc** - Introduction: "Starting therapy can feel intimidating..."
2. **doc** - What happens in session 1: Assessment, goals, confidentiality
3. **cta** - Deep breathing: "Take a moment to calm any nerves"
4. **journal_prompt** - "What questions do you want to ask your therapist?"
5. **doc** - Setting expectations: Frequency, approach, communication
6. **further_reading** - External articles about therapy types (CBT, DBT, etc.)

---

**Last Updated**: November 22, 2025
- **Actionable**: Include reflection prompts or exercises
- **Inclusive**: Consider diverse experiences and backgrounds

---

**Last Updated**: November 21, 2025
