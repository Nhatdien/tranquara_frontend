<template>
  <div class="flex flex-col items-center justify-center h-full px-4">
    <h2 class="text-2xl font-bold mb-2 text-center text-highlighted">
      {{ displayQuestion }}
    </h2>
    <p v-if="displayContent" class="text-sm text-muted mb-8 text-center">
      {{ displayContent }}
    </p>

    <div class="w-full max-w-xs">
      <input
        type="date"
        v-model="selectedDate"
        class="w-full px-4 py-3 rounded-xl bg-elevated border border-default text-center text-lg focus:outline-none focus:border-accented transition-colors"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from '~/stores/stores/user_journal';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const store = userJournalStore();

const displayQuestion = computed(() =>
  props.content?.question || props.content?.question_content || ''
);

const displayContent = computed(() =>
  props.content?.content || props.content?.question_description || ''
);

// Default to today
const selectedDate = ref(new Date().toISOString().split('T')[0]);

// Store the selected date in currentWritingContent
watch(selectedDate, (val) => {
  store.updateCurrentWritingContent(
    displayQuestion.value,
    val
  );
}, { immediate: true });
</script>
