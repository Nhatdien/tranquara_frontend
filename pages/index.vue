<template>
    <div
      class="flex flex-col w-full gap-12">
      <HomePageTopMenu />
      <CommonQuoteCard />
      <!-- <HomePageEmotionCharts class="flex-1" /> -->
      <HomePageLatestEntries />
      <JournalResumeJournaling />
    </div>
</template> 

<script setup lang="ts">
import { Notebook } from "lucide-vue-next";

const userInfoStore = userInformationStore();
</script>
