# Multi-Language Support - Implementation Checklist

> **Quick Reference for Implementation**  
> **Last Updated**: March 8, 2026

---

## 📋 Phase 1: Foundation (Week 1)

### Setup i18n Infrastructure

- [ ] **Install dependencies**
  ```bash
  cd tranquara_frontend
  npm install @nuxtjs/i18n@latest
  ```

- [ ] **Update `nuxt.config.ts`**
  - Add `@nuxtjs/i18n` to modules
  - Configure locales (en, vi)
  - Set strategy to `no_prefix`

- [ ] **Create `i18n.config.ts`**
  - Setup legacy: false
  - Configure fallbackLocale: 'en'

- [ ] **Create translation files**
  - `locales/en.json` (complete)
  - `locales/vi.json` (complete)

- [ ] **Create `plugins/00.language.client.ts`**
  - Load language from Capacitor Preferences
  - Set initial locale

- [ ] **Create `composables/useLanguage.ts`**
  - currentLanguage computed
  - changeLanguage function
  - getLanguageName helper

- [ ] **Test basic language switching**
  - Manual language change works
  - Preference persists

---

## 📋 Phase 2: Frontend Localization (Week 2)

### Translate UI Components

- [ ] **Update layout components**
  - `layouts/default.vue`
  - Navigation tabs
  - Bottom navigation

- [ ] **Update page components**
  - `pages/index.vue`
  - `pages/journal/index.vue`
  - `pages/learn/index.vue`
  - `pages/progress/index.vue`
  - `pages/settings/index.vue`

- [ ] **Update common components**
  - Buttons with hardcoded text
  - Form validation messages
  - Error messages
  - Empty states

- [ ] **Create `LanguageSelector.vue`**
  - Modal with language options
  - Flag emojis
  - Current selection indicator

- [ ] **Add to Settings page**
  - Language row
  - Opens LanguageSelector modal

- [ ] **Translate onboarding**
  - Welcome screen
  - Language selection screen
  - Tutorial slides

- [ ] **Test all screens**
  - English version complete
  - Vietnamese version complete
  - No hardcoded text remaining

---

## 📋 Phase 3: Lesson Content (Week 3)

### Backend Schema & Data

- [ ] **Create migration files**
  - `000023_add_multilang_to_journal_templates.up.sql`
  - `000023_add_multilang_to_journal_templates.down.sql`
  - `000024_update_templates_multilang.up.sql`
  - `000024_update_templates_multilang.down.sql`

- [ ] **Update JSONB structure**
  - Add `title_vi` to slide_groups
  - Add `description_vi` to slide_groups
  - Add `question_vi` to slides

- [ ] **Translate Daily Reflection template**
  - Morning slide group (4 slides)
  - Evening slide group (5 slides)

- [ ] **Translate other templates**
  - (List your other templates)

- [ ] **Run migrations**
  ```bash
  cd tranquara_core_service
  make migrate-up
  ```

- [ ] **Verify data**
  ```sql
  SELECT slide_groups->'0'->'title_vi' FROM journal_templates;
  ```

### Frontend SQLite

- [ ] **Update `services/sqlite/schema.ts`**
  - Add `title_vi`, `description_vi` columns
  - Create `migrateToV3` function
  - Update `DB_VERSION` to 3

- [ ] **Update `services/sqlite/sqlite_service.ts`**
  - Trigger migration on version mismatch

- [ ] **Update `services/sqlite/templates_repository.ts`**
  - Create `parseSlideGroupsForLanguage()`
  - Update `getActiveTemplates()` with language param
  - Add fallback logic

- [ ] **Update Pinia store**
  - Pass language to repository functions
  - Watch `currentLanguage` changes
  - Reload templates on language switch

- [ ] **Test lesson display**
  - English lessons display correctly
  - Vietnamese lessons display correctly
  - Fallback works for missing translations

---

## 📋 Phase 4: AI Language Detection (Week 4)

### Update AI Service

- [ ] **Update `service/prompts.py`**
  - Create `MULTI_LANGUAGE_SYSTEM_PROMPT`
  - Add language detection rules
  - Add Vietnamese response rules

- [ ] **Update `service/ai_service_processor.py`**
  - Update `generate_follow_up_question()`
  - Use new multi-language prompt
  - Add language detection logging (optional)

- [ ] **Test AI responses**
  - English journal → English response
  - Vietnamese journal → Vietnamese response
  - Mixed language → Non-English priority
  - Very short text → English fallback

- [ ] **Add monitoring**
  - Log detected languages
  - Track fallback usage
  - Monitor response quality

---

## 📋 Phase 5: Testing & Polish (Week 5)

### Comprehensive Testing

- [ ] **Unit tests**
  - `useLanguage.test.ts`
  - `templates_repository.test.ts`
  - AI language detection tests

- [ ] **Integration tests**
  - E2E language switching
  - Lesson loading with language
  - AI language detection flow

- [ ] **Manual testing**
  - [ ] Onboarding: Language selection
  - [ ] Settings: Change language
  - [ ] Journal: Write in Vietnamese
  - [ ] Journal: AI responds in Vietnamese
  - [ ] Learn: Lessons in Vietnamese
  - [ ] Learn: Fallback for missing
  - [ ] Offline: Language switch works
  - [ ] Persistence: Restart app

- [ ] **Performance testing**
  - SQLite query speed
  - JSONB parsing overhead
  - App bundle size check

- [ ] **UI/UX polish**
  - Text overflow handling
  - Font rendering (Vietnamese characters)
  - Button sizing with longer text
  - Toast message translations

- [ ] **Documentation**
  - User guide: How to change language
  - Developer guide: Adding new languages
  - API documentation updates

---

## 📋 Production Deployment

- [ ] **Code review**
  - All components reviewed
  - No hardcoded text
  - Translation keys consistent

- [ ] **Translation review**
  - Native speaker QA (Vietnamese)
  - Cultural appropriateness
  - Tone consistency

- [ ] **Database backup**
  ```bash
  pg_dump tranquara_db > backup_pre_multilang.sql
  ```

- [ ] **Staged rollout**
  - Deploy backend migrations
  - Deploy AI service updates
  - Deploy frontend changes
  - Monitor error logs

- [ ] **User communication**
  - Announcement: Vietnamese support
  - In-app banner/tooltip
  - App store description update

---

## 📊 Success Metrics

Track these metrics post-launch:

- [ ] **Adoption Rate**
  - % users selecting Vietnamese
  - Time to first language change

- [ ] **Translation Coverage**
  - % of keys translated (target: 100%)
  - Missing translation reports

- [ ] **AI Detection Accuracy**
  - % correct language detection
  - Fallback usage rate

- [ ] **User Satisfaction**
  - Feedback on translations
  - Bug reports related to i18n

---

## 🔗 Quick Links

- [Overview](./00-OVERVIEW.md)
- [User Flows](./01-USER-FLOWS.md)
- [Technical Spec](./02-TECHNICAL-SPEC.md)
- [Data Models](./03-DATA-MODELS.md)
- [Migration Guide](./04-MIGRATION-GUIDE.md)

---

## 📝 Notes

- Estimated total time: **5 weeks** for full implementation
- Can parallelize frontend (Phase 2) and backend (Phase 3)
- AI updates (Phase 4) should be done after backend
- Reserve Week 5 for thorough testing

**Good luck with implementation! 🚀**
