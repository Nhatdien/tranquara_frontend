# ✍️ Emotion Journaling - Overview# ✍️ Emotion Journaling - Overview



## 🎯 Purpose## 🎯 Purpose



Provide an AI-assisted journaling experience that helps users express emotions, build reflection habits, and track mental health patterns. The feature combines conversational AI guidance with flexible journaling formats (template-based or free-form).Provide an AI-assisted journaling experience that helps users express emotions, build reflection habits, and track mental health patterns. The feature combines conversational AI guidance with flexible journaling formats (template-based or free-form).



---## 📊 Status



## 📊 Status- **Current Status**: 🧠 Planned

- **Priority**: High

- **Current Status**: 🧠 In Development- **Target Release**: v1.0

- **Priority**: High (P0)- **Dependencies**: 

- **Target Release**: v1.0  - User Authentication (completed)

- **Dependencies**:   - AI Service (Python FastAPI + HuggingFace)

  - User Authentication (✅ Completed)  - Vector Database (Qdrant)

  - AI Service (Python FastAPI + HuggingFace)  - RabbitMQ for async processing

  - Vector Database (Qdrant)

  - RabbitMQ for async processing## 🎨 User Value

  - Offline-First Storage (SQLite + PostgreSQL sync)

- **Emotional clarity**: AI-guided prompts help users articulate feelings

---- **Habit building**: Daily prompts and streak tracking encourage consistency

- **Pattern recognition**: Track emotional trends over time

## 🎨 User Value- **Safe space**: Non-judgmental AI listener for emotional expression

- **Flexible formats**: Choose structured prompts or free-form writing

- **Emotional clarity**: AI-guided prompts help users articulate feelings

- **Habit building**: Daily prompts and streak tracking encourage consistency## 🔑 Key Features

- **Pattern recognition**: Track emotional trends over time

- **Safe space**: Non-judgmental AI listener for emotional expression- **AI Chat Assistant**: Conversational guidance during journaling

- **Flexible formats**: Choose structured prompts or free-form writing- **Template-Based Journaling**: Structured prompts for specific topics (therapy prep, mood tracking)

- **Therapy preparation**: Organized reflection to bring to therapy sessions- **Free-Form Journaling**: Open-ended reflection without constraints

- **Offline-first**: Journal anytime, anywhere without internet dependency- **Speech Input**: Voice-to-text for easier expression

- **Smart Autofill**: Context-aware suggestions based on user's writing

---- **Emotion Tagging**: Automatic emotion detection and categorization

- **Streak Tracking**: Daily journaling streaks and gamification

## 🔑 Key Features- **Progress Metrics**: Mood trends, sentiment analysis, emotional variety



### Core Journaling## 📋 Success Criteria

- **Template-Based Journaling**: Structured slide groups for specific topics (therapy prep, daily reflection, stress management)

- **Free-Form Journaling**: Open-ended blank journal for spontaneous expression- [ ] AI chat assistant provides empathetic, non-clinical responses

- **AI "Go Deeper" Assistant**: Contextual follow-up questions to help users explore thoughts more deeply- [ ] Template prompts guide users effectively through specific topics

- **Speech Input**: Native voice-to-text for easier expression (tap-to-speak)- [ ] Free-form journaling feels natural and unrestrained

- **Auto-Save**: Automatic draft saving as users type - no manual save needed- [ ] Speech input accurately transcribes user voice

- **Edit & Delete**: Users can revisit, edit, or delete past journal entries- [ ] Autofill suggestions are helpful and contextual

- [ ] Emotion detection is accurate (>80% alignment with user self-report)

### Interactive Slides- [ ] Daily active users see streak counter

- **Journal Prompt Slides**: Text input with AI assistance- [ ] Users can view emotional trend charts

- **Emotion Log Slides**: Visual slider with animated weather metaphors (storm → sunny)

- **Sleep Check Slides**: Hour slider with animated sleep character (exhausted → well-rested)## 🔗 Related Features

- **Doc/Info Slides**: Educational content with sources and rich formatting

- **Quiz Slides**: Interactive assessments and self-reflection exercises- **[User Authentication](../01.%20User%20register/)** - Required for personalized journaling

- **[Therapy Preparation](../04.%20Prepare%20for%20Therapy/)** - Uses journal templates

### Progress & Insights- **[Micro Learning](../03.%20Micro%20learning/)** - May prompt journaling exercises

- **Streak Tracking**: Daily journaling streaks with gamification- **[Database Schema](../00-DATABASE/)** - `user_journals`, `ai_guider_chatlog`, `user_streaks`

- **Emotion Trends**: Visualize emotional patterns over time

- **Sleep Tracking**: Monitor sleep quality from sleep_check slides## 📝 Notes

- **Word Count**: Track journaling volume and consistency

- **Session Feedback**: Rate helpfulness after each session### Design Decisions



---1. **Why AI-Assisted?**

   - Lowers barrier to entry for users unsure what to write

## 📋 Success Criteria   - Provides gentle prompts without feeling prescriptive

   - Helps users explore thoughts more deeply

- [ ] AI "Go Deeper" provides helpful, non-clinical follow-up questions   - Non-judgmental companion for emotional expression

- [ ] Template slide groups guide users effectively through specific topics

- [ ] Free-form journaling feels natural and unrestrained2. **Template vs Free-Form**

- [ ] Speech input accurately transcribes user voice (native device service)   - Templates: Guide users through specific therapy-prep topics

- [ ] Emotion detection via manual tagging is intuitive and accurate   - Free-form: Allows spontaneous expression without constraints

- [ ] Daily active users see streak counter and feel motivated   - Users can switch between modes based on need

- [ ] Users can view emotional trend charts and sleep patterns

- [ ] Sessions auto-save without user intervention3. **AI Behavior Guidelines**

- [ ] Users can successfully edit and delete past entries   - **Listen, don't diagnose**: AI encourages reflection, never provides clinical advice

- [ ] App works fully offline with background sync when online   - **Follow the template**: When using templates, AI keeps conversation on topic

   - **Be empathetic**: Validate feelings, ask open-ended questions

---   - **Respect boundaries**: Don't push users to share more than they're comfortable with



## 🔗 Related Features### AI Autofill Strategies



- **[User Authentication](../01.%20User%20register/)** - Required for personalized journaling**Case 1: Empty Input or Off-Topic**

- **[Therapy Preparation](../04.%20Prepare%20for%20Therapy/)** - Uses journal templates- Generate subtle question related to template topic or recent journal themes

- **[Micro Learning](../03.%20Micro%20learning/)** - May prompt journaling exercises- Display in low opacity as suggestion, not intrusion

- **[Database Schema](../00-DATABASE/)** - `user_journals`, `collections`, `slide_groups`, `journal_entries`, `user_streaks`- Example: "How did that make you feel?" or "What happened next?"



---**Case 2: User Writing Actively**

- Detect topic direction

## 📝 Design Decisions- Offer follow-up question in user's voice (first person)

- Example: User writes "I felt anxious today..." → Suggestion: "What triggered my anxiety?"

### 1. **Why AI-Assisted?**

- Lowers barrier to entry for users unsure what to write### Privacy & Security

- Provides gentle prompts without feeling prescriptive

- Helps users explore thoughts more deeply through "Go Deeper" functionality- Journal entries encrypted at rest

- Non-judgmental companion for emotional expression- AI processing happens server-side (not shared with third parties)

- **No chatbot interface**: Users click "Go Deeper" button for AI follow-up questions instead of continuous chat- Users can delete journal entries permanently

- No journal data used for model training without explicit consent

### 2. **Template vs Free-Form**

- **Templates**: Slide groups guide users through specific therapy-prep topics or daily routines### Future Enhancements

- **Free-form**: Blank journal allows spontaneous expression without constraints

- Users can switch between modes based on need- [ ] Journal entry sharing with therapist (optional)

- Templates use structured slides (emotion logs, sleep checks, doc slides, journal prompts)- [ ] Collaborative journaling (shared entries with trusted person)

- [ ] Audio journal entries (saved as audio + transcript)

### 3. **AI Behavior Guidelines**- [ ] Journal export (PDF, text file)

- **Listen, don't diagnose**: AI encourages reflection, never provides clinical advice- [ ] Advanced sentiment analysis (multi-emotion detection)

- **Follow the template**: When using templates, AI keeps conversation relevant to slide group topic (allows brief emotional tangents)- [ ] Custom journal templates created by users

- **Be empathetic**: Validate feelings, ask open-ended questions

- **Respect boundaries**: Don't push users to share more than they're comfortable with---

- **Avoid suggesting actions**: AI should not tell users what to do, only help them explore their thoughts

- **Healthcare safety**: Research AI pitfalls in mental healthcare to avoid harmful patterns**Last Updated**: November 21, 2025


### 4. **Collections & Slide Groups Architecture**
- **Collections**: Top-level groupings (e.g., "Daily Reflection", "Therapy Preparation", "Stress Management")
- **Slide Groups**: Individual journaling sessions within a collection (e.g., "Morning", "Evening", "Weekly" within "Daily Reflection")
- **User Flow**: User selects Collection → views all Slide Groups → picks one to start session

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

- Journal entries encrypted at rest (local SQLite + PostgreSQL)
- AI processing happens server-side (not shared with third parties)
- Users can delete journal entries permanently
- No journal data used for model training without explicit consent
- Offline-first: All data stored locally, synced to cloud when user connects
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
