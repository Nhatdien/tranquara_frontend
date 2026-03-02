<template>
  <div class="min-h-screen bg-default pb-20">
    <!-- Header -->
    <UContainer class="sticky top-0 z-10 bg-default border-b">
      <div class="flex items-center justify-between py-4">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          @click="$router.back()"
        />
        <h1 class="text-xl font-semibold text-highlighted">Settings</h1>
        <div class="w-10" />
      </div>
    </UContainer>

    <UContainer>
      <!-- Account Section (avatar, name, email) -->
      <SettingsAccountSection />

      <!-- Personalization Section (Theme, Font Size, Reduce Motion) -->
      <SettingsPersonalizationSection />

      <!-- AI & Privacy Section -->
      <div class="mt-8">
        <SettingsAIPrivacySection />
      </div>

      <!-- Reminders Section -->
      <div class="mt-8">
        <SettingsNotificationSection />
      </div>

      <!-- Data & Sync Section -->
      <div class="space-y-4 mt-8">
        <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">data & sync.</h2>
        <SyncStatusDashboard
          :show-stats="true"
          :show-history="true"
          :show-actions="true"
        />
      </div>

      <!-- Data Management Section (Export, Delete Account) -->
      <div class="mt-8">
        <SettingsDataManagementSection />
      </div>

      <!-- Logout -->
      <div class="mt-8">
        <SettingsLogoutSection />
      </div>

      <!-- App Info -->
      <div class="text-center py-6 space-y-2">
        <p class="text-xs text-muted">TheraPrep v1.0.0</p>
        <div class="flex items-center justify-center gap-3">
          <UButton to="/terms" size="xs" color="neutral" variant="link">Terms</UButton>
          <span class="text-dimmed">•</span>
          <UButton to="/privacy" size="xs" color="neutral" variant="link">Privacy</UButton>
          <span class="text-dimmed">•</span>
          <UButton to="/support" size="xs" color="neutral" variant="link">Support</UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'detail',
});
</script>
