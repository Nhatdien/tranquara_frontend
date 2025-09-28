<template>
    <div
      class="flex flex-col w-full gap-8">
      <HomePageTopMenu />
      <CommonQuoteCard />
      <HomePageTodayLearning />
      <HomePageQuickLinks />
      <!-- <HomePageEmotionCharts class="flex-1" /> -->
    </div>
</template> 

<script setup lang="ts">
import { Notebook } from "lucide-vue-next";

const userInfoStore = userInformationStore();
</script>
