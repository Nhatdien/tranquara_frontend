<template>
  <div class="space-y-4">
    <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">{{ $t('settings.personalization') }}</h2>

    <UCard>
      <div class="divide-y divide-default">
        <!-- Theme -->
        <div class="py-4 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <component :is="themeIcon" class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">{{ $t('settings.theme') }}</p>
                <p class="text-xs text-muted">{{ themeLabel }}</p>
              </div>
            </div>
            <UDropdownMenu :items="themeItems">
              <UButton
                color="neutral"
                variant="outline"
                size="sm"
                trailing-icon="i-lucide-chevron-down"
              >
                {{ themeLabel }}
              </UButton>
            </UDropdownMenu>
          </div>
        </div>

        <!-- Font Size -->
        <div class="py-4 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Type class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">{{ $t('settings.fontSize') }}</p>
                <p class="text-xs text-muted">{{ fontSizeLabel }}</p>
              </div>
            </div>
            <UDropdownMenu :items="fontSizeItems">
              <UButton
                color="neutral"
                variant="outline"
                size="sm"
                trailing-icon="i-lucide-chevron-down"
              >
                {{ fontSizeLabel }}
              </UButton>
            </UDropdownMenu>
          </div>
        </div>

        <!-- Reduce Motion -->
        <div class="py-4 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Zap class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">{{ $t('settings.reduceMotion') }}</p>
                <p class="text-xs text-muted">{{ $t('settings.minimizeAnimations') }}</p>
              </div>
            </div>
            <USwitch
              :model-value="settingsStore.reduceMotion"
              size="lg"
              @update:model-value="handleReduceMotion"
            />
          </div>
        </div>

        <!-- Language -->
        <div class="py-4 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Globe class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">{{ $t('settings.language') }}</p>
                <p class="text-xs text-muted">{{ $t('settings.languageSubtitle') }}</p>
              </div>
            </div>
            <UDropdownMenu :items="languageItems">
              <UButton
                color="neutral"
                variant="outline"
                size="sm"
                trailing-icon="i-lucide-chevron-down"
              >
                {{ currentLanguageName }}
              </UButton>
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon, Monitor, Type, Zap, Globe } from 'lucide-vue-next';
import { useSettingsStore } from '~/stores/stores/settings_store';
import type { ThemeMode, FontSize, AppLocale } from '~/types/settings';

const settingsStore = useSettingsStore();
const colorMode = useColorMode();
const { t } = useI18n();

// ─── Theme ────────────────────────────────────────────────────────────────────

const themeIcon = computed(() => {
  const icons: Record<ThemeMode, any> = { light: Sun, dark: Moon, auto: Monitor };
  return icons[settingsStore.theme];
});

const themeLabel = computed(() => {
  const key = `settings.themeOptions.${settingsStore.theme}`;
  return t(key);
});

const handleThemeChange = async (mode: ThemeMode) => {
  await settingsStore.setTheme(mode);
  // Sync to Nuxt UI color mode system
  colorMode.preference = mode === 'auto' ? 'system' : mode;
};

const themeItems = computed(() => [
  [
    {
      label: t('settings.themeOptions.light'),
      icon: 'i-lucide-sun',
      onSelect: () => handleThemeChange('light'),
    },
    {
      label: t('settings.themeOptions.dark'),
      icon: 'i-lucide-moon',
      onSelect: () => handleThemeChange('dark'),
    },
    {
      label: t('settings.themeOptions.auto'),
      icon: 'i-lucide-monitor',
      onSelect: () => handleThemeChange('auto'),
    },
  ],
]);

// ─── Font Size ────────────────────────────────────────────────────────────────

const fontSizeLabel = computed(() => {
  const key = `settings.fontSizeOptions.${settingsStore.fontSize}`;
  return t(key);
});

const handleFontSizeChange = async (size: FontSize) => {
  await settingsStore.setFontSize(size);
};

const fontSizeItems = computed(() => [
  [
    {
      label: t('settings.fontSizeOptions.small'),
      onSelect: () => handleFontSizeChange('small'),
    },
    {
      label: t('settings.fontSizeOptions.medium'),
      onSelect: () => handleFontSizeChange('medium'),
    },
    {
      label: t('settings.fontSizeOptions.large'),
      onSelect: () => handleFontSizeChange('large'),
    },
  ],
]);

// ─── Reduce Motion ────────────────────────────────────────────────────────────

const handleReduceMotion = async (value: boolean) => {
  await settingsStore.setReduceMotion(value);
};

// ─── Language ─────────────────────────────────────────────────────────────────

const { changeLanguage, currentLanguage, languageName } = useLanguage();

const currentLanguageName = computed(() => languageName.value);

const handleLanguageChange = async (locale: AppLocale) => {
  await changeLanguage(locale);
};

const languageItems = computed(() => [
  [
    {
      label: 'English',
      onSelect: () => handleLanguageChange('en'),
    },
    {
      label: 'Tiếng Việt',
      onSelect: () => handleLanguageChange('vi'),
    },
  ],
]);
</script>
