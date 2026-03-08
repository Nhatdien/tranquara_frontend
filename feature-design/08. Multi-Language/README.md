# Multi-Language Support - README

> **Complete documentation for multi-language feature**  
> **Languages:** English (en) + Vietnamese (vi)  
> **Status:** 🔄 Ready for Implementation

---

## 📚 Documentation Index

| Document | Description | Audience |
|----------|-------------|----------|
| [00-OVERVIEW.md](./00-OVERVIEW.md) | Feature summary, scope, architecture | All stakeholders |
| [01-USER-FLOWS.md](./01-USER-FLOWS.md) | User journeys, UI mockups, edge cases | Product, Design, QA |
| [02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md) | Implementation details, code examples | Developers |
| [03-DATA-MODELS.md](./03-DATA-MODELS.md) | Database schemas, JSONB structure | Developers, DBAs |
| [04-MIGRATION-GUIDE.md](./04-MIGRATION-GUIDE.md) | How to add new languages | Developers |
| [05-IMPLEMENTATION-CHECKLIST.md](./05-IMPLEMENTATION-CHECKLIST.md) | Task tracking for development | Project Manager, Developers |

---

## 🎯 Quick Start

### For Developers

**Want to implement multi-language support?**

1. Read [00-OVERVIEW.md](./00-OVERVIEW.md) for context
2. Follow [02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md) Phase 1-5
3. Track progress with [05-IMPLEMENTATION-CHECKLIST.md](./05-IMPLEMENTATION-CHECKLIST.md)

**Want to add a new language (e.g., Spanish)?**

→ See [04-MIGRATION-GUIDE.md](./04-MIGRATION-GUIDE.md)

---

### For Product/QA

**Want to understand user experience?**

→ See [01-USER-FLOWS.md](./01-USER-FLOWS.md)

**Want to test the feature?**

→ See [02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md#testing-strategy)

---

### For Translators

**Want to translate content?**

1. UI text: Edit `tranquara_frontend/locales/vi.json`
2. Lessons: See [03-DATA-MODELS.md](./03-DATA-MODELS.md#example-data)
3. Guidelines: See [04-MIGRATION-GUIDE.md](./04-MIGRATION-GUIDE.md#translation-workflow)

---

## 🌍 Feature Summary

**What:** Multi-language support for TheraPrep (English + Vietnamese)

**Why:** Serve Vietnamese-speaking users with native language experience

**How:**
- Frontend UI: `@nuxtjs/i18n` with JSON translation files
- Lesson content: JSONB multi-column approach in PostgreSQL
- AI responses: GPT-4o-mini language detection via prompts
- Local storage: SQLite with language-aware queries

**Impact:**
- ✅ Users can choose language in Settings
- ✅ All UI text localized (buttons, labels, errors)
- ✅ Lesson content (slide_groups) in both languages
- ✅ AI responds in user's writing language
- ✅ Full offline support for language switching

---

## 🏗️ Architecture

```
Frontend (Nuxt)          Backend (Go)           AI Service (Python)
┌──────────────┐         ┌──────────────┐       ┌──────────────┐
│ @nuxtjs/i18n │◄───────►│ PostgreSQL   │◄─────►│ GPT-4o-mini  │
│              │         │ JSONB fields │       │ Lang detect  │
│ Capacitor    │         │              │       │              │
│ Preferences  │         │              │       │              │
└──────────────┘         └──────────────┘       └──────────────┘
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│ SQLite       │         │ RabbitMQ     │
│ Local cache  │         │ Sync queue   │
└──────────────┘         └──────────────┘
```

**Key Components:**
- **Nuxt i18n**: Handles UI translation with reactive locale switching
- **Capacitor Preferences**: Stores user language choice locally
- **SQLite**: Caches lesson content with multi-language columns
- **PostgreSQL JSONB**: Stores lessons with `question_en`, `question_vi` fields
- **GPT-4o-mini**: Detects journal language, responds accordingly

---

## 📊 Implementation Status

| Phase | Status | Completion |
|-------|--------|-----------|
| Phase 1: Foundation | 🔵 Not Started | 0% |
| Phase 2: Frontend Localization | 🔵 Not Started | 0% |
| Phase 3: Lesson Content | 🔵 Not Started | 0% |
| Phase 4: AI Language Detection | 🔵 Not Started | 0% |
| Phase 5: Testing & Polish | 🔵 Not Started | 0% |

**Estimated Completion:** 5 weeks from start

---

## 🎓 Key Design Decisions

### 1. Separate UI and AI Language Concerns
- **UI Language**: User-controlled, stored in Preferences
- **AI Language**: Auto-detected per journal entry

**Why?** Users may want UI in English but journal in Vietnamese.

---

### 2. JSONB Multi-Column (Not Separate Table)
- Lessons use `question_en`, `question_vi` fields in JSONB
- **Why?** Simpler queries, better offline support, atomic updates

---

### 3. GPT-4o-mini for Detection (Not Library)
- Use AI prompt: "Detect language, respond in same"
- **Why?** No extra dependency, single API call, GPT-4 is accurate

---

### 4. Pre-Bundled Locales (Not On-Demand)
- All translations in app bundle
- **Why?** Offline-first, instant availability, small size (~50KB/lang)

---

## 🧪 Testing Strategy

### Unit Tests
- `useLanguage` composable
- SQLite parsing functions
- AI language detection

### Integration Tests
- E2E language switching
- Lesson loading with language filter
- AI response language matching

### Manual Tests
- See [01-USER-FLOWS.md](./01-USER-FLOWS.md#edge-cases)

---

## 📈 Success Metrics

Post-launch tracking:

1. **Adoption**: % users selecting Vietnamese
2. **Coverage**: % translation completeness
3. **Accuracy**: AI language detection rate
4. **Satisfaction**: User feedback on translations

---

## 🔗 External References

### Core Documentation
- [Nuxt i18n Module](https://i18n.nuxtjs.org/)
- [Vue i18n](https://vue-i18n.intlify.dev/)
- [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences)
- [OpenAI GPT-4 Docs](https://platform.openai.com/docs)
- [SQLite JSON Functions](https://www.sqlite.org/json1.html)

### Standards
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [BCP 47 Language Tags](https://datatracker.ietf.org/doc/html/rfc5646)
- [OWASP i18n Security](https://cheatsheetseries.owasp.org/cheatsheets/Internationalization_Security_Cheat_Sheet.html)

---

## 👥 Contributors

- **Feature Lead**: [Your Name]
- **Backend**: [Developer Name]
- **Frontend**: [Developer Name]
- **AI Service**: [Developer Name]
- **Translation**: [Translator Name] (Vietnamese)
- **QA**: [QA Name]

---

## 📝 Notes

- First iteration: English + Vietnamese only
- Architecture supports unlimited languages
- No backend API changes needed (fully backward compatible)
- Offline-first approach maintained
- ~$0.0001 per journal entry for AI language detection

---

## 🚀 Next Steps

1. Review all documentation
2. Approve implementation plan
3. Start Phase 1: Install @nuxtjs/i18n
4. Track progress in [05-IMPLEMENTATION-CHECKLIST.md](./05-IMPLEMENTATION-CHECKLIST.md)

**Questions?** See [02-TECHNICAL-SPEC.md](./02-TECHNICAL-SPEC.md) or ask the team!

---

**Last Updated:** March 8, 2026  
**Version:** 1.0.0  
**Status:** 🔄 Ready for Implementation
