<template>
  <div
    v-if="userInfoStore.userInfomation.user_id"
    class="flex flex-col w-full gap-4">
    <HomePageTopMenu />
    <HomePageEmotionCharts class="flex-1" />
    <HomePageStreaksProgress class="flex-1" />
    <HomePageEncourageMent />
    <HomePageDailySuggest />
  </div>
  <div class="h-full" v-else>
    <Onboarding></Onboarding>
  </div>

  <NuxtPage />
</template>

<script setup lang="ts">

const { $keycloak, $quizzAppSDK } = useNuxtApp();
const userInfoStore = userInformationStore();

onMounted(async () => {
  await waitForToken();
  userInfoStore.getMe();
});
</script>
