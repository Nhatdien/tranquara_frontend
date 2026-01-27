<template>
  <section class="p-4">
    <div class="flex justify-between w-full">
      <ChevronLeft @click="prevNode" />
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted">Editing</span>
        <X @click="closeWithoutSaving"/>
      </div>
    </div>
    <UCarousel
      :watch-drag="true"
      ref="carousel"
      class="mt-12"
      dots
      v-slot="{ item }"
      :items="(carouselItems as any[])"
      @select="(index: number) => (currentIndex = index)"
      :ui="{
        viewport: 'h-full',
        dot: 'w-6 h-1 rounded-none'
      }">
      <div class="h-[70vh] max-h-[700px]">
        <component
          :is="renderSlide((item as CarouselSlideItem)?.content?.type)"
          :currentIndex
          :index="carouselItems.indexOf(item as CarouselSlideItem)"
          :content="(item as CarouselSlideItem)?.content"
          :initialContent="(item as CarouselSlideItem)?.prefillContent"></component>
      </div>
    </UCarousel>

    <!-- Button group -->
    <div class="flex fixed justify-between w-full bottom-8 right-4">
      <div></div>
      <div class="flex items-center gap-2">
        <UButton :variant="'outline'" @click="saveJournalChanges" :loading="isSaving">
          <Check class="w-4 h-4 mr-1" />
          Save
        </UButton>
        <UButton :variant="'soft'" @click="nextNode"><ChevronRight /></UButton>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ChevronRight, ChevronLeft, X, Check } from "lucide-vue-next";
import Document from "@/components/Slide/Document.vue";
import CTA from "@/components/Slide/CTA.vue";
import FurtherReading from "@/components/Slide/FutherReading.vue";
import JournalPrompt from "@/components/Slide/JournalPrompt.vue";
import SleepCheck from "~/components/Slide/SleepCheck.vue";
import MoodSlide from "~/components/Slide/MoodSlide.vue";
import type { LocalJournal } from "~/types/user_journal";

interface CarouselSlideItem {
  content: any;
  currentNote: string;
  prefillContent: string;
}

const props = defineProps<{
  journal: LocalJournal;
  templateId: string;
}>();

const emit = defineEmits(['saved', 'closed']);

const carousel = useTemplateRef("carousel");
const currentIndex = ref(0);
const isSaving = ref(false);

const store = userJournalStore();

// Get the slide group for this journal's collection
const { activeSlideGroup } = useSlideGroup({ 
  collectionId: props.templateId 
});

const componentMapping: Record<string, any> = {
  doc: Document,
  journal_prompt: JournalPrompt,
  further_reading: FurtherReading,
  cta: CTA,
  sleep_check: SleepCheck,
  mood_check: MoodSlide,
  emotion_log: MoodSlide,
}

const renderSlide = (type: string) => {
  return componentMapping[type] || componentMapping.journal_prompt;
}

// Parse existing journal content to extract answers for each slide
const parseJournalContent = (contentHtml: string): Record<string, string> => {
  const parsed: Record<string, string> = {};
  
  if (!contentHtml) return parsed;
  
  // Try to parse the structured format: <p class="journal-question">Question</p><p class="journal-answer">Answer</p>
  const questionRegex = /<p[^>]*class="journal-question"[^>]*>(.*?)<\/p>/g;
  const answerRegex = /<p[^>]*class="journal-answer"[^>]*>([\s\S]*?)<\/p>/g;
  
  const questions = [...contentHtml.matchAll(questionRegex)].map(m => m[1]);
  const answers = [...contentHtml.matchAll(answerRegex)].map(m => m[1]);
  
  questions.forEach((question, idx) => {
    if (answers[idx]) {
      parsed[question] = answers[idx];
    }
  });
  
  // If no structured format found, try to use the whole content
  if (Object.keys(parsed).length === 0 && contentHtml) {
    // For simple journals, use the content as-is for the first prompt
    const slides = activeSlideGroup.value?.slides || [];
    const firstPrompt = slides.find((s: any) => s.type === 'journal_prompt');
    if (firstPrompt) {
      const question = (firstPrompt as any).question || (firstPrompt as any).question_content;
      if (question) {
        // Strip the question part if it exists in the content
        let cleanContent = contentHtml;
        // Remove any existing question headers
        cleanContent = cleanContent.replace(/<p[^>]*class="journal-question"[^>]*>[\s\S]*?<\/p>/g, '');
        parsed[question] = cleanContent.trim();
      }
    }
  }
  
  return parsed;
};

// Build carousel items with prefilled content
const carouselItems = computed((): CarouselSlideItem[] => {
  const slides = activeSlideGroup.value?.slides || (activeSlideGroup.value as any)?.content || [];
  const prefillData = parseJournalContent(props.journal.content_html || props.journal.content);
  
  return slides.map((slide: any) => {
    const question = slide.question || slide.question_content;
    return {
      content: slide,
      currentNote: "",
      prefillContent: prefillData[question] || "",
    };
  });
});

// Initialize store with journal data
onMounted(() => {
  // Set mood data from journal
  store.currentMoodScore = props.journal.mood_score ?? 5;
  store.currentMoodLabel = props.journal.mood_label || "Okay";
  store.currentJournal = props.journal;
  
  // Pre-populate the writing content
  const prefillData = parseJournalContent(props.journal.content_html || props.journal.content);
  store.currentWritingContent = prefillData;
  
  // Init editor store
  carouselItems.value.forEach(() => {
    // @ts-ignore
    useTiptapEditorStore().editors.push({});
  });
});

const nextNode = () => {
  if (!carousel.value?.emblaApi?.canScrollNext()) {
    // At the end, save and close
    saveJournalChanges();
  } else {
    carousel.value?.emblaApi?.scrollNext();
  }
};

const prevNode = () => {
  if (!carousel.value?.emblaApi?.canScrollPrev()) {
    closeWithoutSaving();
  } else {
    carousel.value?.emblaApi?.scrollPrev();
  }
};

const saveJournalChanges = async () => {
  try {
    isSaving.value = true;
    
    const newContent = generateJournalHtml(store.currentWritingContent);
    
    await store.updateJournal({
      id: props.journal.id,
      title: props.journal.title,
      content: newContent,
      content_html: newContent,
      mood_score: store.currentMoodScore,
      mood_label: store.currentMoodLabel,
    });
    
    // Clear session
    clearSession();
    
    emit('saved');
  } catch (error) {
    console.error("[EditModal] Error saving:", error);
  } finally {
    isSaving.value = false;
  }
};

const closeWithoutSaving = () => {
  clearSession();
  emit('closed');
};

const clearSession = () => {
  useChatlogtore().chatlogs = [];
  store.currentWritingContent = {};
  store.currentJournal = null;
  useTiptapEditorStore().editors = [];
};
</script>
