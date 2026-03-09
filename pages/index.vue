<template>
  <div class="flex flex-col w-full min-h-screen pb-20">
    <!-- Date Header with Streak -->
    <HomePageDateHeader />

    <!-- Daily Check-In (Morning / Evening) -->
    <HomePageDailyCheckIn />
    
    <!-- Daily Prompt -->
    <HomePageDailyPrompt />
    
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
// Auto-imported components
</script>
