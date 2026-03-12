<template>
  <div class="flex flex-col w-full min-h-screen pb-20 lg:pb-0">
    <!-- Date Header with Streak -->
    <HomePageDateHeader />

    <!-- Daily Check-In (Morning / Evening) -->
    <HomePageDailyCheckIn />
    
    <!-- Daily Prompt — placeholder only, excluded from layout for now -->
    <!-- <HomePageDailyPrompt /> -->

    <!-- Therapy Homework (shows only when pending items exist) -->
    <ToolkitHomeworkCard
      v-if="pendingHomework.length > 0"
      :pending-items="pendingHomework"
      @toggle="toolkitStore.toggleHomework"
    />
    
    <!-- Journal Entries Section -->
    <div class="px-4">
      <h3 class="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-4 text-center">
        {{ $t('home.yourEntries') }}
      </h3>
      <HomePageLatestEntries />
    </div>
    
    <!-- Floating Action Button -->
    <HomePageFloatingActionButton />
  </div>
</template>

<script setup lang="ts">
import { useToolkitStore } from "~/stores/stores/therapy_toolkit_store";

const toolkitStore = useToolkitStore();

const pendingHomework = computed(() => toolkitStore.pendingHomework);

// Load toolkit data if not already loaded
onMounted(async () => {
  if (toolkitStore.homeworkItems.length === 0) {
    await toolkitStore.loadFromLocal();
  }
});
</script>
