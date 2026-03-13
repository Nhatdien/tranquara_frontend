<template>
  <div class="min-h-screen bg-default pb-20 lg:pb-0">
    <SettingsSubpageHeader :title="$t('profile.notifications')" />

    <UContainer>
      <div class="py-6">
        <SettingsNotificationSection />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'detail',
});
</script>
