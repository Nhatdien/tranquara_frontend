<template>
  <div>
    <!-- Edit Mode with Slides -->
    <div v-if="isEditMode && journal && journal.collection_id" class="h-full">
      <JournalEditModalContents
        :journal="journal"
        :templateId="journal.collection_id"
        @saved="onSaved"
        @closed="onEditClosed" />
    </div>

    <!-- View Mode -->
    <div v-else-if="journal" class="flex flex-col h-full bg-background">
      <!-- Header -->
      <header
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <UButton
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="router.back()" />
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-bold truncate max-w-[180px]">
            {{ journal.title || "Untitled Journal" }}
          </h1>
          <!-- Sync Badge -->
          <SyncBadge
            :needs-sync="journal.needs_sync"
            :syncing="store.isSyncing" />
        </div>
        <UDropdownMenu :items="menuItems" :ui="{ content: 'w-40' }">
          <UButton variant="ghost" icon="i-lucide-more-vertical" />
        </UDropdownMenu>
      </header>

      <!-- Content Scrollable -->
      <main class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Meta Info -->
        <div class="flex flex-col gap-2">
          <span class="text-sm text-muted">{{
            formatDate(journal.created_at)
          }}</span>

          <div v-if="journal.mood_label" class="flex items-center gap-2">
            <span
              class="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium flex items-center gap-2">
              <Icon name="i-lucide-smile" class="w-4 h-4" />
              {{ journal.mood_label }}
            </span>
            <span
              v-if="
                journal.mood_score !== null && journal.mood_score !== undefined
              "
              class="text-xs text-muted"
              >Score: {{ journal.mood_score }}/10</span
            >
          </div>
        </div>

        <!-- Journal Content -->
        <div class="prose dark:prose-invert max-w-none journal-content">
          <div v-html="journal.content_html || journal.content"></div>
        </div>
      </main>

      <!-- Delete Confirmation Modal -->
      <UModal v-model:open="showDeleteConfirm">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-2">Delete Journal</h3>
            <p class="text-muted mb-6">
              Are you sure you want to delete this journal entry? This action
              cannot be undone.
            </p>
            <div class="flex gap-3">
              <UButton
                variant="outline"
                block
                @click="showDeleteConfirm = false"
                >Cancel</UButton
              >
              <UButton
                color="error"
                block
                @click="deleteJournal"
                :loading="isDeleting"
                >Delete</UButton
              >
            </div>
          </div>
        </template>
      </UModal>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center h-full">
      <Icon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import type { LocalJournal } from "~/types/user_journal";
import type { DropdownMenuItem } from "@nuxt/ui";

const route = useRoute();
const router = useRouter();
const store = userJournalStore();
const journal = ref<LocalJournal | null>(null);
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);
const isEditMode = ref(false);

// Dropdown menu items
const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Edit",
      icon: "i-lucide-edit",
      onSelect: () => editJournal(),
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => confirmDelete(),
    },
  ],
]);

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
      router.push("/history");
    }
  }
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const editJournal = () => {
  if (journal.value) {
    // If journal has a collection_id, use slide edit mode
    if (journal.value.collection_id) {
      isEditMode.value = true;
    } else {
      // For free-form journals, navigate to the simple editor
      navigateTo(`/journaling/${journal.value.id}`);
    }
  }
};

const onSaved = async () => {
  isEditMode.value = false;
  // Refresh journal data
  if (journal.value) {
    journal.value = await store.getJournalById(journal.value.id);
  }
};

const onEditClosed = () => {
  isEditMode.value = false;
};

const confirmDelete = () => {
  showDeleteConfirm.value = true;
};

const deleteJournal = async () => {
  if (!journal.value) return;

  try {
    isDeleting.value = true;
    await store.deleteJournal(journal.value.id);
    router.push("/history");
  } catch (error) {
    console.error("Error deleting journal:", error);
    isDeleting.value = false;
  }
};
</script>

<style scoped lang="scss">
.journal-content :deep(.journal-question) {
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.75rem;
  margin-bottom: 0.5rem;
}
.journal-content :deep(.journal-answer) {
  font-size: 1rem;
  line-height: 1.5rem;
  margin-bottom: 1.5rem;
}
.journal-content :deep(.ai-suggestion) {
  color: red;
  font-style: italic;
}
</style>
