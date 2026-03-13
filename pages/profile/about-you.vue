<template>
  <div class="min-h-screen bg-default pb-20 lg:pb-0">
    <SettingsSubpageHeader :title="$t('profile.aboutYou')" />

    <UContainer>
      <div class="py-6 space-y-8">
        <SettingsAIPrivacySection />
        <USeparator />
        <SettingsMemoriesSection />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'detail',
});
</script>
