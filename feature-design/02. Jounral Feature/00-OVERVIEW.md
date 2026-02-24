# ✍️ Emotion Journaling - Overview# ✍️ Emotion Journaling - Overview



## 🎯 Purpose## 🎯 Purpose



Provide an AI-assisted journaling experience that helps users express emotions, build reflection habits, and track mental health patterns. The feature combines conversational AI guidance with flexible journaling formats (template-based or free-form).Provide an AI-assisted journaling experience that helps users express emotions, build reflection habits, and track mental health patterns. The feature combines conversational AI guidance with flexible journaling formats (template-based or free-form).



------



## 📊 Status## 📊 Status



- **Current Status**: 🧠 In Development- **Current Status**: 🧠 In Development

- **Priority**: High (P0)- **Priority**: High (P0)

- **Target Release**: v1.0- **Target Release**: v1.0

- **Dependencies**:- **Dependencies**:

  - User Authentication (completed)  - User Authentication (completed)

  - AI Service (Python FastAPI + HuggingFace)  - AI Service (Python FastAPI + HuggingFace)

  - Vector Database (Qdrant)  - Vector Database (Qdrant)

  - RabbitMQ for async processing  - RabbitMQ for async processing

  - Offline-First Storage (SQLite via @capacitor-community/sqlite + PostgreSQL sync)  - Offline-First Storage (SQLite via @capacitor-community/sqlite + PostgreSQL sync)



------



## 🎨 User Value## 🎨 User Value



- **Emotional clarity**: AI-guided prompts help users articulate feelings- **Emotional clarity**: AI-guided prompts help users articulate feelings

- **Habit building**: Daily prompts and streak tracking encourage consistency- **Habit building**: Daily prompts and streak tracking encourage consistency

- **Pattern recognition**: Track emotional trends over time- **Pattern recognition**: Track emotional trends over time

- **Safe space**: Non-judgmental AI listener for emotional expression- **Safe space**: Non-judgmental AI listener for emotional expression

- **Flexible formats**: Choose structured prompts or free-form writing- **Flexible formats**: Choose structured prompts or free-form writing

- **Therapy preparation**: Organized reflection to bring to therapy sessions- **Therapy preparation**: Organized reflection to bring to therapy sessions

- **Offline-first**: Journal anytime, anywhere without internet dependency- **Offline-first**: Journal anytime, anywhere without internet dependency



------



## 🔑 Key Features## 🔑 Key Features



### Core Journaling### Core Journaling



- **Template-Based Journaling**: Structured slide groups for specific topics (therapy prep, daily reflection, stress management)- **Template-Based Journaling**: Structured slide groups for specific topics (therapy prep, daily reflection, stress management)

- **Free-Form Journaling**: Open-ended blank journal for spontaneous expression- **Free-Form Journaling**: Open-ended blank journal for spontaneous expression

- **Direction-Based "Go Deeper" Assistant**: User-guided AI questions with 5 reflection directions:- **Direction-Based "Go Deeper" Assistant**: User-guided AI questions with 5 reflection directions:

  - 🧠 **Understand why** - Explore reasons and causes  - 🧠 **Understand why** - Explore reasons and causes

  - 💭 **Explore emotions** - Dive into feelings beyond the surface  - 💭 **Explore emotions** - Dive into feelings beyond the surface

  - 🔁 **Look for patterns** - Recognize recurring themes  - 🔁 **Look for patterns** - Recognize recurring themes

  - 🧩 **Challenge thinking** - Reframe assumptions and beliefs  - 🧩 **Challenge thinking** - Reframe assumptions and beliefs

  - 🌱 **Focus on growth** - Learn and plan for the future  - 🌱 **Focus on growth** - Learn and plan for the future

- **Speech Input**: Native voice-to-text for easier expression (tap-to-speak)- **Speech Input**: Native voice-to-text for easier expression (tap-to-speak)

- **Auto-Save**: Automatic draft saving as users type - no manual save needed- **Auto-Save**: Automatic draft saving as users type - no manual save needed

- **Edit & Delete**: Users can revisit, edit, or delete past journal entries- **Edit & Delete**: Users can revisit, edit, or delete past journal entries



### Interactive Slides### Interactive Slides

- **Journal Prompt Slides**: Text input with AI assistance- **Journal Prompt Slides**: Text input with AI assistance

- **Emotion Log Slides**: Visual slider with animated weather metaphors (storm → sunny)- **Emotion Log Slides**: Visual slider with animated weather metaphors (storm → sunny)

- **Sleep Check Slides**: Hour slider with animated sleep character (exhausted → well-rested)- **Sleep Check Slides**: Hour slider with animated sleep character (exhausted → well-rested)

- **Doc/Info Slides**: Educational content with sources and rich formatting- **Doc/Info Slides**: Educational content with sources and rich formatting

- **Quiz Slides**: Interactive assessments and self-reflection exercises- **Quiz Slides**: Interactive assessments and self-reflection exercises



### Progress & Insights### Progress & Insights

- **Streak Tracking**: Daily journaling streaks with gamification- **Streak Tracking**: Daily journaling streaks with gamification

- **Emotion Trends**: Visualize emotional patterns over time- **Emotion Trends**: Visualize emotional patterns over time

- **Sleep Tracking**: Monitor sleep quality from sleep_check slides- **Sleep Tracking**: Monitor sleep quality from sleep_check slides

- **Word Count**: Track journaling volume and consistency- **Word Count**: Track journaling volume and consistency

- **Session Feedback**: Rate helpfulness after each session- **Session Feedback**: Rate helpfulness after each session



------



## 📋 Success Criteria## 📋 Success Criteria



- [ ] AI "Go Deeper" provides helpful, non-clinical follow-up questions- [ ] AI "Go Deeper" provides helpful, non-clinical follow-up questions

- [ ] Template slide groups guide users effectively through specific topics- [ ] Template slide groups guide users effectively through specific topics

- [ ] Free-form journaling feels natural and unrestrained- [ ] Free-form journaling feels natural and unrestrained

- [ ] Speech input accurately transcribes user voice (native device service)- [ ] Speech input accurately transcribes user voice (native device service)

- [ ] Emotion detection via manual tagging is intuitive and accurate- [ ] Emotion detection via manual tagging is intuitive and accurate

- [ ] Daily active users see streak counter and feel motivated- [ ] Daily active users see streak counter and feel motivated

- [ ] Users can view emotional trend charts and sleep patterns- [ ] Users can view emotional trend charts and sleep patterns

- [ ] Sessions auto-save without user intervention- [ ] Sessions auto-save without user intervention

- [ ] Users can successfully edit and delete past entries- [ ] Users can successfully edit and delete past entries

- [ ] App works fully offline with background sync when online- [ ] App works fully offline with background sync when online



------



## 🔗 Related Features## 🔗 Related Features



- **[User Authentication](../01.%20User%20register/)** - Required for personalized journaling- **[User Authentication](../01.%20User%20register/)** - Required for personalized journaling

- **[Therapy Preparation](../04.%20Prepare%20for%20Therapy/)** - Uses journal templates- **[Therapy Preparation](../04.%20Prepare%20for%20Therapy/)** - Uses journal templates

- **[Micro Learning](../03.%20Micro%20learning/)** - May prompt journaling exercises- **[Micro Learning](../03.%20Micro%20learning/)** - May prompt journaling exercises

- **[Database Schema](../00-DATABASE/)** - `user_journals`, `journal_templates`, `user_streaks`, `user_learned_slide_groups`- **[Database Schema](../00-DATABASE/)** - `user_journals`, `journal_templates`, `user_streaks`, `user_learned_slide_groups`



------



## 📝 Design Decisions## 📝 Design Decisions



### 1. **Why AI-Assisted?**

- Lowers barrier to entry for users unsure what to write

- Provides gentle prompts without feeling prescriptive---1. **Why AI-Assisted?**

- Helps users explore thoughts more deeply through "Go Deeper" functionality

- Non-judgmental companion for emotional expression   - Lowers barrier to entry for users unsure what to write

- **No chatbot interface**: Users click "Go Deeper" button for AI follow-up questions instead of continuous chat

## 📋 Success Criteria   - Provides gentle prompts without feeling prescriptive

### 2. **Template vs Free-Form**

- **Templates**: Slide groups guide users through specific therapy-prep topics or daily routines   - Helps users explore thoughts more deeply

- **Free-form**: Blank journal allows spontaneous expression without constraints

- Users can switch between modes based on need- [ ] AI "Go Deeper" provides helpful, non-clinical follow-up questions   - Non-judgmental companion for emotional expression

- Templates use structured slides (emotion logs, sleep checks, doc slides, journal prompts)

- [ ] Template slide groups guide users effectively through specific topics

### 3. **AI Behavior Guidelines**

- **Listen, don't diagnose**: AI encourages reflection, never provides clinical advice- [ ] Free-form journaling feels natural and unrestrained2. **Template vs Free-Form**

- **Follow the template**: When using templates, AI keeps conversation relevant to slide group topic (allows brief emotional tangents)

- **Be empathetic**: Validate feelings, ask open-ended questions- [ ] Speech input accurately transcribes user voice (native device service)   - Templates: Guide users through specific therapy-prep topics

- **Respect boundaries**: Don't push users to share more than they're comfortable with

- **Avoid suggesting actions**: AI should not tell users what to do, only help them explore their thoughts- [ ] Emotion detection via manual tagging is intuitive and accurate   - Free-form: Allows spontaneous expression without constraints

- **Healthcare safety**: Research AI pitfalls in mental healthcare to avoid harmful patterns

- [ ] Daily active users see streak counter and feel motivated   - Users can switch between modes based on need

### 4. **Collections & Slide Groups Architecture**

- **Collections**: Top-level groupings (e.g., "Daily Reflection", "Therapy Preparation", "Stress Management")- [ ] Users can view emotional trend charts and sleep patterns

- **Slide Groups**: Individual journaling sessions within a collection (e.g., "Morning", "Evening", "Weekly" within "Daily Reflection")

- **User Flow**: User selects Collection → views all Slide Groups → picks one to start session- [ ] Sessions auto-save without user intervention3. **AI Behavior Guidelines**

- **Two Collection Types** (stored in `journal_templates.type`):

  - **`journal`** (default) — Journaling prompt collections. Shown in **Categories** section on Library page.- [ ] Users can successfully edit and delete past entries   - **Listen, don't diagnose**: AI encourages reflection, never provides clinical advice

  - **`learn`** — Educational micro-learning collections. Shown in **Collections** section on Library page.

- Both types share the same `journal_templates` table and `slide_groups` JSONB structure- [ ] App works fully offline with background sync when online   - **Follow the template**: When using templates, AI keeps conversation on topic

- Both types share the same set of categories (e.g., "Mindfulness", "Stress Management")

   - **Be empathetic**: Validate feelings, ask open-ended questions

### 4a. **Library Page: Two Sections**

---   - **Respect boundaries**: Don't push users to share more than they're comfortable with

The Library page displays two distinct sections powered by the `type` column:



**📚 Collections (type = 'learn')**

- Horizontal scrollable cards showing learning collections## 🔗 Related Features### AI Autofill Strategies

- Each card displays: title, description, progress bar (completed/total slide groups)

- "See All" link appears if collection count > 3 → navigates to page grouping all learn collections by category

- Progress tracked via `user_learned_slide_groups` table

- **[User Authentication](../01.%20User%20register/)** - Required for personalized journaling**Case 1: Empty Input or Off-Topic**

**📝 All Categories (type = 'journal')**

- Category tabs/chips showing all available categories- **[Therapy Preparation](../04.%20Prepare%20for%20Therapy/)** - Uses journal templates- Generate subtle question related to template topic or recent journal themes

- Selecting a category → shows all slide groups from ALL journal-type collections in that category

- "See All" link on each category section → shows all slide groups for that category- **[Micro Learning](../03.%20Micro%20learning/)** - May prompt journaling exercises- Display in low opacity as suggestion, not intrusion



**Category Drill-Down (Journal Type)**:- **[Database Schema](../00-DATABASE/)** - `user_journals`, `journal_templates`, `user_streaks`, `user_learned_slide_groups`- Example: "How did that make you feel?" or "What happened next?"

```

Category "Mindfulness" selected

  → Collection A (Mindfulness) → Slide Groups 1, 2, 3

  → Collection B (Mindfulness) → Slide Groups 4, 5---**Case 2: User Writing Actively**

  → All shown as flat list of slide groups

```- Detect topic direction



**"See All" for Learn Collections**:## 📝 Design Decisions- Offer follow-up question in user's voice (first person)

```

All Learning Collections page- Example: User writes "I felt anxious today..." → Suggestion: "What triggered my anxiety?"

  ├── Category: Mindfulness

  │   ├── Collection A (with progress)### 1. **Why AI-Assisted?**

  │   └── Collection B (with progress)

  ├── Category: Stress Management- Lowers barrier to entry for users unsure what to write### Privacy & Security

  │   └── Collection C (with progress)

  └── Category: Therapy Prep- Provides gentle prompts without feeling prescriptive

      └── Collection D (with progress)

```- Helps users explore thoughts more deeply through "Go Deeper" functionality- Journal entries encrypted at rest



### 5. **Session = One Journal Entry**- Non-judgmental companion for emotional expression- AI processing happens server-side (not shared with third parties)

- Each complete slide group session creates ONE journal entry

- All slide responses (emotion logs, sleep checks, journal prompts) are stored together in the entry- **No chatbot interface**: Users click "Go Deeper" button for AI follow-up questions instead of continuous chat- Users can delete journal entries permanently

- Auto-saves as user completes slides

- If user doesn't input anything in a slide, nothing is saved for that slide- No journal data used for model training without explicit consent

- Users can return to incomplete entries to continue or edit later

### 2. **Template vs Free-Form**

### 6. **Draft & Edit Philosophy**

- **Auto-save on input**: No manual save button - saves automatically when user types/inputs- **Templates**: Slide groups guide users through specific therapy-prep topics or daily routines### Future Enhancements

- **No empty entries**: Nothing saved if user provides no input

- **Edit anytime**: Users can revisit past entries to edit or delete- **Free-form**: Blank journal allows spontaneous expression without constraints

- **No expiration**: Drafts never expire - users can resume incomplete sessions days/weeks later

- Users can switch between modes based on need- [ ] Journal entry sharing with therapist (optional)

### 7. **Speech Input Design**

- **Tap-to-speak**: User taps mic button, speaks, taps again to transcribe (not real-time)- Templates use structured slides (emotion logs, sleep checks, doc slides, journal prompts)- [ ] Collaborative journaling (shared entries with trusted person)

- **Native service**: Uses iOS/Android built-in speech recognition (no third-party API)

- **Privacy-first**: Speech processed on-device when possible- [ ] Audio journal entries (saved as audio + transcript)



### 8. **Metrics & Tracking**### 3. **AI Behavior Guidelines**- [ ] Journal export (PDF, text file)

- **Emotion detection**: Manual tagging via emotion_log slides (not automatic text analysis)

- **Sleep tracking**: Only from sleep_check slides (not from journal content analysis)- **Listen, don't diagnose**: AI encourages reflection, never provides clinical advice- [ ] Advanced sentiment analysis (multi-emotion detection)

- **Streak system**: Tracks consecutive journaling days

- **Word counts**: Total words written across all journal entries- **Follow the template**: When using templates, AI keeps conversation relevant to slide group topic (allows brief emotional tangents)- [ ] Custom journal templates created by users

- **Sentiment trends**: Derived from emotion_log slide responses over time

- **Be empathetic**: Validate feelings, ask open-ended questions

---

- **Respect boundaries**: Don't push users to share more than they're comfortable with---

## 🚨 Privacy & Security

- **Avoid suggesting actions**: AI should not tell users what to do, only help them explore their thoughts

- Journal entries encrypted at rest (SQLite via @capacitor-community/sqlite + PostgreSQL)

- AI processing happens server-side (not shared with third parties)- **Healthcare safety**: Research AI pitfalls in mental healthcare to avoid harmful patterns**Last Updated**: November 21, 2025

- Users can delete journal entries permanently

- No journal data used for model training without explicit consent

- Offline-first: All data stored locally in encrypted SQLite, synced to cloud when user connects### 4. **Collections & Slide Groups Architecture**

- Users control data visibility (never shared with therapists without explicit permission)- **Collections**: Top-level groupings (e.g., "Daily Reflection", "Therapy Preparation", "Stress Management")

- **Slide Groups**: Individual journaling sessions within a collection (e.g., "Morning", "Evening", "Weekly" within "Daily Reflection")

---- **User Flow**: User selects Collection → views all Slide Groups → picks one to start session

- **Two Collection Types** (stored in `journal_templates.type`):

## 🔮 Future Enhancements  - **`journal`** (default) — Journaling prompt collections. Shown in **Categories** section on Library page.

  - **`learn`** — Educational micro-learning collections. Shown in **Collections** section on Library page.

- [ ] Journal entry sharing with therapist (optional, user-controlled)- Both types share the same `journal_templates` table and `slide_groups` JSONB structure

- [ ] Collaborative journaling (shared entries with trusted person)- Both types share the same set of categories (e.g., "Mindfulness", "Stress Management")

- [ ] Audio journal entries (saved as audio + transcript)

- [ ] Journal export (PDF, text file, CSV)### 4a. **Library Page: Two Sections**

- [ ] Advanced emotion analysis (automatic sentiment from text)

- [ ] Journal search and filtering by emotion, date, keywordsThe Library page displays two distinct sections powered by the `type` column:

- [ ] Reminders and notifications for journaling habits

- [ ] Integration with wearables for mood/sleep correlation**📚 Collections (type = 'learn')**

- Horizontal scrollable cards showing learning collections

---- Each card displays: title, description, progress bar (completed/total slide groups)

- "See All" link appears if collection count > 3 → navigates to page grouping all learn collections by category

**Last Updated**: February 24, 2026- Progress tracked via `user_learned_slide_groups` table


**📝 All Categories (type = 'journal')**
- Category tabs/chips showing all available categories
- Selecting a category → shows all slide groups from ALL journal-type collections in that category
- "See All" link on each category section → shows all slide groups for that category

**Category Drill-Down (Journal Type)**:
```
Category "Mindfulness" selected
  → Collection A (Mindfulness) → Slide Groups 1, 2, 3
  → Collection B (Mindfulness) → Slide Groups 4, 5
  → All shown as flat list of slide groups
```

**"See All" for Learn Collections**:
```
All Learning Collections page
  ├── Category: Mindfulness
  │   ├── Collection A (with progress)
  │   └── Collection B (with progress)
  ├── Category: Stress Management
  │   └── Collection C (with progress)
  └── Category: Therapy Prep
      └── Collection D (with progress)
```

### 5. **Session = One Journal Entry**
- Each complete slide group session creates ONE journal entry
- All slide responses (emotion logs, sleep checks, journal prompts) are stored together in the entry
- Auto-saves as user completes slides
- If user doesn't input anything in a slide, nothing is saved for that slide
- Users can return to incomplete entries to continue or edit later

### 6. **Draft & Edit Philosophy**
- **Auto-save on input**: No manual save button - saves automatically when user types/inputs
- **No empty entries**: Nothing saved if user provides no input
- **Edit anytime**: Users can revisit past entries to edit or delete
- **No expiration**: Drafts never expire - users can resume incomplete sessions days/weeks later

### 7. **Speech Input Design**
- **Tap-to-speak**: User taps mic button, speaks, taps again to transcribe (not real-time)
- **Native service**: Uses iOS/Android built-in speech recognition (no third-party API)
- **Privacy-first**: Speech processed on-device when possible

### 8. **Metrics & Tracking**
- **Emotion detection**: Manual tagging via emotion_log slides (not automatic text analysis)
- **Sleep tracking**: Only from sleep_check slides (not from journal content analysis)
- **Streak system**: Tracks consecutive journaling days
- **Word counts**: Total words written across all journal entries
- **Sentiment trends**: Derived from emotion_log slide responses over time

---

## 🚨 Privacy & Security

- Journal entries encrypted at rest (SQLite via @capacitor-community/sqlite + PostgreSQL)
- AI processing happens server-side (not shared with third parties)
- Users can delete journal entries permanently
- No journal data used for model training without explicit consent
- Offline-first: All data stored locally in encrypted SQLite, synced to cloud when user connects
- Users control data visibility (never shared with therapists without explicit permission)

---

## 🔮 Future Enhancements

- [ ] Journal entry sharing with therapist (optional, user-controlled)
- [ ] Collaborative journaling (shared entries with trusted person)
- [ ] Audio journal entries (saved as audio + transcript)
- [ ] Journal export (PDF, text file, CSV)
- [ ] Advanced emotion analysis (automatic sentiment from text)
- [ ] Journal search and filtering by emotion, date, keywords
- [ ] Reminders and notifications for journaling habits
- [ ] Integration with wearables for mood/sleep correlation

---

**Last Updated**: November 21, 2025
