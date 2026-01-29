<template>
  <div class="h-full">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <Icon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Slide Edit Mode (for journals with collection_id) -->
    <div v-else-if="journal && journal.collection_id" class="h-full">
      <JournalEditModalContents
        :journal="journal"
        :templateId="journal.collection_id"
        @saved="onSaved"
        @closed="onClosed"
      />
    </div>

    <!-- Simple Edit Mode (for free-form journals without collection_id) -->
    <div v-else-if="journal" class="flex flex-col min-h-screen bg-background">
      <!-- Header -->
      <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <UButton variant="ghost" icon="i-lucide-arrow-left" @click="router.back()" />
        <h1 class="text-lg font-semibold">Edit Journal</h1>
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

    <!-- Not Found -->
    <div v-else class="flex items-center justify-center h-full">
      <p class="text-muted">Journal not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import EmotionSliderV2 from "~/components/Common/EmotionSliderV2.vue";
import TranquaraSDK from "~/stores/tranquara_sdk";
import type { LocalJournal } from "~/types/user_journal";

const route = useRoute();
const router = useRouter();
const journalStore = userJournalStore();

// State
const isLoading = ref(true);
const journal = ref<LocalJournal | null>(null);

// Free-form editor state
const title = ref("");
const content = ref("");
const moodScore = ref(5);
const moodLabel = ref("Okay");
const showMoodPicker = ref(false);
const editorRef = ref<any>(null);
const autoSaveStatus = ref("Ready");
const isGeneratingQuestion = ref(false);

let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

// Load journal on mount
onMounted(async () => {
  const journalId = route.params.id as string;
  
  try {
    if (!journalStore.isInitialized) {
      await journalStore.initializeDatabase();
    }
    
    const loadedJournal = await journalStore.getJournalById(journalId);
    if (loadedJournal) {
      journal.value = loadedJournal;
      
      if (!loadedJournal.collection_id) {
        title.value = loadedJournal.title || "";
        content.value = loadedJournal.content_html || loadedJournal.content || "";
        moodScore.value = loadedJournal.mood_score ?? 5;
        moodLabel.value = loadedJournal.mood_label || "Okay";
      }
    } else {
      router.push("/history");
    }
  } catch (error) {
    console.error("Error loading journal:", error);
    router.push("/history");
  } finally {
    isLoading.value = false;
  }
});

const formattedDate = computed(() => {
  if (journal.value?.created_at) {
    return new Date(journal.value.created_at).toLocaleDateString("en-US", {
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
  if (v <= 2) return "😢";
  if (v <= 4) return "😔";
  if (v <= 6) return "😐";
  if (v <= 8) return "🙂";
  return "😃";
});

const moodLabels: Record<number, string> = {
  1: 'Terrible', 2: 'Very Bad', 3: 'Bad', 4: 'Poor', 5: 'Okay',
  6: 'Fine', 7: 'Good', 8: 'Very Good', 9: 'Great', 10: 'Fantastic',
};

const computedMoodLabel = computed(() => moodLabels[moodScore.value] || 'Okay');

const onSaved = () => {
  router.push("/history");
};

const onClosed = () => {
  router.back();
};

const onContentUpdate = () => {
  autoSaveStatus.value = "Typing...";
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    autoSaveStatus.value = "Unsaved changes";
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
    const plainText = content.value.replace(/<[^>]*>/g, '').trim();
    
    const response = await sdk.analyzeJournal({
      content: plainText,
      mood_score: moodScore.value,
      slide_prompt: undefined,
    });
    
    if (editorRef.value?.editor) {
      editorRef.value.editor
        .chain()
        .focus('end')
        .insertContent('<p></p>')
        .insertContent('<p class="ai-suggestion" style="color: #888; font-style: italic;">💭 ' + response.question + '</p>')
        .insertContent('<p></p>')
        .run();
    }
    
    autoSaveStatus.value = "Question added!";
    setTimeout(() => { autoSaveStatus.value = "Unsaved changes"; }, 2000);
  } catch (error) {
    console.error("[GoDeeper] Error:", error);
    autoSaveStatus.value = "Error";
    setTimeout(() => { autoSaveStatus.value = "Unsaved changes"; }, 2000);
  } finally {
    isGeneratingQuestion.value = false;
  }
};

const saveAndClose = async () => {
  if (!hasContent.value || !journal.value) return;

  try {
    autoSaveStatus.value = "Saving...";
    
    await journalStore.updateJournal({
      id: journal.value.id,
      title: title.value || "Untitled Journal",
      content: content.value,
      content_html: content.value,
      mood_score: moodScore.value,
      mood_label: moodLabel.value,
    });

    autoSaveStatus.value = "Saved!";
    setTimeout(() => { router.push("/history"); }, 300);
  } catch (error) {
    console.error("[EditJournal] Error saving:", error);
    autoSaveStatus.value = "Error saving";
  }
};

onUnmounted(() => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
});
</script>
