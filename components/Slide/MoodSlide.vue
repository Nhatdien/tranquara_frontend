<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-2xl font-bold mb-8">How are you feeling right now?</h2>
    <EmotionSlider v-model="moodValue" />
    <div class="mt-8 text-center">
      <p class="text-lg font-medium">{{ moodLabel }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmotionSlider from "~/components/Common/EmotionSlider.vue";
import { computed, ref, watch } from "vue";
import { userJournalStore } from "~/stores/stores/user_journal";

const store = userJournalStore();
const moodValue = ref(store.currentMoodScore);

watch(moodValue, (val) => {
  store.updateMood(val, moodLabel.value);
});

// EmotionSlider uses 0-4 scale
const moodLabel = computed(() => {
  const v = moodValue.value;
  if (v <= 0) return "Terrible";
  if (v <= 1) return "Bad";
  if (v <= 2) return "Okay";
  if (v <= 3) return "Good";
  return "Fantastic";
});
</script>
