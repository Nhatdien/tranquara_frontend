# 📚 Micro Learning - Overview

## 🎯 Purpose

Provide bite-sized educational content about psychology, therapy, emotional wellness, and journaling to help users build knowledge gradually. Library-based lessons (2-5 minutes each) allow users to learn at their own pace without pressure, covering topics from mindfulness basics to therapy preparation.

## 📊 Status

- **Current Status**: 🧠 Planned
- **Priority**: High
- **Target Release**: v1.1
- **Dependencies**: 
  - Collections & Slide Groups system (database)
  - User Authentication 
  - Learning progress tracking
  - Vector search (Qdrant) for semantic discovery

## 🎨 User Value

- **Self-directed learning**: Browse and choose lessons based on current needs
- **Accessible education**: Learn psychology basics in small, manageable chunks
- **Therapy preparation**: Structured content to prepare for first therapy sessions
- **No pressure**: Learn on your own schedule (2-5 minutes per lesson)
- **Foundation building**: Understand mental health concepts at your own pace
- **Offline access**: All core lessons bundled with app installation

## 🔑 Key Features

### Core Learning Experience
- **Lesson Library**: Browse lessons organized by categories and topics
- **Slide-Based Lessons**: Interactive content using existing slide types (doc, cta, journal_prompt, etc.)
- **Multiple Categories**: Mindfulness, stress management, emotional regulation, therapy prep, journaling skills
- **Progress Tracking**: Simple counter showing total completed lessons
- **Search & Discovery**: Find lessons by keyword or topic
- **Journal Integration**: Journal prompts within lessons link back to source lesson

### Content & Personalization
- **Therapy Prep Collection**: Dedicated collection covering therapy basics (same structure as other collections)
- **AI Recommendations (Opt-in)**: Optional personalized suggestions based on journal patterns
- **Further Reading**: External resources for deeper exploration
- **Interactive Elements**: Emotion checks, breathing exercises, reflection prompts

## 📋 Success Criteria

- [ ] Users can browse and discover lessons by category
- [ ] Lesson completion rate > 70% (users who start finish the lesson)
- [ ] Search returns relevant results (keyword + semantic)
- [ ] Journal entries from lessons properly link back to source
- [ ] All core lessons (20+) accessible offline after app install
- [ ] AI recommendations (when enabled) are relevant (>75% user acceptance)
- [ ] Progress counter accurately reflects completed lessons
- [ ] Content is accessible and jargon-free

## 🔗 Related Features

- **[Journaling](../02.%20Jounral%20Feature/)** - Lessons include journal prompts that create linked entries
- **[User Profile](../06.%20User%20profile%20and%20Settings/)** - AI recommendation opt-in setting
- **[Database Schema](../00-DATABASE/)** - `journal_templates` (type='learn'), `user_learned_slide_groups`

## 📝 Notes

### Design Decisions

1. **Why Library-Based (Not Daily Push)?**
   - Users choose when they want to learn (respects autonomy)
   - Avoids notification fatigue and pressure
   - Better for users in crisis (don't need "homework")
   - Allows focused learning on specific topics when needed
   - Still supports habit building through progress tracking

2. **Therapy Prep as Regular Collection**
   - `type: "learn"` with `category: "therapy_prep"`
   - No special behavior—uses same slide types as other lessons
   - Simplifies architecture and content management
   - Allows flexibility in creating prep pathways

3. **Offline-First with Bundled Content**
   - Core lessons (20-30) bundled with app installation
   - Reduces barrier to learning (no download wait)
   - Works immediately offline (critical for mental health app)
   - New lessons can be synced later when online
   - Keeps app size reasonable (<50MB for content)

4. **AI Recommendations: Opt-In, Manual Trigger**
   - **Default OFF**: Respects privacy, no assumptions
   - **User-initiated**: Access via Settings → "Get Personalized Suggestions"
   - **How it works**: Analyzes last 7-14 days of journals for themes
   - **Proactive messaging**: "We noticed you wrote about stress 3x this week. Try: *Stress Regulation Basics*"
   - **Fallback**: If no patterns, suggest "essential" lessons for new users

5. **Simple Progress (Not Gamification)**
   - Just a counter: "You've completed 12 lessons"
   - Avoids pressure or competition
   - Aligns with mental health focus (progress without judgment)
   - Future: Can add topic distribution chart if users request it

6. **Lesson Completion: Explicit User Action**
   - User must tap "Finish" button on final slide
   - Prevents accidental completions from quick scrolling
   - Encourages mindful engagement with content
   - Allows users to revisit without re-completing

### Content Types in Lessons

Based on existing slide schema:
- **`doc`**: Text content with headers and body (HTML formatted)
- **`cta`**: Interactive components (emotion check-in, breathing exercise)
- **`journal_prompt`**: Direct link to journaling with specific question
- **`further_reading`**: External articles, videos, or resources
- **`emotion_log`**: Visual emotion slider (reused from journaling)
- **`sleep_check`**: Sleep quality slider (reused from journaling)

All slides from journaling feature are available in learning lessons.

### Journal Integration

When a lesson contains `journal_prompt` slides:
- All prompts in one lesson → **one combined journal entry**
- Entry stored in `user_journals` with:
  - `collection_id`: Links back to lesson
  - `source_type`: Set to `"lesson"`
- User can view journal history with lesson badges
- Tapping badge reopens the original lesson

### Content Creation Workflow

**Phase 1 - Manual Curation** (Current):
- Psychology experts/admins write lessons
- Insert directly into PostgreSQL (`collections` + `slide_groups`)
- Review for accuracy and accessibility before publishing
- Use existing slide schema (no custom authoring tool yet)

**Phase 2 - AI-Assisted Expansion** (Future):
- Generate lesson variations based on templates
- Human review before publishing
- Community-submitted lessons (curated)

### Metrics to Track

**Engagement Metrics:**
- Total lessons completed (per user)
- Most viewed lessons (popularity)
- Lesson completion rate (started vs. finished)
- Time spent per lesson
- Search queries and click-through rate

**Content Performance:**
- Completion rate by category
- Drop-off points (which slides users abandon on)
- "Was this helpful?" feedback scores
- External link click-through (further reading)

**AI Recommendation Metrics (when enabled):**
- Suggestion acceptance rate
- Relevance scores (user feedback)
- Journal theme → lesson match accuracy

### Future Enhancements

- [ ] Topic distribution visualization (radar chart)
- [ ] Learning streaks (similar to journaling streaks)
- [ ] Custom lesson paths based on user goals
- [ ] Audio narration for lessons
- [ ] Gamification (badges for topic completion)
- [ ] Social sharing of favorite lessons
- [ ] In-app lesson feedback and ratings
- [ ] CMS/admin panel for content authoring

---

**Last Updated**: November 22, 2025
