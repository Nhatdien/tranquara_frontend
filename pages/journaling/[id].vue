<template>
  <div class="h-full">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <Icon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- ============ EDIT MODE ============ -->

    <!-- Slide Edit Mode (for template journals with collection_id) -->
    <div v-else-if="isEditing && journal && journal.collection_id" class="h-full">
      <JournalEditModalContents
        :journal="journal"
        :templateId="journal.collection_id"
        @saved="onSaved"
        @closed="onEditClosed"
      />
    </div>

    <!-- Free-form Edit Mode (for journals without collection_id) -->
    <div v-else-if="isEditing && journal" class="flex flex-col min-h-screen bg-background">
      <!-- Header -->
      <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <UButton variant="ghost" icon="i-lucide-arrow-left" @click="onEditClosed" />
        <h1 class="text-lg font-semibold">{{ $t('journal.editJournal') }}</h1>
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

    <!-- ============ VIEW MODE (default) ============ -->
    <JournalDetailView
      v-else-if="journal"
      :journal="journal"
      :is-syncing="journalStore.isSyncing"
      :is-deleting="isDeleting"
      @back="router.back()"
      @edit="enterEdit"
      @delete="deleteJournal"
    />

    <!-- Not Found -->
    <div v-else class="flex items-center justify-center h-full">
      <p class="text-muted">{{ $t('journal.notFound') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { userJournalStore } from "~/stores/stores/user_journal";
import { useAuthStore } from "~/stores/stores/auth_store";
import EmotionSliderV2 from "~/components/Common/EmotionSliderV2.vue";
import TranquaraSDK from "~/stores/tranquara_sdk";
import type { LocalJournal } from "~/types/user_journal";
import { useAIGuard } from "~/composables/useAIGuard";

definePageMeta({ layout: "detail" });

const route = useRoute();
const router = useRouter();
const journalStore = userJournalStore();
const { canUseAI, yourStory } = useAIGuard();
const { t, locale } = useI18n();
const { formatDate: formatLocalDate } = useLocalizedDate();

// State
const isLoading = ref(true);
const journal = ref<LocalJournal | null>(null);
const isEditing = ref(false);
const isDeleting = ref(false);

// Free-form editor state
const title = ref("");
const content = ref("");
const moodScore = ref(5);
const moodLabel = ref("Okay");
const showMoodPicker = ref(false);
const editorRef = ref<any>(null);
const autoSaveStatus = ref("ready");
const isGeneratingQuestion = ref(false);

// Map autoSaveStatus keys to i18n
const autoSaveStatusText = computed(() => {
  return t(`journal.autoSave.${autoSaveStatus.value}`);
});

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
    return formatLocalDate(journal.value.created_at, {
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

const computedMoodLabel = computed(() => t(`journal.moodLabels.${moodScore.value}`) || t('journal.moodLabels.5'));

const onSaved = async () => {
  // Reload journal data and return to view mode
  const journalId = route.params.id as string;
  const updated = await journalStore.getJournalById(journalId);
  if (updated) journal.value = updated;
  isEditing.value = false;
};

const onEditClosed = () => {
  isEditing.value = false;
};

// --- View mode helpers ---

const enterEdit = () => {
  if (journal.value && !journal.value.collection_id) {
    // Prefill free-form editor state from journal
    title.value = journal.value.title || "";
    content.value = journal.value.content_html || journal.value.content || "";
    moodScore.value = journal.value.mood_score ?? 5;
    moodLabel.value = journal.value.mood_label || "Okay";
  }
  isEditing.value = true;
};

const deleteJournal = async () => {
  if (!journal.value) return;
  try {
    isDeleting.value = true;
    await journalStore.deleteJournal(journal.value.id);
    router.push('/history');
  } catch (error) {
    console.error('Error deleting journal:', error);
    isDeleting.value = false;
  }
};

const onContentUpdate = () => {
  autoSaveStatus.value = "typing";
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    autoSaveStatus.value = "unsavedChanges";
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
    const plainText = content.value.replace(/<[^>]*>/g, '').trim();
    const userId = useAuthStore().getUserUUID;
    
    const response = await sdk.analyzeJournal({
      user_id: userId || '',
      content: plainText,
      mood_score: moodScore.value,
      slide_prompt: undefined,
      your_story: yourStory.value || undefined,
    });
    
    if (editorRef.value?.editor) {
      editorRef.value.editor
        .chain()
        .focus('end')
        .insertContent('<p></p>')
        .insertContent('<p class="ai-suggestion" style="color: #888; font-style: italic;">' + response.question + '</p>')
        .insertContent('<p></p>')
        .run();
    }
    
    autoSaveStatus.value = "questionAdded";
    setTimeout(() => { autoSaveStatus.value = "unsavedChanges"; }, 2000);
  } catch (error) {
    console.error("[GoDeeper] Error:", error);
    autoSaveStatus.value = "error";
    setTimeout(() => { autoSaveStatus.value = "unsavedChanges"; }, 2000);
  } finally {
    isGeneratingQuestion.value = false;
  }
};

const saveAndClose = async () => {
  if (!hasContent.value || !journal.value) return;

  try {
    autoSaveStatus.value = "saving";
    
    await journalStore.updateJournal({
      id: journal.value.id,
      title: title.value || t('journal.untitledJournal'),
      content: content.value,
      content_html: content.value,
      mood_score: moodScore.value,
      mood_label: moodLabel.value,
    });

    // Reload journal and return to view mode
    const updated = await journalStore.getJournalById(journal.value.id);
    if (updated) journal.value = updated;
    isEditing.value = false;
    autoSaveStatus.value = "saved";
  } catch (error) {
    console.error("[EditJournal] Error saving:", error);
    autoSaveStatus.value = "errorSaving";
  }
};

onUnmounted(() => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
});
</script>