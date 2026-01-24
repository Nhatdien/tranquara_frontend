<template>
  <section class="space-y-3 pb-6">
    <!-- Entry Cards -->
    <div 
      v-for="journal in userJournalStore()?.journals" 
      :key="journal.id"
      @click="() => openEntry(journal)"
      class="bg-muted rounded-xl p-4 cursor-pointer hover:bg-accented transition border"
    >
      <!-- Header: Category & Time -->
      <div class="flex justify-between items-start mb-3">
        <span class="text-xs text-muted uppercase tracking-wide font-semibold">
          REFLECTION
        </span>
        <span class="text-xs text-muted">
          {{ formatTime(journal.created_at) }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="font-semibold text-highlighted mb-3 text-lg">
        {{ journal.title }}
      </h3>

      <!-- Mood Tag -->
      <div class="flex flex-wrap gap-2 mb-3" v-if="journal.mood_label">
        <span class="px-3 py-1 bg-accented rounded-full text-xs text-default flex items-center gap-1">
          {{ journal.mood_label }}
        </span>
      </div>

      <!-- Content Preview (first few lines) -->
      <div class="text-sm text-muted line-clamp-3" v-html="getContentPreview(journal.content)"></div>
    </div>

    <!-- Empty State -->
    <div v-if="!userJournalStore().journals || userJournalStore().journals.length === 0" class="text-center py-12">
      <p class="text-muted mb-4">No journal entries yet</p>
      <UButton @click="navigateTo('/journaling')" variant="outline">
        Start Your First Entry
      </UButton>
    </div>

    <!-- See All Button -->
    <div v-if="userJournalStore().journals && userJournalStore().journals.length > 0" class="text-center pt-4">
      <UButton 
        variant="ghost" 
        @click="navigateTo('/history')"
        class="text-muted hover:text-default"
      >
        See all entries
        <template #trailing>
          <ChevronRight class="w-4 h-4" />
        </template>
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CreateJournalRequest, LocalJournal } from '~/types/user_journal';
import { ChevronRight } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/stores/auth_store';

const authStore = useAuthStore();

const openEntry = (journal: LocalJournal) => {
  userJournalStore().currentJournal = journal;
  navigateTo(`/learn_and_prepare/journal/${journal.id}`);
};

const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const getContentPreview = (content: string) => {
  if (!content) return '';

  console.log(content);
  
  // Strip HTML tags and get first 150 characters
  const stripped = content;
  return stripped.length > 150 ? stripped.substring(0, 150) + '...' : stripped;
};

onMounted(async () => {
  try {
    // Wait for auth to be ready
    if (!authStore.isAuthenticated) {
      console.log('[LatestEntries] User not authenticated, skipping journal load');
      return;
    }
    
    // Ensure database is initialized before loading journals
    if (!userJournalStore().isInitialized) {
      console.log('[LatestEntries] Database not initialized, initializing...');
      await userJournalStore().initializeDatabase();
    }
    await userJournalStore().getJournals();
    console.log('[LatestEntries] Journals loaded:', userJournalStore().journals.length);
  } catch (error) {
    console.error('[LatestEntries] Error loading journals:', error);
  }
});
</script>
