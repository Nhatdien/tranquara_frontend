<template>
  <div class="min-h-screen bg-default pb-20">
    <SettingsSubpageHeader :title="$t('settings.personalization')" />

    <UContainer>
      <div class="py-6">
        <SettingsPersonalizationSection />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'detail',
});
</script>
