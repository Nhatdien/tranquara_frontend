<template>
  <section class="space-y-3 pb-6">
    <!-- Entry Cards -->
    <div 
      v-for="journal in userJournalStore().journals" 
      :key="journal.id"
      @click="() => openModal(journal)"
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
      <div class="flex flex-wrap gap-2 mb-3" v-if="journal.mood">
        <span class="px-3 py-1 bg-accented rounded-full text-xs text-default flex items-center gap-1">
          {{ journal.mood }}
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

    <!-- Modal for viewing/editing -->
    <UModal
      :title="userJournalStore().currentJournal.title"
      v-model:open="isOpen"
      v-on:after:leave="closeModal"
      fullscreen
    >
      <template #body>
        <JournalJournalingModalContent           
          v-model="isOpen"
          :template-id="activeTemplate?.id"
          @saveJournal="saveJournal"
          @closeModal="closeModal" 
        />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { CreateJournalRequest, Journal } from '~/types/user_journal';
import { ChevronRight } from 'lucide-vue-next';

const isOpen = ref(false);
const activeTemplate = ref<any | null>(null);

const openModal = (journal: Journal) => {
  userJournalStore().currentJournal = journal
  isOpen.value = true;
};

const closeModal = () => {
  userJournalStore().currentJournal = {} as Journal
  useChatlogtore().$reset
  isOpen.value = false;
};

const saveJournal = (journal: CreateJournalRequest, templateId?: string) => {
  if (templateId) {
    console.log("journal saved with template", templateId);
  } else {
    console.log("journal saved without any template");
  }
  userJournalStore().createJournal({
    ...journal,
  });
};

const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const getContentPreview = (content: string) => {
  if (!content) return '';
  // Strip HTML tags and get first 150 characters
  const stripped = content.replace(/<[^>]*>/g, '');
  return stripped.length > 150 ? stripped.substring(0, 150) + '...' : stripped;
};

onMounted(async () => {
  await waitForToken();
  userJournalStore().getJournals();
});
</script>
