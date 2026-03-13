<template>
  <div class="min-h-screen bg-default flex">
    <!-- Desktop Sidebar Navigation (hidden on mobile, visible at lg:) -->
    <SidebarNavigation />

    <!-- Main Content Area (offset for sidebar on desktop) -->
    <div class="flex-1 flex flex-col lg:ml-64">
      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-5xl">
          <slot />
        </div>
      </main>

      <!-- Bottom Navigation (hidden on desktop) -->
      <BottomNavigation />
    </div>
  </div>
</template>

<script setup lang="ts">
import BottomNavigation from "~/components/Common/BottomNavigation.vue";
import SidebarNavigation from "~/components/Common/SidebarNavigation.vue";
</script>

