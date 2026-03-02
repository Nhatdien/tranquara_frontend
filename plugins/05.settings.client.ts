/**
 * Settings Plugin
 *
 * Loads user settings from Capacitor Preferences on app start.
 * Applies the persisted theme and font size to the DOM immediately.
 *
 * Load order: Runs after auth (01) and database (02) plugins.
 */

import { useSettingsStore } from '~/stores/stores/settings_store';
import type { FontSize } from '~/types/settings';

const fontSizeClasses: Record<FontSize, string> = {
  small: 'app-font-small',
  medium: 'app-font-medium',
  large: 'app-font-large',
};

export default defineNuxtPlugin(async () => {
  const settingsStore = useSettingsStore();

  // Load settings from local storage (Capacitor Preferences)
  await settingsStore.loadSettings();

  if (import.meta.client) {
    // Apply persisted theme to Nuxt UI color mode
    const colorMode = useColorMode();
    const theme = settingsStore.theme;
    colorMode.preference = theme === 'auto' ? 'system' : theme;

    // Apply font size class to <html> immediately
    const html = document.documentElement;
    html.classList.add(fontSizeClasses[settingsStore.fontSize]);

    // Apply reduce motion class if enabled
    if (settingsStore.reduceMotion) {
      html.classList.add('reduce-motion');
    }
  }

  console.log('[SettingsPlugin] Settings initialized, theme:', settingsStore.theme);
});
