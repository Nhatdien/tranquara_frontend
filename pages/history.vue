<template>
  <div class="flex flex-col w-full min-h-screen pb-20 px-4">
    <div class="py-6">
      <h1 class="text-3xl font-bold mb-2">History</h1>
      <p class="text-muted text-sm">Your journal entries over time</p>
    </div>

    <!-- Sync Status Banner -->
    <div v-if="pendingSyncCount > 0" class="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon name="i-lucide-cloud-upload" class="w-5 h-5 text-blue-500" />
        <span class="text-sm text-blue-500">{{ pendingSyncCount }} entries pending sync</span>
      </div>
      <UButton 
        @click="triggerSync" 
        :loading="journalStore.isSyncing"
        :disabled="!journalStore.isOnline"
        size="xs"
        variant="ghost"
      >
        Sync Now
      </UButton>
    </div>

    <!-- Offline Banner -->
    <div v-if="!journalStore.isOnline" class="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
      <Icon name="i-lucide-wifi-off" class="w-5 h-5 text-yellow-500" />
      <span class="text-sm text-yellow-500">Working offline - showing local entries</span>
    </div>

    <!-- Filter/Search Bar -->
    <div class="mb-6">
      <UInput 
        v-model="searchQuery"
        placeholder="Search entries..."
        icon="i-heroicons-magnifying-glass"
        size="lg"
        @input="handleSearch"
      />
    </div>

    <!-- Collection Filter -->
    <div class="mb-6 flex flex-wrap gap-2">
      <UButton 
        :variant="selectedCollection === null ? 'solid' : 'outline'"
        size="sm"
        @click="selectedCollection = null"
      >
        All
      </UButton>
      <UButton 
        v-for="template in journalStore.templates"
        :key="template.id"
        :variant="selectedCollection === template.id ? 'solid' : 'outline'"
        size="sm"
        @click="selectedCollection = template.id"
      >
        {{ template.title }}
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <Icon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredJournals.length === 0" class="text-center py-12">
      <Icon name="i-lucide-book-open" class="w-12 h-12 text-muted mx-auto mb-4" />
      <p class="text-muted mb-4">
        {{ searchQuery ? 'No matching entries found' : 'No journal entries yet' }}
      </p>
      <UButton @click="navigateTo('/learn_and_prepare')" variant="outline">
        {{ searchQuery ? 'Clear Search' : 'Start Your First Entry' }}
      </UButton>
    </div>

    <!-- Entries List -->
    <div v-else class="space-y-6">
      <!-- Group by Month -->
      <div v-for="(entries, month) in groupedEntries" :key="month">
        <h2 class="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          {{ month }}
        </h2>
        
        <div class="space-y-3">
          <div 
            v-for="entry in entries" 
            :key="entry.id"
            class="bg-muted rounded-lg p-4 cursor-pointer hover:bg-accented transition relative"
            @click="openEntry(entry)"
          >
            <!-- Sync Status Badge -->
            <div v-if="entry.needs_sync === 1" class="absolute top-2 right-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full" title="Pending sync"></div>
            </div>

            <div class="flex justify-between items-start mb-2">
              <span class="text-xs text-muted uppercase tracking-wide">
                {{ getTemplateName(entry.collection_id) || 'JOURNAL' }}
              </span>
              <span class="text-xs text-muted">{{ formatTime(entry.created_at) }}</span>
            </div>
            
            <h3 class="font-semibold text-highlighted mb-2">{{ entry.title || 'Untitled' }}</h3>
            
            <!-- Mood Tag -->
            <div v-if="entry.mood_label" class="flex flex-wrap gap-2 mb-2">
              <span class="px-3 py-1 bg-accented rounded-full text-xs text-default flex items-center gap-1">
                <Icon name="i-lucide-smile" class="w-3 h-3" />
                {{ entry.mood_label }}
              </span>
            </div>

            <!-- Content Preview -->
            <p class="text-sm text-muted line-clamp-2">{{ getContentPreview(entry.content) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import type { LocalJournal } from "~/types/user_journal";

const journalStore = userJournalStore();
const searchQuery = ref('');
const selectedCollection = ref<string | null>(null);
const isLoading = ref(true);
const searchResults = ref<LocalJournal[]>([]);

// Load journals on mount
onMounted(async () => {
  try {
    // Database already initialized by 02.database.client.ts plugin
    await journalStore.getJournals();
  } catch (error) {
    console.error('Error loading journals:', error);
  } finally {
    isLoading.value = false;
  }
});

// Handle search
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    try {
      searchResults.value = await journalStore.searchJournals(searchQuery.value);
    } catch (error) {
      console.error('Error searching journals:', error);
    }
  } else {
    searchResults.value = [];
  }
};

// Filtered journals based on search and collection filter
const filteredJournals = computed(() => {
  let journals = searchQuery.value.trim() ? searchResults.value : journalStore.journals;
  
  if (selectedCollection.value) {
    journals = journals.filter(j => j.collection_id === selectedCollection.value);
  }
  
  return journals.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

// Group journals by month
const groupedEntries = computed(() => {
  const groups: Record<string, LocalJournal[]> = {};
  
  filteredJournals.value.forEach(journal => {
    const date = new Date(journal.created_at);
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(journal);
  });
  
  return groups;
});

// Pending sync count
const pendingSyncCount = computed(() => journalStore.pendingSyncCount);

// Trigger manual sync
const triggerSync = async () => {
  try {
    await journalStore.syncWithServer();
  } catch (error) {
    console.error('Error syncing:', error);
  }
};

// Get template name by ID
const getTemplateName = (collectionId: string | null | undefined) => {
  if (!collectionId) return null;
  const template = journalStore.templates.find(t => t.id === collectionId);
  return template?.title;
};

// Format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Get content preview (strip HTML)
const getContentPreview = (content: string) => {
  return content.replace(/<[^>]*>/g, '').substring(0, 150);
};

// Open entry for viewing/editing
const openEntry = (entry: LocalJournal) => {
  journalStore.currentJournal = entry;
  // TODO: Navigate to journal detail/edit page
  navigateTo(`/learn_and_prepare/journal/${entry.id}`);
};
</script>
