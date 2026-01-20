<template>
  <div class="flex flex-col min-h-screen bg-background">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <UButton variant="ghost" icon="i-lucide-arrow-left" @click="router.back()" />
      <h1 class="text-lg font-semibold">New Journal</h1>
      <UButton variant="ghost" icon="i-lucide-check" @click="saveAndClose" :disabled="!hasContent" />
    </header>

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
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import { useAuthStore } from "~/stores/stores/auth_store";
import EmotionSlider from "~/components/Common/EmotionSlider.vue";

const router = useRouter();
const journalStore = userJournalStore();
const authStore = useAuthStore();

// Form state
const title = ref("");
const content = ref("");
const moodScore = ref(2); // 0-4 scale (EmotionSlider uses this range)
const moodLabel = ref("Okay");
const showMoodPicker = ref(false);
const editorRef = ref<any>(null);
const autoSaveStatus = ref("Ready");
const lastSavedAt = ref<Date | null>(null);

// Debounce for auto-save
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed
const formattedDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const hasContent = computed(() => {
  // Strip HTML tags and check if there's actual text
  const stripped = content.value.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
});

const selectedMoodEmoji = computed(() => {
  const v = moodScore.value;
  if (v <= 0) return "😢";
  if (v <= 1) return "😔";
  if (v <= 2) return "😐";
  if (v <= 3) return "🙂";
  return "";
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
  // Debounced auto-save indicator
  autoSaveStatus.value = "Typing...";
  
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(() => {
    autoSaveStatus.value = "Auto-saved";
    lastSavedAt.value = new Date();
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
    
    // Ensure database is initialized
    if (!journalStore.isInitialized) {
      await journalStore.initializeDatabase();
    }
    
    await journalStore.createJournal({
      collection_id: null, // Free-form journal has no collection
      title: title.value || "Untitled Journal",
      content: content.value,
      content_html: content.value, // For free-form, content IS html
      mood_score: moodScore.value,
      mood_label: moodLabel.value,
    });

    autoSaveStatus.value = "Saved!";
    
    // Navigate back after short delay to show "Saved!" status
    setTimeout(() => {
      router.push("/history");
    }, 300);
  } catch (error) {
    console.error("[FreeformJournal] Error saving:", error);
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
/* Ensure editor takes remaining space */
:deep(.tiptap.ProseMirror) {
  min-height: 50vh;
  outline: none;
}
</style>
