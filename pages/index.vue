<template>
  <ScrollArea :scroll-hide-delay="2" class="min-h-[70vh] max-h-[800px] w-full">
    <div class="flex flex-col w-full gap-4">
      <HomePageTopMenu />
      <HomePageEmotionCharts class="flex-1" />
      <HomePageStreaksProgress class="flex-1" />
      <HomePageEncourageMent />
      <HomePageDailySuggest />
    </div>
  </ScrollArea>

  <NuxtPage />
</template>

<script setup lang="ts">
const { $keycloak, $quizzAppSDK } = useNuxtApp();

onMounted(async () => {});
</script>
