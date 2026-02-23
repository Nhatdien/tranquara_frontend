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
    <JournalDetailView
      v-else-if="journal"
      :journal="journal"
      :is-syncing="store.isSyncing"
      :is-deleting="isDeleting"
      @back="router.back()"
      @edit="editJournal"
      @delete="deleteJournal"
    />

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

definePageMeta({ layout: "detail" });

const route = useRoute();
const router = useRouter();
const store = userJournalStore();
const journal = ref<LocalJournal | null>(null);
const isDeleting = ref(false);
const isEditMode = ref(false);

onMounted(async () => {
  const id = route.params.id as string;
  if (store.currentJournal && store.currentJournal.id === id) {
    journal.value = store.currentJournal;
  } else {
    try {
      journal.value = await store.getJournalById(id);
    } catch (e) {
      console.error("Journal not found", e);
      router.push("/history");
    }
  }
});

const editJournal = () => {
  if (journal.value) {
    if (journal.value.collection_id) {
      isEditMode.value = true;
    } else {
      navigateTo(`/journaling/${journal.value.id}`);
    }
  }
};

const onSaved = async () => {
  isEditMode.value = false;
  if (journal.value) {
    journal.value = await store.getJournalById(journal.value.id);
  }
};

const onEditClosed = () => {
  isEditMode.value = false;
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
