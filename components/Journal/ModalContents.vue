<template>
  <section class="">
    <UCarousel
      :watch-drag="true"
      ref="carousel"
      dots
      v-slot="{ item }"
      :items="carouselItems"
      :ui="{
        viewport: 'h-full',
      }">
      <div class="h-[40vh] max-h-[400px]">
        <component
          :is="componentMapping[item?.content?.type]"
          :content="item?.content"></component>
      </div>
      <!-- <CommonMarkdownEditor v-model="item.currentNote"></CommonMarkdownEditor> -->
    </UCarousel>

    <!-- Button group, will include:
       - a button to make forward (user can still slide backward)
       - a button to edit text format
       - a button to open the chatbox with the chatbot to help with the journaling process -->
    <div class="flex fixed justify-around w-[100vw] bottom-1/10">
      <div></div>
      <div class="flex items-center gap-4">
        <UButton :variant="'soft'" @click="nextNode"><ChevronRight /></UButton>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { ChevronRight, ALargeSmall, Eye } from "lucide-vue-next";
import type { DropdownMenuItem } from "@nuxt/ui";
import Document from "@/components/Slide/Document.vue";
import CTA from "@/components/Slide/CTA.vue";
import FurtherReading from "@/components/Slide/FutherReading.vue";
import JournalPrompt from "@/components/Slide/JournalPrompt.vue";
import SleepCheck from "~/components/Slide/SleepCheck.vue";

const carousel = useTemplateRef("carousel");
const isOpen = defineModel({ type: Boolean });
const emits = defineEmits(["saveJournal", "closeModal"]);

const { activeSlideGroup } = useSlideGroup();

const componentMapping = {
  doc: Document,
  journal_prompt: JournalPrompt,
  further_reading: FurtherReading,
  cta: CTA,
  sleep_check: SleepCheck,
};

const carouselItems = ref(
  activeSlideGroup?.value?.content?.map((slide: any) => {
    return {
      content: slide as any,
      currentNote: "",
    };
  }) || []
);

const nextNode = () => {
  if (!carousel.value?.emblaApi?.canScrollNext()) {
    //The journal will be created if the journal is not empty or
    // user have interact with the chatbot in that journal session
    //   if (
    //     !isEmptyJournal.value &&
    //     isEmptyObject(userJournalStore().currentJournal)
    //   ) {
    //     emits("saveJournal", props.templateId);
    //   }

    //update the journal content to the latest content when user finish journaling
    if (!isEmptyObject(userJournalStore().currentJournal)) {
    }
    emits("closeModal");
  } else {
    carousel.value?.emblaApi?.scrollNext();
  }

  //Reset the current journal

  userJournalStore().currentJournal = {} as Journal;
  useChatlogtore().messages = [];
};

onMounted(() => {});
</script>
