<template>
    <div class="flex flex-col w-full gap-4">
      <HomePageTopMenu />
      <HomePageEmotionCharts class="flex-1" />
      <HomePageStreaksProgress class="flex-1" />
      <HomePageEncourageMent />
      <HomePageDailySuggest />
    </div>

  <NuxtPage />
</template>

<script setup lang="ts">
const { $keycloak, $quizzAppSDK } = useNuxtApp();

onMounted(async () => {});
</script>
