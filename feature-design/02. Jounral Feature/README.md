# 📁 Emotion Journaling Feature

> AI-assisted journaling for emotional expression, habit building, and mental health tracking

---

## 📑 Contents

| File/Folder | Description |
|-------------|-------------|
| **[00-OVERVIEW.md](./00-OVERVIEW.md)** | Feature purpose, AI behavior, and design decisions |
| **[IMPLEMENTATION-GUIDE-NEW.md](./IMPLEMENTATION-GUIDE-NEW.md)** | Complete implementation guide with sync status dashboard |
| **[START-HERE.md](./START-HERE.md)** | Implementation roadmap and getting started guide |
| **[AI assist journaling.md](./AI%20assist%20journaling.md)** | AI chat assistant specifications |
| **[Metrics for journal progress.md](./Metrics%20for%20journal%20progress.md)** | Progress tracking and analytics |
| **[Content type schemas design.md](./Content%20type%20schemas%20design.md)** | Slide and template content structures |
| **[collections/](./collections/)** | Collection definitions for journal templates |
| **[journal templates/](./journal%20templates/)** | Specific template examples |
| **[slideGroups/](./slideGroups/)** | Slide group content |
| **[TheraPrep Diagrams-Journaling data flow.drawio.png](./TheraPrep%20Diagrams-Journaling%20data%20flow.drawio.png)** | Data flow diagram |

---

## 🎯 Quick Summary

**Status**: 🧠 Planned  
**Priority**: High

### What This Feature Does

Users can:
- Journal with AI guidance (chat-based)
- Use structured templates or free-form writing
- Input via text or voice
- Track emotional patterns and streaks
- View progress metrics and insights
- **Monitor sync status and data synchronization across devices**

### Technology

- **Frontend**: Nuxt 3 + Vue 3 + Capacitor with chat UI components
- **Local Storage**: SQLite via `@capacitor-community/sqlite` (encrypted journal entries, offline-first)
- **AI Service**: Python FastAPI + HuggingFace models
- **Vector Store**: Qdrant for semantic search
- **Queue**: RabbitMQ for async AI processing
- **Database**: PostgreSQL (`user_journals`, `ai_guider_chatlog`, `user_streaks`) - cloud sync

---

## 🔗 Related Features

- **[User Authentication](../01.%20User%20register/)** - Required for personalized journals
- **[Database Schema](../00-DATABASE/)** - Journal data models
- **[Therapy Prep](../04.%20Prepare%20for%20Therapy/)** - Uses journal prompts

---

## 🚀 Implementation Status

- [ ] AI chat assistant backend
- [ ] Chat UI components
- [ ] Template system
- [ ] Free-form journaling
- [ ] Speech input integration
- [ ] Autofill suggestions
- [ ] Emotion detection
- [ ] Streak tracking
- [ ] Progress metrics dashboard
- [ ] Export functionality

---

## 📊 Key Metrics to Track

1. **User Engagement**
   - Daily active journalers
   - Average entries per week
   - Streak retention rate

2. **AI Performance**
   - User satisfaction with AI responses
   - Conversation length (number of messages)
   - Autofill acceptance rate

3. **Emotional Insights**
   - Emotion variety index
   - Sentiment trends over time
   - Mood stability scores

---

**Last Updated**: November 21, 2025
