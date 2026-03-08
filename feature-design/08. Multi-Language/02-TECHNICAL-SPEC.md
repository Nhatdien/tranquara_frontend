# Multi-Language Support - Technical Specification

> **Status**: 🔄 In Development  
> **Last Updated**: March 8, 2026  
> **Version**: 1.0.0  
> **Priority**: 🟡 HIGH

---

## 📑 Table of Contents

1. [Quick Reference & Validation Links](#quick-reference--validation-links)
2. [Architecture Components](#architecture-components)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [AI Service Implementation](#ai-service-implementation)
6. [Local Storage Strategy](#local-storage-strategy)
7. [Implementation Phases](#implementation-phases)
8. [Testing Strategy](#testing-strategy)

---

## 🔍 Quick Reference & Validation Links

### Core Specifications & Standards

| Topic | Specification | Purpose |
|-------|--------------|---------|
| ISO 639-1 Language Codes | [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) | Standard 2-letter language codes (en, vi) |
| BCP 47 Language Tags | [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646) | Extended language tags (en-US, vi-VN) |
| JSON-LD Internationalization | [W3C i18n](https://www.w3.org/International/) | Web internationalization best practices |

### Framework/Library Documentation

| Resource | Link | Use Case |
|----------|------|----------|
| Nuxt i18n | [i18n.nuxtjs.org](https://i18n.nuxtjs.org/) | Frontend internationalization module |
| Vue i18n | [vue-i18n.intlify.dev](https://vue-i18n.intlify.dev/) | Core i18n library (used by Nuxt i18n) |
| Capacitor Preferences | [capacitorjs.com/docs/apis/preferences](https://capacitorjs.com/docs/apis/preferences) | Local key-value storage |
| SQLite JSONB | [sqlite.org/json1.html](https://www.sqlite.org/json1.html) | JSON functions in SQLite |
| OpenAI GPT-4 Language Support | [platform.openai.com/docs](https://platform.openai.com/docs/guides/text-generation) | Multi-language capabilities |

### Security & Best Practices

| Topic | Resource | Critical Info |
|-------|----------|--------------|
| Content Security | [OWASP i18n Guide](https://cheatsheetseries.owasp.org/cheatsheets/Internationalization_Security_Cheat_Sheet.html) | Prevent i18n-based attacks |
| Input Validation | [OWASP Input Validation](https://owasp.org/www-community/controls/Input_Validation) | Validate user language input |

### Implementation Tools

| Tool | Link | Purpose |
|------|------|---------|
| i18n Ally (VS Code) | [marketplace](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) | Translation file management |
| Vue Devtools | [devtools.vuejs.org](https://devtools.vuejs.org/) | Debug i18n state |
| Postman | [postman.com](https://www.postman.com/) | Test AI language detection API |

---

## 🏗️ Architecture Components

### System Overview

```
┌────────────────────────────────────────────────────────────┐
│                     FRONTEND (Nuxt 3)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  @nuxtjs/i18n Module                                 │  │
│  │  • locales/en.json (UI translations)                 │  │
│  │  • locales/vi.json (UI translations)                 │  │
│  │  • $t() helper in components                         │  │
│  │  • Reactive locale switching                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Capacitor Preferences                               │  │
│  │  • Key: "user_language"                              │  │
│  │  • Value: "en" | "vi"                                │  │
│  │  • Load on app start (plugin)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SQLite (journal_templates cache)                    │  │
│  │  • Store: slide_groups JSONB with multi-lang fields │  │
│  │  • Query: JSON_EXTRACT for language-specific data   │  │
│  │  • Fallback: Use _en if _vi missing                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                              ↕ HTTP
┌────────────────────────────────────────────────────────────┐
│                  BACKEND (Go - tranquara_core_service)     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL: journal_templates                       │  │
│  │  • slide_groups: JSONB with question_en, question_vi│  │
│  │  • API: Return full JSONB, client filters           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                              ↕ HTTP
┌────────────────────────────────────────────────────────────┐
│              AI SERVICE (Python - tranquara_ai_service)    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GPT-4o-mini Language Detection                      │  │
│  │  • Enhanced system prompt with language rules        │  │
│  │  • Detect language from journal content              │  │
│  │  • Generate response in detected language            │  │
│  │  • Fallback: English                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Implementation

### 1. Install @nuxtjs/i18n

**File:** `tranquara_frontend/package.json`

```bash
npm install @nuxtjs/i18n@latest
```

**Reference:** [Nuxt i18n Installation](https://i18n.nuxtjs.org/getting-started/setup)

---

### 2. Configure Nuxt i18n Module

**File:** `tranquara_frontend/nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n', // Add this
  ],
  
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'vi',
        iso: 'vi-VN',
        name: 'Tiếng Việt',
        file: 'vi.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix', // No URL prefix (SPA mode)
    lazy: false, // Pre-load all locales (small size)
    langDir: 'locales/',
    detectBrowserLanguage: false, // Manual selection only
    vueI18n: './i18n.config.ts' // Custom config
  }
})
```

**Reference:** [Nuxt i18n Configuration](https://i18n.nuxtjs.org/options/lazy)

---

### 3. Create i18n Configuration

**File:** `tranquara_frontend/i18n.config.ts` (new file)

```typescript
export default defineI18nConfig(() => ({
  legacy: false, // Use Composition API mode
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: process.env.NODE_ENV === 'development', // Warn in dev only
  fallbackWarn: process.env.NODE_ENV === 'development'
}))
```

---

### 4. Create Translation Files

**File:** `tranquara_frontend/locales/en.json` (new file)

```json
{
  "common": {
    "app_name": "TheraPrep",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "close": "Close"
  },
  "onboarding": {
    "welcome_title": "Welcome to TheraPrep",
    "select_language": "Select your language:",
    "language_english": "English",
    "language_vietnamese": "Tiếng Việt"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "language_description": "App display language",
    "change_language_confirm": "Change language to {language}?",
    "language_changed": "Language changed successfully"
  },
  "journal": {
    "title": "Journal",
    "new_entry": "New Entry",
    "go_deeper": "Go Deeper",
    "save_entry": "Save Entry",
    "placeholder": "Start writing...",
    "mood_label": "How are you feeling?",
    "empty_state": "No journal entries yet"
  },
  "learn": {
    "title": "Learn",
    "start_lesson": "Start Lesson",
    "continue": "Continue",
    "complete": "Complete",
    "lessons_completed": "{count} lessons completed"
  },
  "progress": {
    "title": "Progress",
    "current_streak": "Current Streak",
    "days": "{count} days",
    "insights": "Insights",
    "mood_chart": "Mood Chart"
  },
  "errors": {
    "network_error": "Network error. Please try again.",
    "invalid_credentials": "Invalid email or password",
    "required_field": "This field is required",
    "min_length": "Minimum {count} characters required"
  }
}
```

**File:** `tranquara_frontend/locales/vi.json` (new file)

```json
{
  "common": {
    "app_name": "TheraPrep",
    "loading": "Đang tải...",
    "error": "Lỗi",
    "success": "Thành công",
    "cancel": "Hủy",
    "confirm": "Xác nhận",
    "save": "Lưu",
    "close": "Đóng"
  },
  "onboarding": {
    "welcome_title": "Chào mừng đến TheraPrep",
    "select_language": "Chọn ngôn ngữ của bạn:",
    "language_english": "English",
    "language_vietnamese": "Tiếng Việt"
  },
  "settings": {
    "title": "Cài đặt",
    "language": "Ngôn ngữ",
    "language_description": "Ngôn ngữ hiển thị ứng dụng",
    "change_language_confirm": "Chuyển sang {language}?",
    "language_changed": "Đã thay đổi ngôn ngữ thành công"
  },
  "journal": {
    "title": "Nhật ký",
    "new_entry": "Bài viết mới",
    "go_deeper": "Đi sâu hơn",
    "save_entry": "Lưu bài viết",
    "placeholder": "Bắt đầu viết...",
    "mood_label": "Bạn cảm thấy thế nào?",
    "empty_state": "Chưa có bài viết nào"
  },
  "learn": {
    "title": "Học tập",
    "start_lesson": "Bắt đầu bài học",
    "continue": "Tiếp tục",
    "complete": "Hoàn thành",
    "lessons_completed": "Đã hoàn thành {count} bài học"
  },
  "progress": {
    "title": "Tiến độ",
    "current_streak": "Chuỗi hiện tại",
    "days": "{count} ngày",
    "insights": "Thông tin chi tiết",
    "mood_chart": "Biểu đồ tâm trạng"
  },
  "errors": {
    "network_error": "Lỗi mạng. Vui lòng thử lại.",
    "invalid_credentials": "Email hoặc mật khẩu không đúng",
    "required_field": "Trường này là bắt buộc",
    "min_length": "Yêu cầu tối thiểu {count} ký tự"
  }
}
```

---

### 5. Create Language Preference Plugin

**File:** `tranquara_frontend/plugins/00.language.client.ts` (new file)

```typescript
import { Preferences } from '@capacitor/preferences';

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $i18n } = nuxtApp;
  
  // Load saved language preference
  const { value: savedLanguage } = await Preferences.get({ key: 'user_language' });
  
  if (savedLanguage && ['en', 'vi'].includes(savedLanguage)) {
    $i18n.setLocale(savedLanguage);
  } else {
    // Default to English if no preference
    await Preferences.set({ key: 'user_language', value: 'en' });
  }
});
```

**Reference:** [Capacitor Preferences API](https://capacitorjs.com/docs/apis/preferences)

**Note:** Name starts with `00.` to ensure it loads before other plugins (especially before `01.auth.client.ts`)

---

### 6. Create Language Composable

**File:** `tranquara_frontend/composables/useLanguage.ts` (new file)

```typescript
import { Preferences } from '@capacitor/preferences';

export const useLanguage = () => {
  const { locale, setLocale } = useI18n();
  
  const currentLanguage = computed(() => locale.value);
  
  const changeLanguage = async (newLocale: 'en' | 'vi') => {
    // Update i18n locale
    await setLocale(newLocale);
    
    // Persist to Capacitor Preferences
    await Preferences.set({ key: 'user_language', value: newLocale });
    
    // Return success
    return true;
  };
  
  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      en: 'English',
      vi: 'Tiếng Việt'
    };
    return names[code] || code;
  };
  
  return {
    currentLanguage,
    changeLanguage,
    getLanguageName
  };
};
```

---

### 7. Update Components with Translation Keys

**Example: Update a component to use translations**

**Before (hardcoded):**
```vue
<template>
  <UButton>Save Entry</UButton>
</template>
```

**After (with i18n):**
```vue
<template>
  <UButton>{{ $t('journal.save_entry') }}</UButton>
</template>
```

**Composition API alternative:**
```vue
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <UButton>{{ t('journal.save_entry') }}</UButton>
</template>
```

**Reference:** [Vue i18n Composition API](https://vue-i18n.intlify.dev/guide/advanced/composition.html)

---

### 8. Create Language Selection Component

**File:** `tranquara_frontend/components/LanguageSelector.vue` (new file)

```vue
<script setup lang="ts">
const { currentLanguage, changeLanguage, getLanguageName } = useLanguage();
const { t } = useI18n();

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

const isOpen = ref(false);

const selectLanguage = async (code: 'en' | 'vi') => {
  await changeLanguage(code);
  isOpen.value = false;
  
  // Show success toast
  const toast = useToast();
  toast.add({
    title: t('settings.language_changed'),
    color: 'green'
  });
};
</script>

<template>
  <div class="language-selector">
    <UButton
      @click="isOpen = true"
      variant="ghost"
      icon="i-heroicons-language"
    >
      {{ getLanguageName(currentLanguage) }}
    </UButton>
    
    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">
            {{ t('settings.language') }}
          </h3>
        </template>
        
        <div class="space-y-2">
          <UButton
            v-for="lang in languages"
            :key="lang.code"
            @click="selectLanguage(lang.code as 'en' | 'vi')"
            :variant="currentLanguage === lang.code ? 'solid' : 'ghost'"
            block
            size="lg"
          >
            <span class="flex items-center gap-3">
              <span class="text-2xl">{{ lang.flag }}</span>
              <span>{{ lang.name }}</span>
              <UIcon
                v-if="currentLanguage === lang.code"
                name="i-heroicons-check"
                class="ml-auto"
              />
            </span>
          </UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
```

---

## 🗄️ Backend Implementation

### 1. Update PostgreSQL Schema for Multi-Language

**File:** `tranquara_core_service/migrations/000023_add_multilang_to_journal_templates.up.sql` (new file)

```sql
-- Add multi-language support to journal_templates.slide_groups JSONB structure
-- No table structure changes needed, just documentation

COMMENT ON COLUMN journal_templates.slide_groups IS 
'JSONB array of slide group objects with multi-language fields.
Expected structure per slide:
{
  "id": "slide-id",
  "type": "journal_prompt|emotion_log|sleep_check",
  "question_en": "English question text",
  "question_vi": "Vietnamese question text",
  "config": { ... }
}

Fallback: If question_vi is null/missing, clients should use question_en.
';
```

**File:** `tranquara_core_service/migrations/000023_add_multilang_to_journal_templates.down.sql` (new file)

```sql
-- Revert comment to original
COMMENT ON COLUMN journal_templates.slide_groups IS 
'JSONB array of slide group objects with id, title, description, and slides array';
```

**Reference:** [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

---

### 2. Update Seed Data with Multi-Language Content

**File:** `tranquara_core_service/migrations/000024_update_templates_multilang.up.sql` (new file)

```sql
-- Update existing Daily Reflection template with Vietnamese translations
UPDATE journal_templates
SET slide_groups = jsonb_set(
  slide_groups,
  '{0,slides,0}',
  jsonb_build_object(
    'id', 'morning-mood',
    'type', 'emotion_log',
    'question_en', 'How are you feeling this morning?',
    'question_vi', 'Bạn cảm thấy thế nào sáng nay?',
    'config', jsonb_build_object(
      'scale', '1-10',
      'labels', jsonb_build_array(
        'Storm', 'Heavy Rain', 'Rain', 'Cloudy', 'Partly Cloudy',
        'Mostly Sunny', 'Sunny', 'Bright', 'Radiant', 'Blissful'
      )
    )
  )
)
WHERE id = '55555555-5555-5555-5555-555555555555'::uuid;

-- Update more slides (repeat pattern for all slides in all templates)
-- ... (add translations for all existing content)
```

**Migration Strategy:**
1. Start with Daily Reflection template
2. Add Vietnamese translations for all slides
3. Future migrations add more templates/languages

---

### 3. Backend API - No Changes Needed!

**Rationale:**
- API returns full JSONB `slide_groups` with all language fields
- Frontend filters based on user's language preference
- Backend remains language-agnostic
- Reduces backend complexity

**Existing Endpoint (no changes):**
```go
// GET /api/v1/journal-templates
// Returns: { "slide_groups": [...] } with question_en, question_vi
```

---

## 🤖 AI Service Implementation

### 1. Update AI System Prompt for Language Detection

**File:** `tranquara_ai_service/service/prompts.py`

Add new prompt template:

```python
MULTI_LANGUAGE_SYSTEM_PROMPT = """
You are TheraPrep AI, a compassionate journaling assistant that helps users reflect on their emotions and thoughts.

LANGUAGE DETECTION & RESPONSE RULES:
1. Carefully analyze the language of the user's journal entry
2. If the entry is in Vietnamese, respond ENTIRELY in Vietnamese
3. If the entry is in another language (not English), respond in that language
4. If the entry is in English OR you cannot detect the language, respond in English
5. For mixed-language entries, prioritize the FIRST non-English language detected

Your response should:
- Be culturally appropriate for the detected language
- Use natural, conversational tone
- Ask ONE thoughtful follow-up question to help the user go deeper
- Be empathetic and non-judgmental

Generate a single follow-up question in the detected language.
"""
```

**Reference:** [OpenAI Best Practices - System Messages](https://platform.openai.com/docs/guides/prompt-engineering)

---

### 2. Update AI Service Processor

**File:** `tranquara_ai_service/service/ai_service_processor.py`

Update the `generate_follow_up_question` method:

```python
async def generate_follow_up_question(
    self,
    journal_content: str,
    user_id: str,
    journal_id: Optional[str] = None
) -> str:
    """
    Generate follow-up question in the same language as journal content.
    
    Args:
        journal_content: User's journal entry text
        user_id: User identifier for context retrieval
        journal_id: Optional journal ID for context
        
    Returns:
        AI-generated follow-up question in detected language
    """
    try:
        # Retrieve past journals from Qdrant for context (RAG)
        relevant_memories = await self.retrieve_relevant_context(
            user_id=user_id,
            query_text=journal_content,
            top_k=3
        )
        
        # Build context from past journals
        context_text = "\n".join([
            f"Past entry: {memory.get('content', '')}"
            for memory in relevant_memories
        ])
        
        # Prepare messages for GPT-4o-mini
        messages = [
            {
                "role": "system",
                "content": MULTI_LANGUAGE_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": f"""
Current journal entry:
{journal_content}

Relevant past context:
{context_text if context_text else "No previous entries"}

Generate a thoughtful follow-up question in the SAME LANGUAGE as the current journal entry.
"""
            }
        ]
        
        # Call OpenAI API
        response = await self.llm.ainvoke(messages)
        
        follow_up_question = response.content.strip()
        
        # Log language detection for monitoring
        logger.info(
            f"Generated follow-up question for user {user_id}, "
            f"content length: {len(journal_content)}, "
            f"response length: {len(follow_up_question)}"
        )
        
        return follow_up_question
        
    except Exception as e:
        logger.error(f"Error generating follow-up question: {e}")
        # Fallback to English
        return "Can you tell me more about that?"
```

**Reference:** [LangChain Multi-Language Support](https://python.langchain.com/docs/how_to/)

---

### 3. Add Language Detection Logging (Optional)

For monitoring and debugging, add language detection:

```python
from langdetect import detect, detect_langs
import logging

logger = logging.getLogger(__name__)

def detect_language(text: str) -> str:
    """
    Detect language of text (optional, for logging only).
    
    Returns:
        ISO 639-1 language code (e.g., 'en', 'vi')
    """
    try:
        if len(text.strip()) < 10:
            return "unknown"
        return detect(text)
    except Exception:
        return "unknown"

# In generate_follow_up_question():
detected_lang = detect_language(journal_content)
logger.info(f"Detected language: {detected_lang} for user {user_id}")
```

**Note:** This is optional and only for monitoring. GPT-4o-mini handles detection in the prompt.

**Reference:** [langdetect Library](https://pypi.org/project/langdetect/)

---

## 💾 Local Storage Strategy

### 1. Update SQLite Schema for Multi-Language

**File:** `tranquara_frontend/services/sqlite/schema.ts`

Update `CREATE_JOURNAL_TEMPLATES_TABLE`:

```typescript
export const CREATE_JOURNAL_TEMPLATES_TABLE = `
CREATE TABLE IF NOT EXISTS journal_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_vi TEXT,                        -- ADD: Vietnamese title
  description TEXT,
  description_vi TEXT,                  -- ADD: Vietnamese description
  category TEXT,
  type TEXT NOT NULL DEFAULT 'journal',
  slide_groups TEXT NOT NULL,           -- JSONB string with multi-lang fields
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  cached_at TEXT NOT NULL
);`;
```

**Note:** `slide_groups` remains TEXT (JSON string) containing `question_en`, `question_vi` fields per slide.

---

### 2. Update Templates Repository

**File:** `tranquara_frontend/services/sqlite/templates_repository.ts`

Add helper to parse multi-language content:

```typescript
/**
 * Parse slide_groups JSONB with language-specific field extraction
 */
export function parseSlideGroupsForLanguage(
  slideGroupsJson: string,
  language: 'en' | 'vi'
): Array<any> {
  try {
    const slideGroups = JSON.parse(slideGroupsJson);
    
    return slideGroups.map((group: any) => ({
      ...group,
      slides: group.slides?.map((slide: any) => {
        // Extract language-specific question
        const questionKey = `question_${language}`;
        const fallbackKey = 'question_en';
        
        return {
          ...slide,
          question: slide[questionKey] || slide[fallbackKey] || slide.question || '',
          // Keep original for debugging
          _hasTranslation: !!slide[questionKey]
        };
      })
    }));
  } catch (error) {
    console.error('Error parsing slide groups:', error);
    return [];
  }
}

/**
 * Get all active templates with localized content
 */
export async function getActiveTemplates(
  db: SQLiteDBConnection,
  language: 'en' | 'vi' = 'en'
): Promise<Array<JournalTemplate>> {
  const query = `
    SELECT 
      id,
      CASE 
        WHEN ? = 'vi' AND title_vi IS NOT NULL THEN title_vi
        ELSE title
      END as title,
      CASE 
        WHEN ? = 'vi' AND description_vi IS NOT NULL THEN description_vi
        ELSE description
      END as description,
      category,
      type,
      slide_groups,
      is_active,
      created_at,
      updated_at
    FROM journal_templates
    WHERE is_active = 1
    ORDER BY created_at DESC
  `;
  
  const result = await db.query(query, [language, language]);
  
  if (!result?.values) return [];
  
  return result.values.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    type: row.type,
    slide_groups: parseSlideGroupsForLanguage(row.slide_groups, language),
    is_active: row.is_active === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  }));
}
```

**Reference:** [SQLite JSON Functions](https://www.sqlite.org/json1.html)

---

### 3. Update Pinia Store to Use Language

**File:** `tranquara_frontend/stores/stores/templates.ts` (or similar)

```typescript
import { defineStore } from 'pinia';
import { getActiveTemplates } from '@/services/sqlite/templates_repository';

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<Array<JournalTemplate>>([]);
  const { currentLanguage } = useLanguage();
  
  const loadTemplates = async () => {
    const db = await getSQLiteConnection();
    templates.value = await getActiveTemplates(db, currentLanguage.value as 'en' | 'vi');
  };
  
  // Watch for language changes
  watch(currentLanguage, () => {
    loadTemplates();
  });
  
  return {
    templates,
    loadTemplates
  };
});
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Setup i18n infrastructure

- [ ] Install `@nuxtjs/i18n` module
- [ ] Create `i18n.config.ts`
- [ ] Create `locales/en.json` and `locales/vi.json` (basic keys)
- [ ] Create `plugins/00.language.client.ts`
- [ ] Create `composables/useLanguage.ts`
- [ ] Test language switching in dev environment

**Deliverable:** Language switching works with basic UI text

---

### Phase 2: Frontend Localization (Week 2)

**Goal:** Localize all UI components

- [ ] Update all components to use `$t()` helper
- [ ] Create `LanguageSelector.vue` component
- [ ] Add language option to Settings page
- [ ] Translate all error messages
- [ ] Translate onboarding screens
- [ ] Test all screens in both languages

**Deliverable:** Complete UI localization (English + Vietnamese)

---

### Phase 3: Lesson Content Multi-Language (Week 3)

**Goal:** Add multi-language support for lessons

- [ ] Create migration: `000023_add_multilang_to_journal_templates.up.sql`
- [ ] Create migration: `000024_update_templates_multilang.up.sql`
- [ ] Translate all existing lesson content (Daily Reflection + others)
- [ ] Update SQLite schema with `title_vi`, `description_vi`
- [ ] Update `templates_repository.ts` with parsing logic
- [ ] Update Pinia stores to use language-aware queries
- [ ] Test lesson display in both languages

**Deliverable:** Lessons display in user's selected language with fallback

---

### Phase 4: AI Language Detection (Week 4)

**Goal:** AI responds in user's writing language

- [ ] Update `prompts.py` with `MULTI_LANGUAGE_SYSTEM_PROMPT`
- [ ] Update `ai_service_processor.py` with new logic
- [ ] Test AI responses with English journal entries
- [ ] Test AI responses with Vietnamese journal entries
- [ ] Test AI responses with mixed-language entries
- [ ] Test AI responses with very short entries (fallback)
- [ ] Add logging for language detection monitoring

**Deliverable:** AI generates follow-up questions in detected language

---

### Phase 5: Testing & Polish (Week 5)

**Goal:** Comprehensive testing and bug fixes

- [ ] End-to-end testing: onboarding → settings → journaling → learning
- [ ] Test offline language switching
- [ ] Test missing translation fallback
- [ ] Performance testing (SQLite query speed)
- [ ] Fix any language-specific UI issues (text overflow, etc.)
- [ ] Create user documentation (how to change language)

**Deliverable:** Production-ready multi-language support

---

## 🧪 Testing Strategy

### Unit Tests

**Frontend (`tranquara_frontend/`):**

```typescript
// tests/composables/useLanguage.test.ts
import { describe, it, expect } from 'vitest';
import { useLanguage } from '@/composables/useLanguage';

describe('useLanguage', () => {
  it('should change language and persist to Preferences', async () => {
    const { changeLanguage, currentLanguage } = useLanguage();
    
    await changeLanguage('vi');
    
    expect(currentLanguage.value).toBe('vi');
    // Check Preferences (mock Capacitor)
  });
  
  it('should get correct language names', () => {
    const { getLanguageName } = useLanguage();
    
    expect(getLanguageName('en')).toBe('English');
    expect(getLanguageName('vi')).toBe('Tiếng Việt');
  });
});
```

**Backend (`tranquara_core_service/`):**

No changes needed (backend is language-agnostic).

**AI Service (`tranquara_ai_service/`):**

```python
# tests/test_ai_language_detection.py
import pytest
from service.ai_service_processor import AIServiceProcessor

@pytest.mark.asyncio
async def test_vietnamese_journal_gets_vietnamese_response():
    processor = AIServiceProcessor()
    
    journal_content = "Hôm nay tôi cảm thấy rất vui vì được gặp bạn bè."
    
    response = await processor.generate_follow_up_question(
        journal_content=journal_content,
        user_id="test-user"
    )
    
    # Check that response contains Vietnamese characters
    assert any(char in response for char in ['ạ', 'ư', 'ơ', 'đ'])
    
@pytest.mark.asyncio
async def test_english_journal_gets_english_response():
    processor = AIServiceProcessor()
    
    journal_content = "Today I felt very happy because I met my friends."
    
    response = await processor.generate_follow_up_question(
        journal_content=journal_content,
        user_id="test-user"
    )
    
    # Response should be English
    assert response.isascii()
```

---

### Integration Tests

**Test Scenario 1: End-to-End Language Switching**

```typescript
// tests/e2e/language-switching.spec.ts
import { test, expect } from '@playwright/test';

test('should switch language from English to Vietnamese', async ({ page }) => {
  await page.goto('/');
  
  // Default language: English
  await expect(page.locator('text=Settings')).toBeVisible();
  
  // Open Settings
  await page.click('text=Settings');
  
  // Click Language option
  await page.click('text=Language');
  
  // Select Vietnamese
  await page.click('text=Tiếng Việt');
  
  // Confirm change
  await page.click('text=Confirm');
  
  // Verify UI is now in Vietnamese
  await expect(page.locator('text=Cài đặt')).toBeVisible();
});
```

**Test Scenario 2: AI Language Detection**

```typescript
test('should generate Vietnamese response for Vietnamese journal', async ({ page }) => {
  await page.goto('/journal/new');
  
  // Write Vietnamese journal entry
  await page.fill('[data-testid="journal-content"]', 
    'Hôm nay tôi cảm thấy mệt mỏi vì công việc quá nhiều.'
  );
  
  // Click Go Deeper
  await page.click('[data-testid="go-deeper-btn"]');
  
  // Wait for AI response
  await page.waitForSelector('[data-testid="ai-response"]');
  
  // Verify response contains Vietnamese text
  const response = await page.textContent('[data-testid="ai-response"]');
  expect(response).toMatch(/[ạăâđêôơưứừữự]/);
});
```

---

### Manual Testing Checklist

- [ ] **Onboarding**: Language selection screen displays correctly
- [ ] **Settings**: Language can be changed, UI updates immediately
- [ ] **Journal**: Write in Vietnamese, AI responds in Vietnamese
- [ ] **Journal**: Write in English, AI responds in English
- [ ] **Learn**: Lesson content displays in selected language
- [ ] **Learn**: Missing translations fallback to English gracefully
- [ ] **Offline**: Language switching works offline
- [ ] **Persistence**: Language preference persists after app restart
- [ ] **Edge Cases**: Very short entries fallback to English
- [ ] **Edge Cases**: Mixed language entries prioritize non-English

---

## 🚀 Deployment Considerations

### Build & Bundle

```bash
# Frontend build with i18n
cd tranquara_frontend
npm run build

# Check bundle size
ls -lh .output/public/_nuxt/ | grep i18n
# Expected: ~50KB for i18n module + locales
```

### Database Migrations

```bash
# Backend migrations
cd tranquara_core_service
make migrate-up
# Runs 000023 and 000024 migrations
```

### Monitoring

Add monitoring for:
- Language preference distribution (en vs vi)
- Translation coverage (missing keys)
- AI language detection accuracy
- Fallback usage rate

---

## 🔗 External References

### Authentication & Security
- [OWASP Internationalization Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Internationalization_Security_Cheat_Sheet.html)
- [W3C Internationalization Best Practices](https://www.w3.org/International/)

### Framework/Library Documentation
- [Nuxt i18n Module](https://i18n.nuxtjs.org/)
- [Vue i18n Composition API](https://vue-i18n.intlify.dev/)
- [Capacitor Preferences API](https://capacitorjs.com/docs/apis/preferences)
- [SQLite JSON1 Extension](https://www.sqlite.org/json1.html)
- [OpenAI GPT-4 Documentation](https://platform.openai.com/docs)
- [LangChain Python](https://python.langchain.com/)

### Standards & Specifications
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [BCP 47 Language Tags (RFC 5646)](https://datatracker.ietf.org/doc/html/rfc5646)

### Tools & Validation
- [i18n Ally VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
- [Vue Devtools](https://devtools.vuejs.org/)

---

## 📝 Notes

- **Performance**: i18n module adds ~50KB to bundle (acceptable for 2 languages)
- **Scalability**: Architecture supports adding unlimited languages
- **Backward Compatibility**: API changes are backward compatible
- **Offline Support**: Full offline language switching via bundled locales + SQLite
- **Cost Impact**: AI language detection adds ~50 tokens per journal entry (~$0.0001 per entry)
