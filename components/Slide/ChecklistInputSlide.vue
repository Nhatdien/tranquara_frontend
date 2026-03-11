<template>
  <div class="flex flex-col h-full px-4">
    <h2 class="text-2xl font-bold mb-2 text-center text-highlighted">
      {{ displayQuestion }}
    </h2>
    <p v-if="displayContent" class="text-sm text-muted mb-6 text-center">
      {{ displayContent }}
    </p>

    <!-- Add input -->
    <div class="flex gap-2 mb-4">
      <UInput
        v-model="newItemText"
        :placeholder="$t('toolkit.homework.addPlaceholder', 'Add an item...')"
        class="flex-1"
        @keyup.enter="addItem"
      />
      <button
        @click="addItem"
        :disabled="!newItemText.trim()"
        class="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-lg transition-colors"
        :class="newItemText.trim() ? 'hover:bg-neutral-700 text-white' : 'text-neutral-600 cursor-not-allowed'"
      >
        +
      </button>
    </div>

    <!-- Items list -->
    <div class="flex-1 overflow-y-auto space-y-2">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-900/50"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-5 h-5 rounded border-2 border-neutral-600 shrink-0" />
          <span class="text-sm truncate">{{ item }}</span>
        </div>
        <button
          @click="removeItem(i)"
          class="text-neutral-500 hover:text-neutral-300 ml-2 shrink-0 text-lg"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Counter -->
    <p v-if="items.length > 0" class="text-xs text-neutral-500 mt-3 text-center">
      {{ items.length }} {{ items.length === 1 ? 'item' : 'items' }}
    </p>
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

const newItemText = ref('');
const items = ref<string[]>([]);

const syncToStore = () => {
  store.updateCurrentWritingContent(
    displayQuestion.value,
    JSON.stringify(items.value)
  );
};

const addItem = () => {
  const text = newItemText.value.trim();
  if (!text) return;
  items.value.push(text);
  newItemText.value = '';
  syncToStore();
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
  syncToStore();
};
</script>
