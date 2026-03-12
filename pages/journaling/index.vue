<template>
  <div class="flex flex-col min-h-screen bg-background">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <UButton variant="ghost" icon="i-lucide-arrow-left" @click="router.back()" />
      <h1 class="text-lg font-semibold">{{ $t('journal.newJournal') }}</h1>
      <UButton variant="ghost" icon="i-lucide-check" @click="saveAndClose" :disabled="!hasContent" />
    </header>

    <!-- Title Input -->
    <div class="px-4 pt-4 max-w-2xl mx-auto w-full">
      <input
        v-model="title"
        type="text"
        :placeholder="$t('journal.titlePlaceholder')"
        class="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-600"
      />
    </div>

    <!-- Date Display -->
    <div class="px-4 py-2 max-w-2xl mx-auto w-full">
      <span class="text-sm text-muted">{{ formattedDate }}</span>
    </div>

    <!-- TipTap Editor -->
    <div class="flex-1 px-4 pb-4 max-w-2xl mx-auto w-full">
      <CommonMarkdownEditor
        ref="editorRef"
        v-model="content"
        @on-update="onContentUpdate"
      />
    </div>

    <!-- Bottom Toolbar -->
    <div class="fixed bottom-0 left-0 right-0 lg:left-64 bg-background border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
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
          <span class="text-sm">{{ $t('journal.goDeeper') }}</span>
        </UButton>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted">{{ autoSaveStatusText }}</span>
      </div>
    </div>

    <!-- Mood Picker Modal -->
    <UModal v-model:open="showMoodPicker">
      <template #content>
        <div class="p-6 w-full max-w-md mx-auto">
          <h3 class="text-lg font-semibold mb-4 text-center">{{ $t('journal.howFeeling') }}</h3>
          <EmotionSliderV2 v-model="moodScore" />
          <UButton block class="mt-4" @click="confirmMood">{{ $t('common.confirm') }}</UButton>
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
import { useAIGuard } from "~/composables/useAIGuard";

const router = useRouter();
const journalStore = userJournalStore();
const authStore = useAuthStore();
const { canUseAI, yourStory } = useAIGuard();
const { t, locale } = useI18n();
const { formatDate: formatLocalDate } = useLocalizedDate();

// Form state
const title = ref("");
const content = ref("");
const moodScore = ref(5); // 1-10 scale (new EmotionSliderV2)
const moodLabel = ref("Okay");
const showMoodPicker = ref(false);
const editorRef = ref<any>(null);
const autoSaveStatus = ref("ready");
const lastSavedAt = ref<Date | null>(null);
const isGeneratingQuestion = ref(false);

// Map autoSaveStatus keys to i18n
const autoSaveStatusText = computed(() => {
  return t(`journal.autoSave.${autoSaveStatus.value}`);
});

// Debounce for auto-save
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed
const formattedDate = computed(() => {
  return formatLocalDate(new Date(), {
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

// Mood labels for 1-10 scale (use i18n)
const computedMoodLabel = computed(() => {
  return t(`journal.moodLabels.${moodScore.value}`) || t('journal.moodLabels.5');
});

// Methods
const onContentUpdate = () => {
  // Debounced auto-save indicator
  autoSaveStatus.value = "typing";
  
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(() => {
    autoSaveStatus.value = "autoSaved";
    lastSavedAt.value = new Date();
  }, 1000);
};

const confirmMood = () => {
  moodLabel.value = computedMoodLabel.value;
  showMoodPicker.value = false;
};

const handleGoDeeper = async () => {
  if (!hasContent.value || isGeneratingQuestion.value) return;
  if (!canUseAI()) return;
  
  try {
    isGeneratingQuestion.value = true;
    autoSaveStatus.value = "thinking";
    
    const sdk = TranquaraSDK.getInstance();
    
    // Get plain text content from editor
    const plainText = content.value.replace(/<[^>]*>/g, '').trim();
    const userId = useAuthStore().getUserUUID;
    
    const response = await sdk.analyzeJournal({
      user_id: userId || '',
      content: plainText,
      mood_score: moodScore.value,
      slide_prompt: undefined, // No template for free-form journaling
      your_story: yourStory.value || undefined,
    });
    
    // Insert AI question into editor with muted styling
    if (editorRef.value?.editor) {
      const editor = editorRef.value.editor;
      
      editor
        .chain()
        .focus('end')
        .insertContent('<p></p>') // Add empty line
        .insertContent(`<p class="ai-suggestion" style="color: #888; font-style: italic;">${response.question}</p>`)
        .insertContent('<p></p>') // Add empty line for user to type
        .run();
    }
    
    autoSaveStatus.value = "questionAdded";
    setTimeout(() => {
      autoSaveStatus.value = "ready";
    }, 2000);
  } catch (error) {
    console.error("[GoDeeper] Error:", error);
    autoSaveStatus.value = "errorGenerating";
    setTimeout(() => {
      autoSaveStatus.value = "ready";
    }, 2000);
  } finally {
    isGeneratingQuestion.value = false;
  }
};

const saveAndClose = async () => {
  if (!hasContent.value) return;

  try {
    autoSaveStatus.value = "saving";
    
    // Ensure database is initialized
    if (!journalStore.isInitialized) {
      await journalStore.initializeDatabase();
    }
    
    await journalStore.createJournal({
      collection_id: null, // Free-form journal has no collection
      title: title.value || t('journal.untitledJournal'),
      content: content.value,
      content_html: content.value, // For free-form, content IS html
      mood_score: moodScore.value,
      mood_label: moodLabel.value,
    });

    autoSaveStatus.value = "saved";
    
    // Navigate back after short delay to show "Saved!" status
    setTimeout(() => {
      router.push("/history");
    }, 300);
  } catch (error) {
    console.error("[FreeformJournal] Error saving:", error);
    autoSaveStatus.value = "errorSaving";
  }
};

// Cleanup
onUnmounted(() => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
});
</script>
