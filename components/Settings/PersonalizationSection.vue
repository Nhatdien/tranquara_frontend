<template>
  <div class="space-y-4">
    <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">personalization.</h2>

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
                <p class="text-sm font-medium text-default">Theme</p>
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
                <p class="text-sm font-medium text-default">Font Size</p>
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
                <p class="text-sm font-medium text-default">Reduce Motion</p>
                <p class="text-xs text-muted">Minimize animations</p>
              </div>
            </div>
            <USwitch
              :model-value="settingsStore.reduceMotion"
              size="lg"
              @update:model-value="handleReduceMotion"
            />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon, Monitor, Type, Zap } from 'lucide-vue-next';
import { useSettingsStore } from '~/stores/stores/settings_store';
import type { ThemeMode, FontSize } from '~/types/settings';

const settingsStore = useSettingsStore();
const colorMode = useColorMode();

// ─── Theme ────────────────────────────────────────────────────────────────────

const themeIcon = computed(() => {
  const icons: Record<ThemeMode, any> = { light: Sun, dark: Moon, auto: Monitor };
  return icons[settingsStore.theme];
});

const themeLabel = computed(() => {
  const labels: Record<ThemeMode, string> = { light: 'Light', dark: 'Dark', auto: 'Auto' };
  return labels[settingsStore.theme];
});

const handleThemeChange = async (mode: ThemeMode) => {
  await settingsStore.setTheme(mode);
  // Sync to Nuxt UI color mode system
  colorMode.preference = mode === 'auto' ? 'system' : mode;
};

const themeItems = computed(() => [
  [
    {
      label: 'Light',
      icon: 'i-lucide-sun',
      onSelect: () => handleThemeChange('light'),
    },
    {
      label: 'Dark',
      icon: 'i-lucide-moon',
      onSelect: () => handleThemeChange('dark'),
    },
    {
      label: 'Auto',
      icon: 'i-lucide-monitor',
      onSelect: () => handleThemeChange('auto'),
    },
  ],
]);

// ─── Font Size ────────────────────────────────────────────────────────────────

const fontSizeLabel = computed(() => {
  const labels: Record<FontSize, string> = { small: 'Small', medium: 'Medium', large: 'Large' };
  return labels[settingsStore.fontSize];
});

const handleFontSizeChange = async (size: FontSize) => {
  await settingsStore.setFontSize(size);
};

const fontSizeItems = computed(() => [
  [
    {
      label: 'Small',
      onSelect: () => handleFontSizeChange('small'),
    },
    {
      label: 'Medium',
      onSelect: () => handleFontSizeChange('medium'),
    },
    {
      label: 'Large',
      onSelect: () => handleFontSizeChange('large'),
    },
  ],
]);

// ─── Reduce Motion ────────────────────────────────────────────────────────────

const handleReduceMotion = async (value: boolean) => {
  await settingsStore.setReduceMotion(value);
};
</script>
