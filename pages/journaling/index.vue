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
        
        <!-- Go Deeper Button -->
        <UButton
          variant="ghost"
          size="sm"
          :loading="isGeneratingQuestion"
          :disabled="!hasContent || isGeneratingQuestion"
          @click="handleGoDeeper"
          icon="i-lucide-sparkles"
        >
          <span class="text-sm">Go Deeper</span>
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
          <EmotionSliderV2 v-model="moodScore" />
          <UButton block class="mt-4" @click="confirmMood">Confirm</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import { useAuthStore } from "~/stores/stores/auth_store";
import EmotionSliderV2 from "~/components/Common/EmotionSliderV2.vue";
import TranquaraSDK from "~/stores/tranquara_sdk";

const router = useRouter();
const journalStore = userJournalStore();
const authStore = useAuthStore();

// Form state
const title = ref("");
const content = ref("");
const moodScore = ref(5); // 1-10 scale (new EmotionSliderV2)
const moodLabel = ref("Okay");
const showMoodPicker = ref(false);
const editorRef = ref<any>(null);
const autoSaveStatus = ref("Ready");
const lastSavedAt = ref<Date | null>(null);
const isGeneratingQuestion = ref(false);

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
  if (v <= 2) return "😢";
  if (v <= 4) return "😔";
  if (v <= 6) return "😐";
  if (v <= 8) return "🙂";
  return "😃";
});

// Mood labels for 1-10 scale
const moodLabels: Record<number, string> = {
  1: 'Terrible',
  2: 'Very Bad',
  3: 'Bad',
  4: 'Poor',
  5: 'Okay',
  6: 'Fine',
  7: 'Good',
  8: 'Very Good',
  9: 'Great',
  10: 'Fantastic',
};

const computedMoodLabel = computed(() => {
  return moodLabels[moodScore.value] || 'Okay';
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

const handleGoDeeper = async () => {
  if (!hasContent.value || isGeneratingQuestion.value) return;
  
  try {
    isGeneratingQuestion.value = true;
    autoSaveStatus.value = "Thinking...";
    
    const sdk = TranquaraSDK.getInstance();
    
    // Get plain text content from editor
    const plainText = content.value.replace(/<[^>]*>/g, '').trim();
    
    const response = await sdk.analyzeJournal({
      content: plainText,
      mood_score: moodScore.value,
      slide_prompt: undefined, // No template for free-form journaling
    });
    
    // Insert AI question into editor with muted styling
    if (editorRef.value?.editor) {
      const editor = editorRef.value.editor;
      
      editor
        .chain()
        .focus('end')
        .insertContent('<p></p>') // Add empty line
        .insertContent(`<p class="ai-suggestion" style="color: #888; font-style: italic;">💭 ${response.question}</p>`)
        .insertContent('<p></p>') // Add empty line for user to type
        .run();
    }
    
    autoSaveStatus.value = "Question added!";
    setTimeout(() => {
      autoSaveStatus.value = "Ready";
    }, 2000);
  } catch (error) {
    console.error("[GoDeeper] Error:", error);
    autoSaveStatus.value = "Error generating question";
    setTimeout(() => {
      autoSaveStatus.value = "Ready";
    }, 2000);
  } finally {
    isGeneratingQuestion.value = false;
  }
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
