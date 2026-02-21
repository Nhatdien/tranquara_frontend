<template>
  <section class="flex justify-between items-center w-full">
    <div class="flex flex-col justify-center items-start w-full gap-y-4">
      <h1>
        Good {{ timeInDays(moment().toNow()) }}
        {{ $tranquaraSDK.config.current_username }} 👋
      </h1>
      <div class="flex flex-col gap-4 w-full">
        <UCard variant="soft" class="flex-1 shadow-2xl" size="xl">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Your journey</span>
            </div>
          </template>
          <div class="flex gap-8 items-center">
            <img
              class="object-fill bg-linear-155 from-primary-200 to-primary-500 max-w-24 rounded-full w-auto black-to-white"
              src="@/assets/img/journaling.png" />
            <div class="w-full">
              <p class="font-semibold text-lg">Journaling streak</p>
              <span class="flex gap-1 items-center text-primary-700 font-bold"
                ><Flame /> {{ streakStore.currentStreak }} {{ streakStore.currentStreak === 1 ? 'day' : 'days' }}</span
              >



            </div>
          </div>
        </UCard>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <!-- will be moved to user-auth section -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScreen } from "~/composables/useScreen";
import { Flame } from "lucide-vue-next";
import { useUserStreakStore } from "~/stores/stores/user_streak";
import moment from "moment";

const { $tranquaraSDK } = useNuxtApp();
const streakStore = useUserStreakStore();
const screen = useScreen();


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
