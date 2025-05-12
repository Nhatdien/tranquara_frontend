<template>
  <section class="flex justify-between w-full h-min">
    <h2>Good morning, Nhat</h2>
    <div class="flex items-center gap-4">

      <!-- will be moved to user-auth section -->
      {{ moment().format('dddd, MMMM Do, YYYY')}}
      <button class="glass-button p-2 rounded-full">
        <Bell></Bell>
        
      </button>
      <button class="glass-button p-5 rounded-full"></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScreen } from "~/composables/useScreen"; // Assuming you have a useScreen composable
import { Bell } from "lucide-vue-next";
import moment from "moment";
const isSearchActive = ref(false);
const screen = useScreen();

const isMediumOrBelow = computed(() => !screen.isLargerThanMedium);
</script>

<style scoped>
.flex {
  transition: transform 0.3s ease-in-out;
}

.flex.search-active .logo-section {
  transform: translateX(-300%);
  position: absolute;
}

.user-auth-section {
  flex-shrink: 0;
}
</style>
