<template>
  <div class="space-y-4">
    <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">{{ $t('settings.notifications.heading') }}</h2>

    <UCard>
      <div class="divide-y divide-default">
        <!-- Morning Reminder -->
        <div class="py-4 first:pt-0 last:pb-0 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Sunrise class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">{{ $t('settings.notifications.morningCheckin') }}</p>
                <p class="text-xs text-muted">{{ $t('settings.notifications.morningCheckinDesc') }}</p>
              </div>
            </div>
            <USwitch
              :model-value="settingsStore.notifications.morning_enabled"
              size="lg"
              @update:model-value="handleMorningToggle"
            />
          </div>

          <!-- Morning time picker (only shown when enabled) -->
          <div
            v-if="settingsStore.notifications.morning_enabled"
            class="pl-13 flex items-center gap-2"
          >
            <Clock class="w-4 h-4 text-muted flex-shrink-0" />
            <input
              type="time"
              :value="settingsStore.notifications.morning_time"
              class="bg-elevated border border-default rounded-md px-3 py-1.5 text-sm text-default focus:outline-none focus:ring-2 focus:ring-primary"
              @change="handleMorningTimeChange"
            />
          </div>
        </div>

        <!-- Evening Reminder -->
        <div class="py-4 first:pt-0 last:pb-0 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Sunset class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">{{ $t('settings.notifications.eveningReflection') }}</p>
                <p class="text-xs text-muted">{{ $t('settings.notifications.eveningReflectionDesc') }}</p>
              </div>
            </div>
            <USwitch
              :model-value="settingsStore.notifications.evening_enabled"
              size="lg"
              @update:model-value="handleEveningToggle"
            />
          </div>

          <!-- Evening time picker (only shown when enabled) -->
          <div
            v-if="settingsStore.notifications.evening_enabled"
            class="pl-13 flex items-center gap-2"
          >
            <Clock class="w-4 h-4 text-muted flex-shrink-0" />
            <input
              type="time"
              :value="settingsStore.notifications.evening_time"
              class="bg-elevated border border-default rounded-md px-3 py-1.5 text-sm text-default focus:outline-none focus:ring-2 focus:ring-primary"
              @change="handleEveningTimeChange"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Info note -->
    <p class="text-xs text-dimmed px-1">
      {{ $t('settings.notifications.permissionNote') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Sunrise, Sunset, Clock } from 'lucide-vue-next';
import { useSettingsStore } from '~/stores/stores/settings_store';

const settingsStore = useSettingsStore();
const toast = useToast();
const { t } = useI18n();

// ─── Morning Reminder ───────────────────────────────────────────────────────

const handleMorningToggle = async (enabled: boolean) => {
  await settingsStore.setMorningReminder(enabled);
  toast.add({
    title: enabled ? t('settings.notifications.morningEnabled') : t('settings.notifications.morningDisabled'),
    icon: enabled ? 'i-lucide-bell' : 'i-lucide-bell-off',
    color: 'neutral',
  });
};

const handleMorningTimeChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    await settingsStore.setMorningReminder(true, target.value);
  }
};

// ─── Evening Reminder ───────────────────────────────────────────────────────

const handleEveningToggle = async (enabled: boolean) => {
  await settingsStore.setEveningReminder(enabled);
  toast.add({
    title: enabled ? t('settings.notifications.eveningEnabled') : t('settings.notifications.eveningDisabled'),
    icon: enabled ? 'i-lucide-bell' : 'i-lucide-bell-off',
    color: 'neutral',
  });
};

const handleEveningTimeChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    await settingsStore.setEveningReminder(true, target.value);
  }
};
</script>
