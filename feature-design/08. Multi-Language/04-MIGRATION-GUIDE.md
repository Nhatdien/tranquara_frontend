# Multi-Language Support - Migration Guide

> **How to Add a New Language**  
> **Last Updated**: March 8, 2026  
> **Version**: 1.0.0

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Translation Workflow](#translation-workflow)
5. [Quality Assurance](#quality-assurance)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide explains how to add a new language to TheraPrep after the initial English + Vietnamese implementation.

**Example Scenario:** Adding Spanish (es)

**Estimated Time:** 4-6 hours per language (for existing content)

---

## ✅ Prerequisites

Before adding a new language:

- [ ] Phase 1-5 complete (English + Vietnamese working)
- [ ] Translation team/service identified
- [ ] ISO 639-1 language code confirmed (e.g., `es` for Spanish)
- [ ] Content translation prepared (UI text + lesson content)
- [ ] Native speaker available for QA

---

## 📋 Step-by-Step Guide

### Step 1: Add Language to Frontend Configuration

**File:** `tranquara_frontend/nuxt.config.ts`

```typescript
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
    },
    // ADD NEW LANGUAGE
    {
      code: 'es',
      iso: 'es-ES',
      name: 'Español',
      file: 'es.json'
    }
  ],
  defaultLocale: 'en',
  // ... rest of config
}
```

---

### Step 2: Create Translation File

**File:** `tranquara_frontend/locales/es.json` (new)

```json
{
  "common": {
    "app_name": "TheraPrep",
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "save": "Guardar",
    "close": "Cerrar"
  },
  "onboarding": {
    "welcome_title": "Bienvenido a TheraPrep",
    "select_language": "Selecciona tu idioma:",
    "language_english": "English",
    "language_vietnamese": "Tiếng Việt",
    "language_spanish": "Español"
  },
  "settings": {
    "title": "Configuración",
    "language": "Idioma",
    "language_description": "Idioma de la aplicación",
    "change_language_confirm": "¿Cambiar idioma a {language}?",
    "language_changed": "Idioma cambiado correctamente"
  },
  "journal": {
    "title": "Diario",
    "new_entry": "Nueva entrada",
    "go_deeper": "Profundizar",
    "save_entry": "Guardar entrada",
    "placeholder": "Empieza a escribir...",
    "mood_label": "¿Cómo te sientes?",
    "empty_state": "Aún no hay entradas"
  },
  "learn": {
    "title": "Aprender",
    "start_lesson": "Comenzar lección",
    "continue": "Continuar",
    "complete": "Completar",
    "lessons_completed": "{count} lecciones completadas"
  },
  "progress": {
    "title": "Progreso",
    "current_streak": "Racha actual",
    "days": "{count} días",
    "insights": "Información",
    "mood_chart": "Gráfico de ánimo"
  },
  "errors": {
    "network_error": "Error de red. Inténtalo de nuevo.",
    "invalid_credentials": "Email o contraseña incorrectos",
    "required_field": "Este campo es obligatorio",
    "min_length": "Mínimo {count} caracteres requeridos"
  }
}
```

**Translation Tips:**
- Keep placeholders like `{count}`, `{language}` intact
- Maintain JSON structure exactly as English version
- Consider cultural context (e.g., formal vs informal language)

---

### Step 3: Update Language Selector Component

**File:** `tranquara_frontend/components/LanguageSelector.vue`

```vue
<script setup lang="ts">
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }  // ADD NEW
];

const selectLanguage = async (code: 'en' | 'vi' | 'es') => {  // UPDATE TYPE
  await changeLanguage(code);
  // ...
};
</script>
```

---

### Step 4: Update Language Composable

**File:** `tranquara_frontend/composables/useLanguage.ts`

```typescript
export const useLanguage = () => {
  const { locale, setLocale } = useI18n();
  
  const currentLanguage = computed(() => locale.value);
  
  // UPDATE TYPE
  const changeLanguage = async (newLocale: 'en' | 'vi' | 'es') => {
    await setLocale(newLocale);
    await Preferences.set({ key: 'user_language', value: newLocale });
    return true;
  };
  
  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      en: 'English',
      vi: 'Tiếng Việt',
      es: 'Español'  // ADD NEW
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

### Step 5: Update SQLite Schema

**File:** `tranquara_frontend/services/sqlite/schema.ts`

```typescript
export const CREATE_JOURNAL_TEMPLATES_TABLE = `
CREATE TABLE IF NOT EXISTS journal_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Vietnamese
  title_vi TEXT,
  description_vi TEXT,
  
  -- Spanish (ADD NEW)
  title_es TEXT,
  description_es TEXT,
  
  -- Other fields...
  category TEXT,
  type TEXT NOT NULL DEFAULT 'journal',
  slide_groups TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  cached_at TEXT NOT NULL
);`;

// Update migration function
export async function migrateToV4(db: SQLiteDBConnection): Promise<void> {
  await db.execute(`
    ALTER TABLE journal_templates 
    ADD COLUMN title_es TEXT;
  `);
  
  await db.execute(`
    ALTER TABLE journal_templates 
    ADD COLUMN description_es TEXT;
  `);
  
  console.log('Migrated SQLite to v4: Added Spanish columns');
}

export const DB_VERSION = 4; // Increment version
```

---

### Step 6: Update Templates Repository

**File:** `tranquara_frontend/services/sqlite/templates_repository.ts`

```typescript
export function parseSlideGroupsForLanguage(
  slideGroupsJson: string,
  language: 'en' | 'vi' | 'es'  // ADD NEW TYPE
): Array<any> {
  try {
    const slideGroups = JSON.parse(slideGroupsJson);
    
    return slideGroups.map((group: any) => ({
      ...group,
      // Extract title
      title: group[`title_${language}`] || group.title || '',
      // Extract description
      description: group[`description_${language}`] || group.description || '',
      slides: group.slides?.map((slide: any) => {
        const questionKey = `question_${language}`;
        const fallbackKey = 'question_en';
        
        return {
          ...slide,
          question: slide[questionKey] || slide[fallbackKey] || '',
          _hasTranslation: !!slide[questionKey]
        };
      })
    }));
  } catch (error) {
    console.error('Error parsing slide groups:', error);
    return [];
  }
}

export async function getActiveTemplates(
  db: SQLiteDBConnection,
  language: 'en' | 'vi' | 'es' = 'en'  // ADD NEW TYPE
): Promise<Array<JournalTemplate>> {
  const query = `
    SELECT 
      id,
      CASE 
        WHEN ? = 'vi' AND title_vi IS NOT NULL THEN title_vi
        WHEN ? = 'es' AND title_es IS NOT NULL THEN title_es
        ELSE title
      END as title,
      CASE 
        WHEN ? = 'vi' AND description_vi IS NOT NULL THEN description_vi
        WHEN ? = 'es' AND description_es IS NOT NULL THEN description_es
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
  
  const result = await db.query(query, [
    language, language,  // For title
    language, language   // For description
  ]);
  
  // ... rest of function
}
```

---

### Step 7: Add Backend Translations

**File:** `tranquara_core_service/migrations/000025_add_spanish_translations.up.sql` (new)

```sql
-- Add Spanish translations to Daily Reflection template
UPDATE journal_templates
SET 
  slide_groups = jsonb_set(
    jsonb_set(
      slide_groups,
      '{0,title_es}',
      '"Mañana"'::jsonb
    ),
    '{0,description_es}',
    '"Comienza tu día con un diario consciente y enfoque positivo."'::jsonb
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = '55555555-5555-5555-5555-555555555555'::uuid;

-- Add Spanish to morning mood slide
UPDATE journal_templates
SET 
  slide_groups = jsonb_set(
    slide_groups,
    '{0,slides,0,question_es}',
    '"¿Cómo te sientes esta mañana?"'::jsonb
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = '55555555-5555-5555-5555-555555555555'::uuid;

-- Repeat for all slides in all templates...
```

**Down Migration:**

```sql
-- 000025_add_spanish_translations.down.sql
-- Remove Spanish fields (optional, or leave as no-op)
UPDATE journal_templates
SET slide_groups = slide_groups #- '{0,title_es}'
WHERE id = '55555555-5555-5555-5555-555555555555'::uuid;
```

---

### Step 8: Update AI Service Prompt

**File:** `tranquara_ai_service/service/prompts.py`

```python
MULTI_LANGUAGE_SYSTEM_PROMPT = """
You are TheraPrep AI, a compassionate journaling assistant that helps users reflect on their emotions and thoughts.

LANGUAGE DETECTION & RESPONSE RULES:
1. Carefully analyze the language of the user's journal entry
2. If the entry is in Vietnamese, respond ENTIRELY in Vietnamese
3. If the entry is in Spanish, respond ENTIRELY in Spanish  # ADD NEW
4. If the entry is in another language (not English), respond in that language
5. If the entry is in English OR you cannot detect the language, respond in English
6. For mixed-language entries, prioritize the FIRST non-English language detected

Supported languages: English, Vietnamese, Spanish  # UPDATE

Your response should:
- Be culturally appropriate for the detected language
- Use natural, conversational tone
- Ask ONE thoughtful follow-up question to help the user go deeper
- Be empathetic and non-judgmental

Generate a single follow-up question in the detected language.
"""
```

**Note:** GPT-4o-mini supports 50+ languages natively, so no code changes needed beyond prompt update.

---

### Step 9: Test Language Support

Run comprehensive tests:

```bash
# Frontend unit tests
cd tranquara_frontend
npm run test -- useLanguage.test.ts

# E2E tests
npm run test:e2e -- language-switching.spec.ts

# Backend migrations
cd tranquara_core_service
make migrate-up
make migrate-down
make migrate-up

# AI service test
cd tranquara_ai_service
python -m pytest tests/test_ai_language_detection.py -k spanish
```

---

## 🔄 Translation Workflow

### Option 1: Manual Translation

1. **Extract keys** from `locales/en.json`
2. **Translate** via Google Translate / DeepL as starting point
3. **Review** with native speaker for accuracy
4. **Test** in app for context

### Option 2: Professional Service

Use translation management platforms:
- [Lokalise](https://lokalise.com/)
- [Crowdin](https://crowdin.com/)
- [Phrase](https://phrase.com/)

**Workflow:**
1. Upload `en.json` to platform
2. Assign translators
3. Download translated `es.json`
4. Commit to repo

### Option 3: Community Translation

For open-source projects:
1. Create GitHub issue: "Call for Spanish translators"
2. Provide translation template
3. Review pull requests from contributors

---

## 📊 Translation Coverage Tracking

**Create monitoring script:**

**File:** `tranquara_frontend/scripts/check-translations.js`

```javascript
const fs = require('fs');
const path = require('path');

const enTranslations = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../locales/en.json'), 'utf-8')
);

const languages = ['vi', 'es'];

function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object') {
      count += countKeys(obj[key], fullKey);
    } else {
      count++;
    }
  }
  return count;
}

function findMissingKeys(source, target, prefix = '') {
  const missing = [];
  for (const key in source) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!(key in target)) {
      missing.push(fullKey);
    } else if (typeof source[key] === 'object') {
      missing.push(...findMissingKeys(source[key], target[key], fullKey));
    }
  }
  return missing;
}

const totalKeys = countKeys(enTranslations);
console.log(`Total English keys: ${totalKeys}\n`);

languages.forEach(lang => {
  const filePath = path.join(__dirname, `../locales/${lang}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${lang}.json not found`);
    return;
  }
  
  const translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const missing = findMissingKeys(enTranslations, translations);
  
  const coverage = ((totalKeys - missing.length) / totalKeys * 100).toFixed(2);
  
  console.log(`${lang.toUpperCase()}: ${coverage}% coverage`);
  if (missing.length > 0) {
    console.log(`  Missing keys (${missing.length}):`);
    missing.slice(0, 10).forEach(key => console.log(`    - ${key}`));
    if (missing.length > 10) {
      console.log(`    ... and ${missing.length - 10} more`);
    }
  } else {
    console.log(`  ✅ Complete!`);
  }
  console.log('');
});
```

**Run:**
```bash
node scripts/check-translations.js
```

**Output:**
```
Total English keys: 87

VI: 100.00% coverage
  ✅ Complete!

ES: 75.86% coverage
  Missing keys (21):
    - progress.insights
    - learn.lessons_completed
    ... and 19 more
```

---

## ✅ Quality Assurance

### QA Checklist

- [ ] All UI text translated and renders correctly
- [ ] No text overflow or truncation issues
- [ ] Placeholders (`{count}`, `{language}`) work correctly
- [ ] Language switcher shows all languages
- [ ] Lesson content displays in new language
- [ ] AI responds in new language when journaling
- [ ] Fallback to English works for missing translations
- [ ] Offline language switching works
- [ ] Language persists after app restart
- [ ] RTL support (if applicable, e.g., Arabic)

### Cultural Considerations

- [ ] Tone appropriate (formal vs informal)
- [ ] Date/time formats correct for locale
- [ ] Currency symbols (if applicable)
- [ ] Cultural sensitivities respected
- [ ] Idioms translated appropriately (not literally)

---

## 🐛 Troubleshooting

### Issue: Language not appearing in selector

**Check:**
1. `nuxt.config.ts` has language added to `locales` array
2. `es.json` file exists in `locales/` directory
3. `LanguageSelector.vue` includes new language
4. App restarted / hot reload triggered

---

### Issue: Translations not loading

**Check:**
1. JSON syntax valid (no trailing commas, proper quotes)
2. File encoding is UTF-8
3. Browser cache cleared
4. Nuxt dev server restarted

**Debug:**
```vue
<template>
  <div>
    <p>Current locale: {{ $i18n.locale }}</p>
    <p>Available: {{ $i18n.availableLocales }}</p>
    <p>Test: {{ $t('common.app_name') }}</p>
  </div>
</template>
```

---

### Issue: SQLite columns missing

**Check:**
1. Migration function added to `schema.ts`
2. `DB_VERSION` incremented
3. Migration triggered on app start
4. Check logs: `console.log` in migration function

**Manual fix:**
```typescript
// In browser console / debug mode
await db.execute(`ALTER TABLE journal_templates ADD COLUMN title_es TEXT;`);
```

---

### Issue: Backend translations not syncing

**Check:**
1. Migration ran: `make migrate-up`
2. Check migration status:
   ```sql
   SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;
   ```
3. Verify JSONB structure:
   ```sql
   SELECT slide_groups->'0'->'slides'->0->'question_es' 
   FROM journal_templates 
   WHERE id = '55555555-5555-5555-5555-555555555555'::uuid;
   ```

---

### Issue: AI not detecting new language

**Check:**
1. Prompt updated in `prompts.py`
2. AI service restarted
3. Test with substantial text (>50 words)
4. Check logs: language detection output

**Test manually:**
```bash
curl -X POST http://localhost:8000/api/analyze-journal \
  -H "Content-Type: application/json" \
  -d '{"content": "Hola, hoy me siento muy feliz porque..."}'
```

---

## 📚 Resources

- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [Vue i18n Documentation](https://vue-i18n.intlify.dev/)
- [Nuxt i18n Module](https://i18n.nuxtjs.org/)
- [DeepL Translator](https://www.deepl.com/translator)
- [Google Translate](https://translate.google.com/)

---

## 🎉 Success Criteria

Your new language is fully integrated when:

✅ Users can select the language in onboarding  
✅ Settings displays the language option  
✅ All UI text appears in the new language  
✅ Lessons display in the new language  
✅ AI responds in the new language when journaling  
✅ Fallback to English works gracefully  
✅ Translation coverage > 95%  
✅ Native speaker QA approved  

**Congratulations! Your new language is live! 🌍**
