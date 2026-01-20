<template>
  <section class="p-4">
    <div class="flex justify-between w-full">
      <ChevronLeft @click="prevNode" />
      <X @click="closeSlideGroup"/>
    </div>
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
      }">
      <div class="h-[40vh] max-h-[400px]">
        <component
          :is="renderSlide(item?.content?.type)"
          :currentIndex
          :index="carouselItems.indexOf(item)"
          :content="item?.content"></component>
      </div>
      <!-- <CommonMarkdownEditor v-model="item.currentNote"></CommonMarkdownEditor> -->
    </UCarousel>

    <!-- Button group, will include:
       - a button to make forward (user can still slide backward)
       - a button to edit text format
       - a button to open the chatbox with the chatbot to help with the journaling process -->
    <div class="flex fixed justify-between w-full bottom-8 right-4">
      <div></div>
      <div class="flex items-center">
        <UButton :variant="'soft'" @click="nextNode"><ChevronRight /></UButton>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { ChevronRight, ChevronLeft, X } from "lucide-vue-next";
import type { DropdownMenuItem } from "@nuxt/ui";
import Document from "@/components/Slide/Document.vue";
import CTA from "@/components/Slide/CTA.vue";
import FurtherReading from "@/components/Slide/FutherReading.vue";
import JournalPrompt from "@/components/Slide/JournalPrompt.vue";
import SleepCheck from "~/components/Slide/SleepCheck.vue";
import MoodSlide from "~/components/Slide/MoodSlide.vue";
import Index from "~/pages/index.vue";
import { Editor } from "@tiptap/vue-3";

const props = defineProps(['templateId']);
const carousel = useTemplateRef("carousel");
const emits = defineEmits(["saveJournal", "closeModal"]);
const currentIndex = ref(0);

// Use the prop instead of route params
const { activeSlideGroup, saveJournal, closeSlideGroup } = useSlideGroup({ 
  collectionId: props.templateId 
});


const componentMapping: any = {
  doc: Document,
  journal_prompt: JournalPrompt,
  further_reading: FurtherReading,
  cta: CTA,
  sleep_check: SleepCheck,
  mood_check: MoodSlide,
  emotion_log: MoodSlide, // Map standard type to component
}

const renderSlide = (type: string) => {
  return componentMapping[type] || componentMapping.journal_prompt;
}


const carouselItems = ref(
  // Support both 'slides' (new type) and 'content' (legacy/mock)
  (activeSlideGroup?.value?.slides || (activeSlideGroup?.value as any)?.content || [])?.map((slide: any) => {
    return {
      content: slide as any,
      currentNote: "",
    };
  }) || []
);

const nextNode = () => {
  if (!carousel.value?.emblaApi?.canScrollNext()) {
    // The journal will be created if the journal is not empty or
    // user have interact with the chatbot in that journal session
    if (
      !isEmptyJournal(userJournalStore().currentWritingContent as any) &&
      !userJournalStore().currentJournal
    ) {
      saveJournal({
        collection_id: props.templateId || "",
        content: generateJournalHtml(userJournalStore().currentWritingContent),
        mood_score: userJournalStore().currentMoodScore,
        mood_label: userJournalStore().currentMoodLabel,
        title: activeSlideGroup.value?.title || "",
      });
    }
    closeSlideGroup();
  } else {
    carousel.value?.emblaApi?.scrollNext();
  }

  //Reset the current journal
};

const prevNode = () => {
  if (!carousel.value?.emblaApi?.canScrollPrev()) {
    // The journal will be created if the journal is not empty or
    // user have interact with the chatbot in that journal session
    closeSlideGroup();
  } else {
    carousel.value?.emblaApi?.scrollPrev();
  }

  //Reset the current journal
};

onMounted(() => {
  // Init empty objects for editor store if needed (TipTap Store logic seems to require this)
  carouselItems.value.forEach((_item) => {
    // This usage of editors.push({}) seems to cause type errors, 
    // suppressing for now if it works at runtime or use proper type
    // @ts-ignore
    useTiptapEditorStore().editors.push({});
  });
});
</script>
