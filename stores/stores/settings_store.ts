/**
 * Settings Store — Pinia
 *
 * Manages all user settings with local persistence via Capacitor Preferences.
 * Global settings (theme, AI, etc.) will sync to backend in a future phase.
 * Device-specific settings (notifications) stay local only.
 *
 * Storage keys:
 *  - "settings_global"  → GlobalSettings JSON
 *  - "settings_device"  → DeviceSettings JSON
 */

import { defineStore } from 'pinia';
import { storage } from '~/utils/storage';
import type {
  SettingsState,
  GlobalSettings,
  DeviceSettings,
  ThemeMode,
  FontSize,
  AppLocale,
  PersonalizationSettings,
  AIPrivacySettings,
  NotificationSettings,
} from '~/types/settings';
import {
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_DEVICE_SETTINGS,
} from '~/types/settings';

const STORAGE_KEY_GLOBAL = 'settings_global';
const STORAGE_KEY_DEVICE = 'settings_device';

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    global: structuredClone(DEFAULT_GLOBAL_SETTINGS),
    device: structuredClone(DEFAULT_DEVICE_SETTINGS),
    initialized: false,
    saving: false,
  }),

  getters: {
    // ─── Personalization ────────────────────────────────────────────────
    theme: (state): ThemeMode => state.global.personalization.theme,
    fontSize: (state): FontSize => state.global.personalization.font_size,
    reduceMotion: (state): boolean => state.global.personalization.reduce_motion,
    language: (state): AppLocale => state.global.personalization.language,

    // ─── AI & Privacy ───────────────────────────────────────────────────
    aiEnabled: (state): boolean => state.global.ai_privacy.ai_enabled,
    yourStory: (state): string => state.global.ai_privacy.your_story,
    dataCollection: (state): boolean => state.global.ai_privacy.data_collection,

    // ─── Notifications ──────────────────────────────────────────────────
    notifications: (state): NotificationSettings => state.device.notifications,

    // ─── Font size CSS class ────────────────────────────────────────────
    fontSizeClass: (state): string => {
      const map: Record<FontSize, string> = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
      };
      return map[state.global.personalization.font_size];
    },
  },

  actions: {
    // ─── Initialization ─────────────────────────────────────────────────

    /**
     * Load settings from Capacitor Preferences.
     * Call this once during app initialization (plugin).
     */
    async loadSettings() {
      try {
        const [savedGlobal, savedDevice] = await Promise.all([
          storage.get<GlobalSettings>(STORAGE_KEY_GLOBAL),
          storage.get<DeviceSettings>(STORAGE_KEY_DEVICE),
        ]);

        if (savedGlobal) {
          // Deep merge with defaults so new fields get default values
          this.global = {
            personalization: {
              ...DEFAULT_GLOBAL_SETTINGS.personalization,
              ...savedGlobal.personalization,
            },
            ai_privacy: {
              ...DEFAULT_GLOBAL_SETTINGS.ai_privacy,
              ...savedGlobal.ai_privacy,
            },
          };
        }

        if (savedDevice) {
          this.device = {
            notifications: {
              ...DEFAULT_DEVICE_SETTINGS.notifications,
              ...savedDevice.notifications,
            },
          };
        }

        this.initialized = true;
        console.log('[SettingsStore] Settings loaded from local storage');
      } catch (error) {
        console.error('[SettingsStore] Failed to load settings:', error);
        this.initialized = true; // Use defaults on failure
      }
    },

    // ─── Persistence Helpers ────────────────────────────────────────────

    async _saveGlobal() {
      this.saving = true;
      try {
        await storage.set(STORAGE_KEY_GLOBAL, this.global);
      } catch (error) {
        console.error('[SettingsStore] Failed to save global settings:', error);
      } finally {
        this.saving = false;
      }
    },

    async _saveDevice() {
      this.saving = true;
      try {
        await storage.set(STORAGE_KEY_DEVICE, this.device);
      } catch (error) {
        console.error('[SettingsStore] Failed to save device settings:', error);
      } finally {
        this.saving = false;
      }
    },

    // ─── Personalization Actions ────────────────────────────────────────

    async setTheme(theme: ThemeMode) {
      this.global.personalization.theme = theme;
      await this._saveGlobal();
    },

    async setFontSize(size: FontSize) {
      this.global.personalization.font_size = size;
      await this._saveGlobal();
    },

    async setReduceMotion(enabled: boolean) {
      this.global.personalization.reduce_motion = enabled;
      await this._saveGlobal();
    },

    async setLanguage(locale: AppLocale) {
      this.global.personalization.language = locale;
      await this._saveGlobal();
    },

    // ─── AI & Privacy Actions ───────────────────────────────────────────

    async setAIEnabled(enabled: boolean) {
      this.global.ai_privacy.ai_enabled = enabled;
      await this._saveGlobal();
    },

    async setYourStory(story: string) {
      // Enforce 500 char limit
      this.global.ai_privacy.your_story = story.slice(0, 500);
      await this._saveGlobal();
    },

    async setDataCollection(enabled: boolean) {
      this.global.ai_privacy.data_collection = enabled;
      await this._saveGlobal();
    },

    // ─── Notification Actions ───────────────────────────────────────────

    async setMorningReminder(enabled: boolean, time?: string) {
      this.device.notifications.morning_enabled = enabled;
      if (time) this.device.notifications.morning_time = time;
      await this._saveDevice();
    },

    async setEveningReminder(enabled: boolean, time?: string) {
      this.device.notifications.evening_enabled = enabled;
      if (time) this.device.notifications.evening_time = time;
      await this._saveDevice();
    },

    // ─── Bulk Update ────────────────────────────────────────────────────

    async updatePersonalization(partial: Partial<PersonalizationSettings>) {
      this.global.personalization = { ...this.global.personalization, ...partial };
      await this._saveGlobal();
    },

    async updateAIPrivacy(partial: Partial<AIPrivacySettings>) {
      this.global.ai_privacy = { ...this.global.ai_privacy, ...partial };
      await this._saveGlobal();
    },

    // ─── Reset ──────────────────────────────────────────────────────────

    async resetAllSettings() {
      this.global = structuredClone(DEFAULT_GLOBAL_SETTINGS);
      this.device = structuredClone(DEFAULT_DEVICE_SETTINGS);
      await Promise.all([this._saveGlobal(), this._saveDevice()]);
      console.log('[SettingsStore] All settings reset to defaults');
    },

    /**
     * Clear all local settings data (used during account deletion / logout)
     */
    async clearLocalData() {
      await Promise.all([
        storage.remove(STORAGE_KEY_GLOBAL),
        storage.remove(STORAGE_KEY_DEVICE),
      ]);
      this.global = structuredClone(DEFAULT_GLOBAL_SETTINGS);
      this.device = structuredClone(DEFAULT_DEVICE_SETTINGS);
      this.initialized = false;
      console.log('[SettingsStore] Local settings data cleared');
    },
  },
});
