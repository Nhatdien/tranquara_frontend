<template>
  <div
    v-if="userInfoStore.userInfomation.user_id"
    class="flex flex-col w-full gap-12"
  >
    <HomePageTopMenu />
    <HomePageEmotionCharts class="flex-1" />
    <HomePageLatestEntries />
    <HomePageStreaksProgress class="flex-1" />
    <HomePageEncourageMent />
  </div>
  <div class="h-full" v-else>
    <Onboarding></Onboarding>
  </div>

  <NuxtPage />
</template>

<script setup lang="ts">
const userInfoStore = userInformationStore();

onMounted(async () => {
  await waitForToken();
  userInfoStore.getMe();
});
</script>
