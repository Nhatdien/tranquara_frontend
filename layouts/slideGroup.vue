<template>
  <div class="min-h-screen bg-default flex">
    <!-- Desktop Sidebar Navigation -->
    <SidebarNavigation />

    <main class="flex-1 flex items-start justify-center lg:items-center lg:ml-64">
      <div class="w-full max-w-lg mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SidebarNavigation from "~/components/Common/SidebarNavigation.vue";
</script>
