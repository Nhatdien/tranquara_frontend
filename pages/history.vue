<template>
  <div class="flex flex-col w-full min-h-screen pb-20 lg:pb-0 px-4">
    <!-- Header with Filter Button -->
    <div class="py-6 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold mb-2">{{ $t('history.title') }}</h1>
        <p class="text-muted text-sm">{{ $t('history.subtitle') }}</p>
      </div>
      
      <!-- Filter Button (Top Right) -->
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-sliders-horizontal"
        size="lg"
        @click="isFilterDrawerOpen = true"
      />
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap gap-2 items-center">
      <span class="text-xs text-muted">{{ $t('history.activeFilters') }}</span>
      
      <UBadge v-if="searchQuery" color="primary" variant="soft" class="gap-1">
        <Icon name="i-lucide-search" class="w-3 h-3" />
        "{{ searchQuery }}"
        <button @click="searchQuery = ''; applyFilters()" class="ml-1 hover:opacity-70">
          <Icon name="i-lucide-x" class="w-3 h-3" />
        </button>
      </UBadge>
      
      <UBadge v-if="selectedCollection" color="primary" variant="soft" class="gap-1">
        <Icon name="i-lucide-folder" class="w-3 h-3" />
        {{ getTemplateName(selectedCollection) }}
        <button @click="selectedCollection = null; applyFilters()" class="ml-1 hover:opacity-70">
          <Icon name="i-lucide-x" class="w-3 h-3" />
        </button>
      </UBadge>
      
      <UBadge v-if="dateRange" color="primary" variant="soft" class="gap-1">
        <Icon name="i-lucide-calendar" class="w-3 h-3" />
        {{ formatDateRange() }}
        <button @click="dateRange = null; applyFilters()" class="ml-1 hover:opacity-70">
          <Icon name="i-lucide-x" class="w-3 h-3" />
        </button>
      </UBadge>
      
      <UButton variant="link" size="xs" @click="clearAllFilters">
        {{ $t('history.clearAll') }}
      </UButton>
    </div>

    <!-- Sync Status Banner -->
    <div class="mb-4">
      <SyncStatusBanner
        :is-online="journalStore.isOnline"
        :is-syncing="journalStore.isSyncing"
        :pending-count="pendingSyncCount"
        :show-sync-button="true"
        @sync="triggerSync"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <Icon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredJournals.length === 0" class="text-center py-12">
      <Icon name="i-lucide-book-open" class="w-12 h-12 text-muted mx-auto mb-4" />
      <p class="text-muted mb-4">
        {{ hasActiveFilters ? $t('history.noMatchingEntries') : $t('history.noEntries') }}
      </p>
      <UButton v-if="hasActiveFilters" @click="clearAllFilters" variant="outline">
        {{ $t('history.clearFilters') }}
      </UButton>
      <UButton v-else @click="navigateTo('/learn_and_prepare')" variant="outline">
        {{ $t('history.startFirst') }}
      </UButton>
    </div>

    <!-- Entries List -->
    <div v-else class="space-y-6">
      <!-- Group by Date -->
      <div v-for="(entries, dateKey) in groupedEntries" :key="dateKey">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
          {{ dateKey }}
        </h2>
        
        <div class="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3">
          <div 
            v-for="entry in entries" 
            :key="entry.id"
            class="bg-muted rounded-xl p-4 cursor-pointer hover:bg-accented transition relative"
            @click="openEntry(entry)"
          >
            <!-- Sync Status Badge -->
            <div class="absolute top-3 right-3">
              <SyncBadge 
                :needs-sync="entry.needs_sync" 
                :syncing="journalStore.isSyncing"
              />
            </div>

            <!-- Template Name & Time -->
            <div class="flex justify-between items-start mb-2 pr-12">
              <h3 class="font-semibold text-highlighted">
                {{ entry.title || getTemplateName(entry.collection_id) || $t('history.journal') }}
              </h3>
              <span class="text-xs text-muted">{{ formatTime(entry.created_at) }}</span>
            </div>
            
            <!-- Tags Row -->
            <div class="flex flex-wrap gap-2 mb-2">
              <!-- Mood Tag -->
              <span v-if="entry.mood_label" class="px-3 py-1 bg-accented rounded-full text-xs text-default flex items-center gap-1">
                <Icon :name="getMoodIcon(entry.mood_score)" class="w-3 h-3" />
                {{ entry.mood_label }}
              </span>
              
              <!-- Template Tag (if different from title) -->
              <span v-if="entry.collection_id && entry.title" class="px-3 py-1 bg-accented rounded-full text-xs text-default flex items-center gap-1">
                <Icon name="i-lucide-folder" class="w-3 h-3" />
                {{ getTemplateName(entry.collection_id) }}
              </span>
            </div>

            <!-- Content Preview -->
            <p v-if="getContentPreview(entry.content)" class="text-sm text-muted line-clamp-2">
              {{ getContentPreview(entry.content) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Drawer -->
    <UDrawer 
      v-model:open="isFilterDrawerOpen" 
      direction="bottom"
      :title="$t('history.filters')"
      :handle="true"
    >
      <template #body>
        <div class="space-y-6">
          <!-- Search Bar -->
          <div>
            <label class="text-sm font-medium text-muted mb-2 block">{{ $t('history.search') }}</label>
            <UInput 
              v-model="tempSearchQuery"
              :placeholder="$t('history.searchPlaceholder')"
              icon="i-lucide-search"
              size="lg"
            />
          </div>

          <!-- Date Range -->
          <div>
            <label class="text-sm font-medium text-muted mb-2 block">{{ $t('history.dateRange') }}</label>
            <UInput 
              :model-value="formatTempDateRange()"
              :placeholder="$t('history.dateRangePlaceholder')"
              readonly
              icon="i-lucide-calendar"
              class="w-full cursor-pointer"
              @click="showDateRangePicker = true"
            />
            <!-- Clear date range button -->
            <UButton 
              v-if="tempDateRange"
              variant="link" 
              size="xs" 
              class="mt-1"
              @click="tempDateRange = null"
            >
              {{ $t('history.clearDates') }}
            </UButton>
          </div>

          <!-- Date Range Picker Modal -->
          <UModal v-model:open="showDateRangePicker">
            <template #content>
              <div class="p-4">
                <h3 class="text-lg font-semibold mb-4">{{ $t('history.selectDateRange') }}</h3>
                <UCalendar v-model="tempDateRange" range class="mx-auto" />
                <div class="flex justify-end gap-2 mt-4">
                  <UButton variant="outline" @click="tempDateRange = null">{{ $t('history.clear') }}</UButton>
                  <UButton @click="showDateRangePicker = false">{{ $t('history.done') }}</UButton>
                </div>
              </div>
            </template>
          </UModal>

          <!-- Template/Collection Filter -->
          <div>
            <label class="text-sm font-medium text-muted mb-2 block">{{ $t('history.filterByType') }}</label>
            <USelect
              v-model="tempSelectedCollection"
              :items="collectionOptions"
              :placeholder="$t('history.allEntries')"
              value-key="value"
              class="w-full"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex gap-3">
          <UButton 
            variant="outline" 
            color="neutral" 
            class="flex-1"
            @click="resetFilters"
          >
            {{ $t('history.reset') }}
          </UButton>
          <UButton 
            class="flex-1"
            @click="applyFiltersFromDrawer"
          >
            {{ $t('history.applyFilters') }}
          </UButton>
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import { useAuthStore } from "~/stores/stores/auth_store";
import type { LocalJournal } from "~/types/user_journal";

// DateRange type for UCalendar with range prop (simplified)
interface DateRangeValue {
  start: { year: number; month: number; day: number };
  end: { year: number; month: number; day: number };
}

const journalStore = userJournalStore();
const authStore = useAuthStore();
const { formatDateGroupHeader, formatTime } = useLocalizedDate();

// Filter drawer state
const isFilterDrawerOpen = ref(false);

// Date range picker modal
const showDateRangePicker = ref(false);

// Active filter state
const searchQuery = ref('');
const selectedCollection = ref<string | null>(null);
const dateRange = ref<DateRangeValue | null>(null);

// Temporary filter state (for drawer before applying)
const tempSearchQuery = ref('');
const tempSelectedCollection = ref<string | null>(null);
const tempDateRange = ref<any>(null); // Using any for UCalendar compatibility

// Collection options for dropdown (compact display)
const collectionOptions = computed(() => {
  const options = [
    { label: 'All Entries', value: null },
    { label: 'Journal (Free-form)', value: 'free-form' },
  ];
  
  // Add templates from store
  journalStore.templates.forEach(template => {
    options.push({
      label: template.title,
      value: template.id
    });
  });
  
  return options;
});

// Loading states
const isLoading = ref(true);
const searchResults = ref<LocalJournal[]>([]);

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || 
         selectedCollection.value !== null || 
         dateRange.value !== null;
});

// Load journals on mount
onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      console.log('[History] User not authenticated, skipping journal load');
      isLoading.value = false;
      return;
    }
    
    if (!journalStore.isInitialized) {
      console.log('[History] Database not initialized, initializing...');
      await journalStore.initializeDatabase();
    }
    await journalStore.getJournals();
    console.log('[History] Journals loaded:', journalStore.journals.length);
  } catch (error) {
    console.error('Error loading journals:', error);
  } finally {
    isLoading.value = false;
  }
});

// When opening the drawer, sync temp values with current filters
watch(isFilterDrawerOpen, (open) => {
  if (open) {
    tempSearchQuery.value = searchQuery.value;
    tempSelectedCollection.value = selectedCollection.value;
    // Convert dateRange to tempDateRange format if needed
    tempDateRange.value = dateRange.value ? { ...dateRange.value } : null;
  }
});

// Apply filters from the drawer
const applyFiltersFromDrawer = () => {
  searchQuery.value = tempSearchQuery.value;
  selectedCollection.value = tempSelectedCollection.value;
  // Convert tempDateRange from UCalendar to our simplified format
  if (tempDateRange.value && tempDateRange.value.start && tempDateRange.value.end) {
    dateRange.value = {
      start: {
        year: tempDateRange.value.start.year,
        month: tempDateRange.value.start.month,
        day: tempDateRange.value.start.day
      },
      end: {
        year: tempDateRange.value.end.year,
        month: tempDateRange.value.end.month,
        day: tempDateRange.value.end.day
      }
    };
  } else {
    dateRange.value = null;
  }
  isFilterDrawerOpen.value = false;
  applyFilters();
};

// Apply filters (trigger search if needed)
const applyFilters = async () => {
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

// Reset filters in drawer
const resetFilters = () => {
  tempSearchQuery.value = '';
  tempSelectedCollection.value = null;
  tempDateRange.value = null;
};

// Clear all filters
const clearAllFilters = () => {
  searchQuery.value = '';
  selectedCollection.value = null;
  dateRange.value = null;
  searchResults.value = [];
};

// Filtered journals based on all active filters
const filteredJournals = computed(() => {
  let journals = searchQuery.value.trim() ? searchResults.value : journalStore.journals;
  
  // Filter by collection
  if (selectedCollection.value) {
    if (selectedCollection.value === 'free-form') {
      // Free-form journals have no collection_id
      journals = journals.filter(j => !j.collection_id);
    } else {
      journals = journals.filter(j => j.collection_id === selectedCollection.value);
    }
  }
  
  // Filter by date range
  if (dateRange.value && dateRange.value.start && dateRange.value.end) {
    const rangeStart = new Date(dateRange.value.start.year, dateRange.value.start.month - 1, dateRange.value.start.day);
    const rangeEnd = new Date(dateRange.value.end.year, dateRange.value.end.month - 1, dateRange.value.end.day);
    rangeEnd.setHours(23, 59, 59, 999); // Include the entire end day
    
    journals = journals.filter(j => {
      const journalDate = new Date(j.created_at);
      return journalDate >= rangeStart && journalDate <= rangeEnd;
    });
  }
  
  return journals.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

// Group journals by date (matching the UI design format)
const groupedEntries = computed(() => {
  const groups: Record<string, LocalJournal[]> = {};
  
  filteredJournals.value.forEach(journal => {
    const date = new Date(journal.created_at);
    const dateKey = formatDateGroupHeader(date);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(journal);
  });
  
  return groups;
});

// Format date range for display in active filters
const formatDateRange = () => {
  if (!dateRange.value || !dateRange.value.start || !dateRange.value.end) return '';
  
  const startStr = `${dateRange.value.start.month}/${dateRange.value.start.day}`;
  const endStr = `${dateRange.value.end.month}/${dateRange.value.end.day}`;
  return `${startStr} - ${endStr}`;
};

// Format temp date range for display in drawer input
const formatTempDateRange = () => {
  if (!tempDateRange.value || !tempDateRange.value.start || !tempDateRange.value.end) return '';
  
  const startStr = `${tempDateRange.value.start.month}/${tempDateRange.value.start.day}/${tempDateRange.value.start.year}`;
  const endStr = `${tempDateRange.value.end.month}/${tempDateRange.value.end.day}/${tempDateRange.value.end.year}`;
  return `${startStr} - ${endStr}`;
};

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

// Get mood icon based on score
const getMoodIcon = (moodScore: number | null | undefined) => {
  if (!moodScore) return 'i-lucide-smile';
  if (moodScore <= 3) return 'i-lucide-cloud-rain';
  if (moodScore <= 5) return 'i-lucide-cloud';
  if (moodScore <= 7) return 'i-lucide-cloud-sun';
  return 'i-lucide-sun';
};

// Get content preview (strip HTML and TipTap JSON)
const getContentPreview = (content: string) => {
  if (!content) return '';
  
  // Try to parse as JSON first (TipTap format)
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === 'doc' && parsed.content) {
      // Extract text from TipTap nodes
      const extractText = (nodes: any[]): string => {
        return nodes.map(node => {
          if (node.type === 'text') return node.text || '';
          if (node.type === 'paragraph' && node.content) return extractText(node.content);
          if (node.type === 'slideResponse' && node.attrs?.userAnswer) return node.attrs.userAnswer;
          if (node.content) return extractText(node.content);
          return '';
        }).join(' ');
      };
      return extractText(parsed.content).substring(0, 150);
    }
  } catch {
    // Not JSON, treat as HTML or plain text
  }
  
  // Strip HTML tags
  return content.replace(/<[^>]*>/g, '').substring(0, 150);
};

// Open entry for viewing/editing
const openEntry = (entry: LocalJournal) => {
  journalStore.currentJournal = entry;
  navigateTo(`/journaling/${entry.id}`);
};
</script>