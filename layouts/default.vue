<template>
  <div class="min-h-screen bg-[var(--ui-bg)] flex flex-col">
    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
    
    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import BottomNavigation from "~/components/Common/BottomNavigation.vue";
</script>

<style scoped>
/* Ensure content doesn't get hidden behind bottom nav */
main {
  padding-bottom: 4rem; /* 64px for bottom nav */
}
</style>
