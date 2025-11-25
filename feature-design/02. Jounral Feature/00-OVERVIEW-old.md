# ✍️ Emotion Journaling - Overview

## 🎯 Purpose

Provide an AI-assisted journaling experience that helps users express emotions, build reflection habits, and track mental health patterns. The feature combines conversational AI guidance with flexible journaling formats (template-based or free-form).

## 📊 Status

- **Current Status**: 🧠 Planned
- **Priority**: High
- **Target Release**: v1.0
- **Dependencies**: 
  - User Authentication
  - AI Service (Python FastAPI + HuggingFace)
  - Vector Database (Qdrant)
  - RabbitMQ for async processing

## 🎨 User Value

- **Emotional clarity**: AI-guided prompts help users articulate feelings
- **Habit building**: Daily prompts and streak tracking encourage consistency
- **Pattern recognition**: Track emotional trends over time
- **Safe space**: Non-judgmental AI listener for emotional expression
- **Flexible formats**: Choose structured prompts or free-form writing

## 🔑 Key Features

- **AI Chat Assistant**: Conversational guidance during journaling
- **Template-Based Journaling**: Structured prompts for specific topics (therapy prep, mood tracking)
- **Free-Form Journaling**: Open-ended reflection without constraints
- **Speech Input**: Voice-to-text for easier expression
- **Smart Autofill**: Context-aware suggestions based on user's writing
- **Emotion Tagging**: Automatic emotion detection and categorization
- **Streak Tracking**: Daily journaling streaks and gamification
- **Progress Metrics**: Mood trends, sentiment analysis, emotional variety

## 📋 Success Criteria

- [ ] AI chat assistant provides empathetic, non-clinical responses
- [ ] Template prompts guide users effectively through specific topics
- [ ] Free-form journaling feels natural and unrestrained
- [ ] Speech input accurately transcribes user voice
- [ ] Autofill suggestions are helpful and contextual
- [ ] Emotion detection is accurate (>80% alignment with user self-report)
- [ ] Daily active users see streak counter
- [ ] Users can view emotional trend charts

## 🔗 Related Features

- **[User Authentication](../01.%20User%20register/)** - Required for personalized journaling
- **[Therapy Preparation](../04.%20Prepare%20for%20Therapy/)** - Uses journal templates
- **[Micro Learning](../03.%20Micro%20learning/)** - May prompt journaling exercises
- **[Database Schema](../00-DATABASE/)** - `user_journals`, `ai_guider_chatlog`, `user_streaks`

## 📝 Notes

### Design Decisions

1. **Why AI-Assisted?**
   - Lowers barrier to entry for users unsure what to write
   - Provides gentle prompts without feeling prescriptive
   - Helps users explore thoughts more deeply
   - Non-judgmental companion for emotional expression

2. **Template vs Free-Form**
   - Templates: Guide users through specific therapy-prep topics
   - Free-form: Allows spontaneous expression without constraints
   - Users can switch between modes based on need

3. **AI Behavior Guidelines**
   - **Listen, don't diagnose**: AI encourages reflection, never provides clinical advice
   - **Follow the template**: When using templates, AI keeps conversation on topic
   - **Be empathetic**: Validate feelings, ask open-ended questions
   - **Respect boundaries**: Don't push users to share more than they're comfortable with

### AI Autofill Strategies

**Case 1: Empty Input or Off-Topic**
- Generate subtle question related to template topic or recent journal themes
- Display in low opacity as suggestion, not intrusion
- Example: "How did that make you feel?" or "What happened next?"

**Case 2: User Writing Actively**
- Detect topic direction
- Offer follow-up question in user's voice (first person)
- Example: User writes "I felt anxious today..." → Suggestion: "What triggered my anxiety?"

### Privacy & Security

- Journal entries encrypted at rest
- AI processing happens server-side (not shared with third parties)
- Users can delete journal entries permanently
- No journal data used for model training without explicit consent

### Future Enhancements

- [ ] Journal entry sharing with therapist (optional)
- [ ] Collaborative journaling (shared entries with trusted person)
- [ ] Audio journal entries (saved as audio + transcript)
- [ ] Journal export (PDF, text file)
- [ ] Advanced sentiment analysis (multi-emotion detection)
- [ ] Custom journal templates created by users

---

**Last Updated**: November 21, 2025
