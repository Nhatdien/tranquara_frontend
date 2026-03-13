<template>
  <div class="px-4 mb-6 md:px-0 md:mb-0">
    <!-- Check-In Hero Card -->
    <div class="relative rounded-2xl bg-inverted border border-inverted overflow-hidden lg:max-w-2xl lg:mx-auto">
      <div class="flex flex-col items-center justify-center px-6 py-12 min-h-[360px] lg:min-h-[280px] lg:py-10">
        <!-- Illustration -->

        <!-- Greeting -->
        <h2 class="text-2xl font-bold text-inverted mb-8">{{ $t(greeting) }}</h2>

        <!-- Begin Button -->
        <UButton
          size="xl"
          color="neutral"
          variant="solid"
          class="px-8 rounded-full font-semibold"
          @click="beginCheckIn">
          {{ $t('home.beginCheckIn') }}
        </UButton>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { Bird, BookOpen, Pencil, SlidersHorizontal } from "lucide-vue-next";
import { userJournalStore } from "~/stores/stores/user_journal";

const journalStore = userJournalStore();

// Daily Reflection template ID
const DAILY_REFLECTION_ID = "55555555-5555-5555-5555-555555555555";
const MORNING_SLIDE_GROUP = "morning-prep";
const EVENING_SLIDE_GROUP = "evening-reflection";

// Time-based greeting
const currentHour = ref(new Date().getHours());

const greeting = computed(() => {
  if (currentHour.value < 12) return "home.greeting.morning";
  if (currentHour.value < 17) return "home.greeting.afternoon";
  return "home.greeting.evening";
});

// Pick the right slide group based on time of day
const activeSlideGroupId = computed(() => {
  return currentHour.value < 12 ? MORNING_SLIDE_GROUP : EVENING_SLIDE_GROUP;
});

// Update hour every minute to keep greeting fresh
let intervalId: ReturnType<typeof setInterval>;
onMounted(() => {
  intervalId = setInterval(() => {
    currentHour.value = new Date().getHours();
  }, 60_000);
});
onUnmounted(() => {
  clearInterval(intervalId);
});

// Navigate to the appropriate check-in slide group
const beginCheckIn = () => {
  navigateTo(`/learn_and_prepare/collection/${DAILY_REFLECTION_ID}/${activeSlideGroupId.value}`);
};

// Placeholder for future personalization
const onPersonalize = () => {
  // TODO: Open personalization modal/page
  console.log("[DailyCheckIn] Personalize tapped — not yet implemented");
};
</script>
