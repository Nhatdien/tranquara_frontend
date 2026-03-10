<template>
  <div class="flex flex-col items-center justify-center h-full px-4">
    <h2 class="text-2xl font-bold mb-4 text-center text-highlighted">{{ displayQuestion }}</h2>
    <p class="text-sm text-muted mb-6 text-center">{{ $t('slide.moodInstruction') }}</p>
    <EmotionSliderV2 v-model="moodValue" />
  </div>
</template>

<script setup lang="ts">
import EmotionSliderV2 from "~/components/Common/EmotionSliderV2.vue";
import { computed, ref, watch } from "vue";
import { userJournalStore } from "~/stores/stores/user_journal";

const { t } = useI18n();

const props = withDefaults(defineProps<{
  /**
   * Question text to display
   */
  question?: string;
}>(), {
  question: '',
});

// Use prop if provided, otherwise fall back to translated default
const displayQuestion = computed(() => props.question || t('slide.defaultMoodQuestion'));

const store = userJournalStore();

// Initialize with current value (1-10 scale)
const moodValue = ref(store.currentMoodScore);

// Watch for changes in store mood score (e.g., when editing existing journal)
watch(() => store.currentMoodScore, (newScore) => {
  if (moodValue.value !== newScore) {
    moodValue.value = newScore;
  }
}, { immediate: true });

// Mood labels for 1-10 scale (use i18n)
const moodLabel = computed(() => t(`slide.moodLabels.${moodValue.value}`) || t('slide.moodLabels.5'));

// Update store when value changes
watch(moodValue, (val) => {
  // Store the 1-10 scale value directly
  store.updateMood(val, moodLabel.value);
  
  // Store the actual 1-10 value in currentWritingContent for journal save
  store.currentWritingContent['mood_score_10'] = String(val);
});

// Expose the current mood score for parent components
defineExpose({
  getMoodScore: () => moodValue.value,
  getMoodLabel: () => moodLabel.value,
});
</script>
