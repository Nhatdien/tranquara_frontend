<template>
  <button
    @click="handleClick"
    class="fixed bottom-20 right-6 w-14 h-14 bg-primary rounded-full shadow-lg hover:bg-primary transition-all hover:scale-110 z-40 flex items-center justify-center lg:hidden"
  >
    <Plus class="w-7 h-7 text-inverted" :stroke-width="2.5" />
  </button>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";

const handleClick = () => {
  // TODO: Navigate to journal template selection or new entry
  navigateTo('/journaling');
};
</script>
