<template>
  <div class="min-h-screen bg-default pb-20 lg:pb-0">
    <!-- Header -->
    <UContainer class="sticky top-0 z-10 bg-default border-b border-default">
      <div class="flex items-center justify-between py-4">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          @click="$router.back()"
        />
        <div class="w-10" />
      </div>
    </UContainer>

    <UContainer>
      <!-- Title -->
      <div class="py-8 pb-6">
        <h1 class="text-3xl font-bold text-highlighted italic">{{ $t('profile.title') }}</h1>
      </div>

      <!-- Account Card (avatar, name, email) -->
      <SettingsAccountSection />

      <!-- ─── PERSONALIZE ──────────────────────────────────────────── -->
      <div class="mt-8">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-[0.2em] text-center mb-4">
          {{ $t('profile.personalize') }}
        </h2>
        <UCard>
          <div class="divide-y divide-default">
            <SettingsNavItem
              :icon="Palette"
              :label="$t('profile.personalize')"
              :subtitle="themeLabel"
              @click="openSection('theme')"
            />
            <SettingsNavItem
              :icon="UserCircle"
              :label="$t('profile.aboutYou')"
              :subtitle="$t('profile.aboutYouSubtitle')"
              @click="openSection('about-you')"
            />
          </div>
        </UCard>
      </div>

      <!-- ─── ACCOUNT ──────────────────────────────────────────────── -->
      <div class="mt-8">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-[0.2em] text-center mb-4">
          {{ $t('profile.account') }}
        </h2>
        <UCard>
          <div class="divide-y divide-default">
            <SettingsNavItem
              :icon="Bell"
              :label="$t('profile.notifications')"
              :subtitle="$t('profile.notificationsSubtitle')"
              @click="openSection('notifications')"
            />
            <SettingsNavItem
              :icon="Database"
              :label="$t('profile.yourData')"
              :subtitle="$t('profile.yourDataSubtitle')"
              @click="openSection('data')"
            />
          </div>
        </UCard>
      </div>

      <!-- Logout -->
      <div class="mt-8">
        <SettingsLogoutSection />
      </div>

      <!-- App Info -->
      <div class="text-center py-6 space-y-2">
        <p class="text-xs text-muted">TheraPrep v1.0.0</p>
        <div class="flex items-center justify-center gap-3">
          <UButton to="/terms" size="xs" color="neutral" variant="link">{{ $t('profile.terms') }}</UButton>
          <span class="text-dimmed">•</span>
          <UButton to="/privacy" size="xs" color="neutral" variant="link">{{ $t('profile.privacy') }}</UButton>
          <span class="text-dimmed">•</span>
          <UButton to="/support" size="xs" color="neutral" variant="link">{{ $t('profile.support') }}</UButton>
        </div>
      </div>
    </UContainer>

    <!-- ─── Desktop Slideover Drawers ──────────────────────────────── -->
    <SettingsDetailView v-model:open="drawers.theme" :title="$t('profile.personalize')">
      <SettingsPersonalizationSection />
    </SettingsDetailView>

    <SettingsDetailView v-model:open="drawers.aboutYou" :title="$t('profile.aboutYou')">
      <div class="space-y-8">
        <SettingsAIPrivacySection />
        <USeparator />
        <SettingsMemoriesSection />
      </div>
    </SettingsDetailView>

    <SettingsDetailView v-model:open="drawers.notifications" :title="$t('profile.notifications')">
      <SettingsNotificationSection />
    </SettingsDetailView>

    <SettingsDetailView v-model:open="drawers.data" :title="$t('profile.yourData')">
      <div class="space-y-6">
        <div class="space-y-4">
          <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">{{ $t('profile.dataSync') }}</h2>
          <SyncStatusDashboard
            :show-stats="true"
            :show-history="true"
            :show-actions="true"
          />
        </div>
        <SettingsDataManagementSection />
      </div>
    </SettingsDetailView>
  </div>
</template>

<script setup lang="ts">
import { Palette, UserCircle, Bell, Database } from 'lucide-vue-next';
import { useWindowSize } from '@vueuse/core';

definePageMeta({
  layout: 'detail',
});

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const { t: $t } = useI18n();

// ─── Drawer State (desktop only) ────────────────────────────────────────────
const drawers = reactive({
  theme: false,
  aboutYou: false,
  notifications: false,
  data: false,
});

type SectionKey = 'theme' | 'about-you' | 'notifications' | 'data';

const drawerMap: Record<SectionKey, keyof typeof drawers> = {
  'theme': 'theme',
  'about-you': 'aboutYou',
  'notifications': 'notifications',
  'data': 'data',
};

const openSection = (section: SectionKey) => {
  if (isMobile.value) {
    navigateTo(`/profile/${section}`);
  } else {
    // Close all other drawers first
    Object.keys(drawers).forEach((key) => {
      drawers[key as keyof typeof drawers] = false;
    });
    drawers[drawerMap[section]] = true;
  }
};

// ─── Theme Label (for nav item subtitle) ─────────────────────────────────────
const settingsStore = useSettingsStore();

const themeLabel = computed(() => {
  return settingsStore.theme === 'auto'
    ? $t('settings.themeOptions.auto')
    : settingsStore.theme === 'light'
      ? $t('settings.themeOptions.light')
      : $t('settings.themeOptions.dark');
});
</script>
