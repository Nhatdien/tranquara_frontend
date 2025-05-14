<template>
  <ScrollArea :scroll-hide-delay="2" class="h-[750px] w-full">
    <div class="flex flex-col w-full gap-4">
      <HomePageTopMenu />

      <div class="h-full flex gap-4">
        <HomePageEmotionCharts class="flex-1" />
        <HomePageStreaksProgress class="flex-1" />
      </div>
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
