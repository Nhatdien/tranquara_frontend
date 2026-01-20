<template>
  <div class="flex flex-col h-full bg-background" v-if="journal">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <UButton variant="ghost" icon="i-lucide-arrow-left" @click="router.back()" />
      <h1 class="text-xl font-bold truncate max-w-[200px]">{{ journal.title || 'Untitled Journal' }}</h1>
      <UButton variant="ghost" icon="i-lucide-more-vertical" />
    </header>

    <!-- Content Scrollable -->
    <main class="flex-1 overflow-y-auto p-4 space-y-6">
      
      <!-- Meta Info -->
      <div class="flex flex-col gap-2">
        <span class="text-sm text-muted">{{ formatDate(journal.created_at) }}</span>
        
        <div v-if="journal.mood_label" class="flex items-center gap-2">
           <span class="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium flex items-center gap-2">
            <Icon name="i-lucide-smile" class="w-4 h-4" />
            {{ journal.mood_label }}
          </span>
           <span v-if="journal.mood_score !== null && journal.mood_score !== undefined" class="text-xs text-muted">Score: {{ journal.mood_score }}/4</span>
        </div>
      </div>

      <!-- Journal Content -->
      <div class="prose dark:prose-invert max-w-none journal-content">
        <div v-html="journal.content"></div>
      </div>

    </main>
  </div>
  <div v-else class="flex items-center justify-center h-full">
     <Icon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import type { LocalJournal } from "~/types/user_journal";

const route = useRoute();
const router = useRouter();
const store = userJournalStore();
const journal = ref<LocalJournal | null>(null);

onMounted(async () => {
  const id = route.params.id as string;
  if (store.currentJournal && store.currentJournal.id === id) {
    journal.value = store.currentJournal;
  } else {
    try {
      // Try to fetch from store or DB
      journal.value = await store.getJournalById(id);
    } catch (e) {
      console.error("Journal not found", e);
      router.push('/history');
    }
  }
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style>
.journal-content .journal-question {
  @apply font-bold text-lg mb-2 text-gray-800 dark:text-gray-100;
}
.journal-content .journal-answer {
  @apply text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed;
}
</style>
