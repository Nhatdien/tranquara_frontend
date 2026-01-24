<template>
  <div class="flex flex-col min-h-screen bg-background">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <UButton variant="ghost" icon="i-lucide-arrow-left" @click="router.back()" />
      <h1 class="text-lg font-semibold">Edit Journal</h1>
      <UButton variant="ghost" icon="i-lucide-check" @click="saveAndClose" :disabled="!hasContent" />
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <Icon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Title Input -->
      <div class="px-4 pt-4">
        <input
          v-model="title"
          type="text"
          placeholder="Title (optional)"
          class="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-600"
        />
      </div>

      <!-- Date Display -->
      <div class="px-4 py-2">
        <span class="text-sm text-muted">{{ formattedDate }}</span>
      </div>

      <!-- TipTap Editor -->
      <div class="flex-1 px-4 pb-4">
        <CommonMarkdownEditor
          ref="editorRef"
          v-model="content"
          @on-update="onContentUpdate"
        />
      </div>

      <!-- Bottom Toolbar -->
      <div class="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Mood Selector -->
          <UButton 
            variant="ghost" 
            size="sm"
            @click="showMoodPicker = true"
          >
            <span class="text-lg">{{ selectedMoodEmoji }}</span>
            <span class="ml-1 text-sm text-muted">{{ moodLabel }}</span>
          </UButton>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted">{{ autoSaveStatus }}</span>
        </div>
      </div>

      <!-- Mood Picker Modal -->
      <UModal v-model:open="showMoodPicker">
        <template #content>
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4 text-center">How are you feeling?</h3>
            <div class="flex justify-center mb-6">
              <EmotionSlider v-model="moodScore" />
            </div>
            <p class="text-center text-lg font-medium mb-4">{{ computedMoodLabel }}</p>
            <UButton block @click="confirmMood">Confirm</UButton>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import { useAuthStore } from "~/stores/stores/auth_store";
import EmotionSlider from "~/components/Common/EmotionSlider.vue";
import type { LocalJournal } from "~/types/user_journal";

const route = useRoute();
const router = useRouter();
const journalStore = userJournalStore();
const authStore = useAuthStore();

// Form state
const isLoading = ref(true);
const journalId = ref<string>("");
const title = ref("");
const content = ref("");
const moodScore = ref(2);
const moodLabel = ref("Okay");
const showMoodPicker = ref(false);
const editorRef = ref<any>(null);
const autoSaveStatus = ref("Ready");
const originalCreatedAt = ref<string>("");

// Debounce for auto-save
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

// Load journal on mount
onMounted(async () => {
  journalId.value = route.params.id as string;
  
  try {
    // Ensure database is initialized
    if (!journalStore.isInitialized) {
      await journalStore.initializeDatabase();
    }
    
    const journal = await journalStore.getJournalById(journalId.value);
    if (journal) {
      title.value = journal.title || "";
      content.value = journal.content_html || journal.content || "";
      moodScore.value = journal.mood_score ?? 2;
      moodLabel.value = journal.mood_label || "Okay";
      originalCreatedAt.value = journal.created_at;
    } else {
      console.error("Journal not found");
      router.push("/history");
    }
  } catch (error) {
    console.error("Error loading journal:", error);
    router.push("/history");
  } finally {
    isLoading.value = false;
  }
});

// Computed
const formattedDate = computed(() => {
  if (originalCreatedAt.value) {
    return new Date(originalCreatedAt.value).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return "";
});

const hasContent = computed(() => {
  const stripped = content.value.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
});

const selectedMoodEmoji = computed(() => {
  const v = moodScore.value;
  if (v <= 0) return "😢";
  if (v <= 1) return "😔";
  if (v <= 2) return "😐";
  if (v <= 3) return "🙂";
  return "😃";
});

const computedMoodLabel = computed(() => {
  const v = moodScore.value;
  if (v <= 0) return "Terrible";
  if (v <= 1) return "Bad";
  if (v <= 2) return "Okay";
  if (v <= 3) return "Good";
  return "Fantastic";
});

// Methods
const onContentUpdate = () => {
  autoSaveStatus.value = "Typing...";
  
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(() => {
    autoSaveStatus.value = "Unsaved changes";
  }, 1000);
};

const confirmMood = () => {
  moodLabel.value = computedMoodLabel.value;
  showMoodPicker.value = false;
};

const saveAndClose = async () => {
  if (!hasContent.value) return;

  try {
    autoSaveStatus.value = "Saving...";
    
    await journalStore.updateJournal({
      id: journalId.value,
      title: title.value || "Untitled Journal",
      content: content.value,
      content_html: content.value,
      mood_score: moodScore.value,
      mood_label: moodLabel.value,
    });

    autoSaveStatus.value = "Saved!";
    
    setTimeout(() => {
      router.push("/history");
    }, 300);
  } catch (error) {
    console.error("[EditJournal] Error saving:", error);
    autoSaveStatus.value = "Error saving";
  }
};

// Cleanup
onUnmounted(() => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
});
</script>

<style scoped>
:deep(.tiptap.ProseMirror) {
  min-height: 50vh;
  outline: none;
}
</style>
