<template>
  <div class="flex items-center justify-between px-4 py-6">
    <!-- Streak Counter -->
    <button class="flex items-center gap-2 px-4 py-2 bg-muted rounded-full cursor-pointer active:scale-95 transition-transform" @click="navigateToProgress">
      <Flame class="w-5 h-5 text-primary" :fill="'currentColor'" />
      <span class="text-sm font-semibold">{{ streak }}</span>
    </button>

    <!-- Date Display -->
    <div class="text-center flex-1">
      <h1 class="text-2xl font-bold text-primary lg:text-3xl">{{ $t('home.today') }}</h1>
      <p class="text-sm text-muted lg:text-base">{{ formattedDate }}</p>
    </div>

    <!-- Profile and Sync Icons (mobile only — sidebar has profile on desktop) -->
    <div class="flex items-center gap-1 lg:invisible">
      <!-- Sync Status Mini Indicator -->
      <SyncMiniIndicator size="sm" @click="navigateToSync" />
      
      <!-- Profile Icon -->
      <NuxtLink to="/profile" class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <User class="w-5 h-5 text-toned" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame, User } from "lucide-vue-next";
import { computed } from 'vue';
import { useUserStreakStore } from "~/stores/stores/user_streak";

const router = useRouter();
const streakStore = useUserStreakStore();

const streak = computed(() => streakStore.currentStreak);

// Navigate to profile page (sync section)
const navigateToSync = () => {
  router.push('/profile#data-sync');
};

// Navigate to progress/stats page
const navigateToProgress = () => {
  router.push('/progress');
};

const formattedDate = computed(() => {
  const date = new Date();
  const month = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}, ${day}`;
});
</script>
