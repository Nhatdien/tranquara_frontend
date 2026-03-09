/**
 * useLanguage Composable
 *
 * Provides language switching functionality for the app.
 * Integrates with Pinia settings store (persistence) and @nuxtjs/i18n (runtime).
 *
 * Usage:
 *   const { currentLanguage, changeLanguage, languageName, availableLocales } = useLanguage();
 *   await changeLanguage('vi');
 */

import type { AppLocale } from '~/types/settings';

const LOCALE_NAMES: Record<AppLocale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export function useLanguage() {
  const { locale, setLocale } = useI18n();
  const settingsStore = useSettingsStore();

  /** The current active locale code */
  const currentLanguage = computed<AppLocale>(() => locale.value as AppLocale);

  /** Human-readable name of the current language */
  const languageName = computed(() => LOCALE_NAMES[currentLanguage.value] || currentLanguage.value);

  /** All available locales with their names */
  const availableLocales = computed(() =>
    Object.entries(LOCALE_NAMES).map(([code, name]) => ({
      code: code as AppLocale,
      name,
    })),
  );

  /**
   * Change the app language.
   * Updates both i18n runtime locale and persists to settings store.
   */
  async function changeLanguage(newLocale: AppLocale) {
    await setLocale(newLocale);
    await settingsStore.setLanguage(newLocale);
  }

  /**
   * Get the display name for a locale code.
   */
  function getLanguageName(code: AppLocale): string {
    return LOCALE_NAMES[code] || code;
  }

  return {
    currentLanguage,
    languageName,
    availableLocales,
    changeLanguage,
    getLanguageName,
  };
}
