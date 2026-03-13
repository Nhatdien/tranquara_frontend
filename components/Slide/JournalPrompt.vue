<template>
  <div>
    <div class="mb-4">
      <h2 class="text-left">{{ content?.question || content?.question_content }}</h2>
      <blockquote class="text-default text-sm">
        {{ content?.content || content?.question_description }}
      </blockquote>
    </div>
    <CommonMarkdownEditor
      ref="editor"
      @on-update="onEditorUpdate"
      v-model="currentNote" />
    
    <!-- Go Deeper with Direction Selection -->
    <div class="mt-4 flex justify-end" v-if="hasContent">
      <JournalGoDeepDirections
        :loading="isGeneratingQuestion"
        :disabled="!hasContent || isGeneratingQuestion"
        @select="handleGoDeeper"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import TranquaraSDK from "~/stores/tranquara_sdk";
import { useAuthStore } from "~/stores/stores/auth_store";
import { useAIGuard } from "~/composables/useAIGuard";

const currentNote = ref("");
const isGeneratingQuestion = ref(false);
const { canUseAI, yourStory } = useAIGuard();

const editor = ref()
const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true
  },
  index: {
    type: Number,
    required: true,
  },
  initialContent: {
    type: String,
    default: "",
  },
  slideGroupContext: {
    type: Object,
    default: null,
  },
  collectionTitle: {
    type: String,
    default: null,
  },
});

// Computed to check if there's content
const hasContent = computed(() => {
  const stripped = currentNote.value.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
});

const onEditorUpdate = () => {
  userJournalStore().updateCurrentWritingContent(
    props.content?.question || props.content?.question_content,
    currentNote.value
  );
};

const handleGoDeeper = async (direction: string) => {
  if (!hasContent.value || isGeneratingQuestion.value) return;
  if (!canUseAI()) return;
  
  try {
    isGeneratingQuestion.value = true;
    
    const sdk = TranquaraSDK.getInstance();
    
    // Get plain text content from editor
    const plainText = currentNote.value.replace(/<[^>]*>/g, '').trim();
    const slidePrompt = props.content?.question || props.content?.question_content;
    const userId = useAuthStore().getUserUUID;
    
    const response = await sdk.analyzeJournal({
      user_id: userId || '',
      content: plainText,
      mood_score: userJournalStore().currentMoodScore,
      slide_prompt: slidePrompt,
      slide_group_context: props.slideGroupContext,  // Pass full slide group context
      current_slide_id: props.content?.id,            // Pass current slide ID
      collection_title: props.collectionTitle,         // Pass collection title
      direction: direction as 'why' | 'emotions' | 'patterns' | 'challenge' | 'growth',  // Pass selected direction
      your_story: yourStory.value || undefined,
    });
    
    // Insert AI question into editor with muted styling
    if (editor.value?.editor) {
      const editorInstance = editor.value.editor;
      
      editorInstance
        .chain()
        .focus('end')
        .insertContent('<p></p>', {
          contentType: 'html',
        })
        .insertContent(`<p class="ai-suggestion" style="color: #888; font-style: italic;">${response.question}</p>`, {
          contentType: 'html',
        })
        .insertContent('<p></p>', {
          contentType: 'html',
        })
        .run();
    }
  } catch (error) {
    console.error("[GoDeeper] Error:", error);
  } finally {
    isGeneratingQuestion.value = false;
  }
};

onMounted(() => {
  useTiptapEditorStore().editors[props.index] = editor.value?.editor;
  
  // Pre-fill content if provided (for edit mode)
  if (props.initialContent) {
    currentNote.value = props.initialContent;
    // Update editor content
    if (editor.value?.editor) {
      editor.value.editor.commands.setContent(props.initialContent);
    }
    // Also update the store
    userJournalStore().updateCurrentWritingContent(
      props.content?.question || props.content?.question_content,
      props.initialContent
    );
  }
});

// Watch for initialContent changes (in case it's provided after mount)
watch(() => props.initialContent, (newContent) => {
  if (newContent && editor.value?.editor) {
    currentNote.value = newContent;
    editor.value.editor.commands.setContent(newContent);
    userJournalStore().updateCurrentWritingContent(
      props.content?.question || props.content?.question_content,
      newContent
    );
  }
}, { immediate: true });

watch(() => [props.currentIndex, props.index], () => {
  if(props.currentIndex === props.index) {
    useTiptapEditorStore().editors[props.currentIndex]?.commands?.focus()
  }
}, {deep: true, immediate: true})

watch(
  () => userJournalStore().currentWritingContent,
  () => {
    const htmlString = generateJournalHtml(
      userJournalStore().currentWritingContent
    );
  },
  { deep: true }
);
</script>
