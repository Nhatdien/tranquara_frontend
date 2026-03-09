/**
 * Settings Type Definitions
 *
 * Settings are stored locally via Capacitor Preferences (key-value).
 * Global settings sync to backend via user_informations.settings JSONB (future).
 * Device-specific settings remain local only.
 */

// ─── Theme ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';
export type AppLocale = 'en' | 'vi';

// ─── Personalization ──────────────────────────────────────────────────────────

export interface PersonalizationSettings {
  /** Theme mode: light, dark, or auto (follow system) */
  theme: ThemeMode;
  /** Font size for accessibility */
  font_size: FontSize;
  /** Reduce animations for accessibility */
  reduce_motion: boolean;
  /** App display language */
  language: AppLocale;
}

// ─── AI & Privacy ─────────────────────────────────────────────────────────────

export interface AIPrivacySettings {
  /** Master toggle for AI-driven features (personalized questions, memory, etc.) */
  ai_enabled: boolean;
  /** User-provided short self-description for AI context (max 500 chars) */
  your_story: string;
  /** Opt-in/out of anonymous analytics data collection */
  data_collection: boolean;
}

// ─── Notifications (placeholder — actual scheduling deferred) ─────────────────

export interface NotificationSettings {
  morning_enabled: boolean;
  morning_time: string; // HH:mm format
  evening_enabled: boolean;
  evening_time: string; // HH:mm format
}

// ─── Combined Settings ────────────────────────────────────────────────────────

/**
 * Global settings — synced across devices (future backend sync)
 */
export interface GlobalSettings {
  personalization: PersonalizationSettings;
  ai_privacy: AIPrivacySettings;
}

/**
 * Device-specific settings — stored locally only, never synced
 */
export interface DeviceSettings {
  notifications: NotificationSettings;
}

/**
 * Complete settings state used by the Pinia store
 */
export interface SettingsState {
  global: GlobalSettings;
  device: DeviceSettings;
  /** Whether settings have been loaded from local storage */
  initialized: boolean;
  /** Whether a save operation is in progress */
  saving: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_PERSONALIZATION: PersonalizationSettings = {
  theme: 'dark',
  font_size: 'medium',
  reduce_motion: false,
  language: 'en',
};

export const DEFAULT_AI_PRIVACY: AIPrivacySettings = {
  ai_enabled: true,
  your_story: '',
  data_collection: true,
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  morning_enabled: false,
  morning_time: '09:00',
  evening_enabled: false,
  evening_time: '21:00',
};

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  personalization: { ...DEFAULT_PERSONALIZATION },
  ai_privacy: { ...DEFAULT_AI_PRIVACY },
};

export const DEFAULT_DEVICE_SETTINGS: DeviceSettings = {
  notifications: { ...DEFAULT_NOTIFICATIONS },
};
