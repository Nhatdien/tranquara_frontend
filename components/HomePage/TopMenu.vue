<template>
  <section class="flex justify-between items-center w-full">
    <div class="flex flex-col justify-center items-start w-full gap-y-4">
      <h1>Hi {{ $tranquaraSDK.config.current_username }} 👋</h1>
      <div class="flex flex-col gap-4">
        <UButton
          variant="subtle"
          class="flex flex-1 justify-between font-semibold cursor-pointer w-full"
          size="xl">
          <div class="w-full">
            <img
              class="object-fill black-to-white"
              src="@/assets/img/journaling.png" />
          </div>
          <span class="text-center w-full p-2">Daily Reflection</span>
        </UButton>
        <UButton
          variant="subtle"
          class="flex flex-1 justify-between font-semibold cursor-pointer w-full"
          size="xl">
          <div class="w-full overflow-hidden">
            <img
              class="object-fill black-to-white"
              src="@/assets/img/prepare_for_thera.png" />
          </div>
          <span class="text-center w-full p-2">Prepare for your therapy</span>
        </UButton>
      </div>
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

const { $tranquaraSDK } = useNuxtApp();
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

.black-to-white {
  filter: invert(100%);
}

.user-auth-section {
  flex-shrink: 0;
}
</style>
