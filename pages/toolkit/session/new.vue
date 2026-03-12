<template>
  <section class="p-4 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex justify-between w-full">
      <ChevronLeft @click="handleBack" />
      <X @click="handleClose" />
    </div>

    <!-- Carousel -->
    <UCarousel
      :watch-drag="true"
      ref="carousel"
      class="mt-12"
      dots
      v-slot="{ item }"
      :items="carouselItems"
      @select="(index: number) => (currentIndex = index)"
      :ui="{
        viewport: 'h-full',
        dot: 'w-6 h-1 rounded-none'
      }"
    >
      <div class="h-[70vh] max-h-[700px] lg:h-[60vh]">
        <component
          :is="renderSlide(item?.content?.type)"
          :currentIndex
          :index="carouselItems.indexOf(item)"
          :content="item?.content"
          :slideGroupContext="activeSlideGroup"
          :collectionTitle="collectionTitle"
        />
      </div>
    </UCarousel>

    <!-- Navigation -->
    <div class="flex fixed justify-between bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
      <div></div>
      <div class="flex items-center">
        <UButton :variant="'soft'" @click="nextNode"><ChevronRight /></UButton>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ChevronRight, ChevronLeft, X } from 'lucide-vue-next';
import Document from '@/components/Slide/Document.vue';
import CTA from '@/components/Slide/CTA.vue';
import FurtherReading from '@/components/Slide/FutherReading.vue';
import JournalPrompt from '@/components/Slide/JournalPrompt.vue';
import SleepCheck from '~/components/Slide/SleepCheck.vue';
import MoodSlide from '~/components/Slide/MoodSlide.vue';
import StarRatingSlide from '~/components/Slide/StarRatingSlide.vue';
import ChecklistInputSlide from '~/components/Slide/ChecklistInputSlide.vue';
import { useToolkitStore } from '~/stores/stores/therapy_toolkit_store';
import { userJournalStore } from '~/stores/stores/user_journal';
import { isEmptyJournal, generateJournalHtml } from '~/utils/journal';
import {
  SESSION_BEFORE_SLIDE_GROUP,
  SESSION_AFTER_SLIDE_GROUP,
} from '~/types/therapy_toolkit';

definePageMeta({ layout: 'slide-group' });

const route = useRoute();
const toolkitStore = useToolkitStore();
const journalStore = userJournalStore();

// Determine which flow: 'before' or 'after'
const step = computed(() =>
  (route.query.step as string) === 'after' ? 'after' : 'before'
);
const sessionId = computed(() => route.query.sessionId as string | undefined);

// Pick the right static slide group
const staticGroup = computed(() =>
  step.value === 'after' ? SESSION_AFTER_SLIDE_GROUP : SESSION_BEFORE_SLIDE_GROUP
);

const collectionTitle = computed(() =>
  step.value === 'after' ? 'After Your Session' : 'Before Your Session'
);

// Use the composable in static mode
const { activeSlideGroup, saveJournal, closeSlideGroup } = useSlideGroup({
  staticSlideGroup: staticGroup.value,
  staticCollectionTitle: collectionTitle.value,
});

// Component mapping (same as ModalContents)
const componentMapping: any = {
  doc: Document,
  journal_prompt: JournalPrompt,
  further_reading: FurtherReading,
  cta: CTA,
  sleep_check: SleepCheck,
  mood_check: MoodSlide,
  emotion_log: MoodSlide,
  star_rating: StarRatingSlide,
  checklist_input: ChecklistInputSlide,
};

const renderSlide = (type: string) => {
  return componentMapping[type] || componentMapping.journal_prompt;
};

// Carousel
const carousel = useTemplateRef('carousel');
const currentIndex = ref(0);

const carouselItems = computed(() =>
  (activeSlideGroup.value?.slides || []).map((slide: any) => ({
    content: slide as any,
    currentNote: '',
  }))
);

// ─── Completion Logic ──────────────────────────────────

/** Extract a value from currentWritingContent by matching the slide question */
const getWrittenValue = (slideId: string): string => {
  const slide = staticGroup.value.slides.find(s => s.id === slideId);
  if (!slide?.question) return '';
  return journalStore.currentWritingContent[slide.question] || '';
};

const handleBeforeComplete = async () => {
  if (!sessionId.value) return;

  const talkingPoints = getWrittenValue('before-talking-points');
  const priority = getWrittenValue('before-priority');

  // Save journal entry (for Qdrant indexing / Go Deeper context)
  if (!isEmptyJournal(journalStore.currentWritingContent as any)) {
    await saveJournal({
      content: generateJournalHtml(journalStore.currentWritingContent),
      mood_score: journalStore.currentMoodScore,
      mood_label: journalStore.currentMoodLabel,
      title: activeSlideGroup.value?.title || 'Before Session',
    });
  }

  // Update the existing scheduled session with pre-session reflection
  await toolkitStore.updateSession(sessionId.value, {
    mood_before: journalStore.currentMoodScore,
    talking_points: talkingPoints,
    session_priority: priority,
    status: 'before_completed',
  });
};

const handleAfterComplete = async () => {
  if (!sessionId.value) return;

  const takeaways = getWrittenValue('after-takeaways');
  const homeworkRaw = getWrittenValue('after-homework');
  const ratingStr = getWrittenValue('after-rating');

  // Save journal entry
  if (!isEmptyJournal(journalStore.currentWritingContent as any)) {
    await saveJournal({
      content: generateJournalHtml(journalStore.currentWritingContent),
      mood_score: journalStore.currentMoodScore,
      mood_label: journalStore.currentMoodLabel,
      title: activeSlideGroup.value?.title || 'After Session',
    });
  }

  // Update structured session
  await toolkitStore.updateSession(sessionId.value, {
    mood_after: journalStore.currentMoodScore,
    key_takeaways: takeaways,
    session_rating: ratingStr ? parseInt(ratingStr) : undefined,
    status: 'completed',
  });

  // Parse homework items from checklist JSON
  if (homeworkRaw) {
    try {
      const items: string[] = JSON.parse(homeworkRaw);
      for (const item of items) {
        if (item.trim()) {
          await toolkitStore.addHomework(sessionId.value, item.trim());
        }
      }
    } catch {
      // Fallback: treat as single item if not valid JSON
      if (homeworkRaw.trim()) {
        await toolkitStore.addHomework(sessionId.value, homeworkRaw.trim());
      }
    }
  }
};

// ─── Navigation ────────────────────────────────────────

const nextNode = async () => {
  if (!carousel.value?.emblaApi?.canScrollNext()) {
    // Last slide — complete the flow
    if (step.value === 'before') {
      await handleBeforeComplete();
    } else {
      await handleAfterComplete();
    }

    // Clean up and navigate back
    cleanup();
    navigateTo('/toolkit');
  } else {
    carousel.value?.emblaApi?.scrollNext();
  }
};

const handleBack = () => {
  if (!carousel.value?.emblaApi?.canScrollPrev()) {
    cleanup();
    navigateTo('/toolkit');
  } else {
    carousel.value?.emblaApi?.scrollPrev();
  }
};

const handleClose = () => {
  cleanup();
  navigateTo('/toolkit');
};

const cleanup = () => {
  journalStore.currentWritingContent = {};
  journalStore.currentJournal = null;
  useTiptapEditorStore().editors = [];
};

// Init TipTap editor slots
onMounted(() => {
  const count = activeSlideGroup.value?.slides?.length || 0;
  for (let i = 0; i < count; i++) {
    // @ts-ignore
    useTiptapEditorStore().editors.push({});
  }
});
</script>
