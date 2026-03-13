<template>
  <div class="min-h-screen bg-default flex">
    <!-- Desktop Sidebar Navigation (shared across layouts) -->
    <SidebarNavigation />

    <!-- Main Content Area (offset for sidebar on desktop) -->
    <div class="flex-1 flex flex-col lg:ml-64">
      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-2xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarNavigation from "~/components/Common/SidebarNavigation.vue";
</script>
