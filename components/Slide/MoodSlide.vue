<template>
  <div class="flex flex-col items-center justify-center h-full px-4">
    <h2 class="text-2xl font-bold mb-4 text-center text-highlighted">{{ question }}</h2>
    <p class="text-sm text-muted mb-6 text-center">Move the slider to reflect how you're feeling</p>
    <EmotionSliderV2 v-model="moodValue" />
  </div>
</template>

<script setup lang="ts">
import EmotionSliderV2 from "~/components/Common/EmotionSliderV2.vue";
import { computed, ref, watch } from "vue";
import { userJournalStore } from "~/stores/stores/user_journal";

const props = withDefaults(defineProps<{
  /**
   * Question text to display
   */
  question?: string;
}>(), {
  question: 'How are you feeling right now?',
});

const store = userJournalStore();

// Convert from old 0-4 scale to new 1-10 scale for backwards compatibility
const oldToNew = (old: number) => Math.round((old / 4) * 9) + 1;
const newToOld = (val: number) => Math.round(((val - 1) / 9) * 4);

// Initialize with current value (convert from 0-4 to 1-10)
const moodValue = ref(oldToNew(store.currentMoodScore));

// Mood labels for 1-10 scale
const moodLabels: Record<number, string> = {
  1: 'Terrible',
  2: 'Very Bad',
  3: 'Bad',
  4: 'Poor',
  5: 'Okay',
  6: 'Fine',
  7: 'Good',
  8: 'Very Good',
  9: 'Great',
  10: 'Fantastic',
};

const moodLabel = computed(() => moodLabels[moodValue.value] || 'Okay');

// Update store when value changes
watch(moodValue, (val) => {
  // Store both the new 1-10 scale value and the label
  // Also update the old 0-4 scale for backwards compatibility
  store.updateMood(newToOld(val), moodLabel.value);
  
  // Store the actual 1-10 value in currentWritingContent for journal save
  store.currentWritingContent['mood_score_10'] = String(val);
});

// Expose the current mood score for parent components
defineExpose({
  getMoodScore: () => moodValue.value,
  getMoodLabel: () => moodLabel.value,
});
</script>
