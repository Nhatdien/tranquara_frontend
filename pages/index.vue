<template>
  <div
    v-if="userInfoStore.userInfomation.user_id"
    class="flex flex-col w-full gap-12"
  >
    <HomePageTopMenu />
    <CommonQuoteCard />
    <!-- <HomePageEmotionCharts class="flex-1" /> -->
    <HomePageLatestEntries />
    <JournalResumeJournaling />
  </div>
  <div class="h-full" v-else>
    <Onboarding></Onboarding>
  </div>

  <NuxtPage />
</template>

<script setup lang="ts">
import { Notebook } from 'lucide-vue-next';

const userInfoStore = userInformationStore();


</script>
