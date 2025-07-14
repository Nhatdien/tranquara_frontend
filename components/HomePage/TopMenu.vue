<template>
  <section class="flex justify-between items-center w-full">
    <div class="flex flex-col justify-center items-start w-full gap-y-4">
      <h1>Hi {{ $tranquaraSDK.config.current_username }} 👋</h1>
      <h4>How are you feeling now ?</h4>
      <UButton class="font-semibold cursor-pointer w-full" size="xl"> <span class="text-center w-full p-2">Open TheraPrep Chat </span> </UButton>
      <h4>Check in with your AI companion</h4>
    </div>
    <div class="flex items-center gap-4">
      <!-- will be moved to user-auth section -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScreen } from "~/composables/useScreen"; // Assuming you have a useScreen composable
import { Bell } from "lucide-vue-next";
import moment from "moment";

const { $tranquaraSDK } = useNuxtApp()
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
