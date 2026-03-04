<template>
  <div class="min-h-screen bg-default pb-20">
    <SettingsSubpageHeader title="About You" />

    <UContainer>
      <div class="py-6">
        <SettingsAIPrivacySection />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'detail',
});
</script>
