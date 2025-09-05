<template>
  <section class="">
    <UCarousel ref="carousel" dots v-slot="{ item }" :items="carouselItems">
      <h2 class="text-center mb-4">{{ item.questionContent }}</h2>
      <!-- <pre>{{ carouselItems[0] }}</pre> -->
      <CommonMarkdownEditor v-model="item.currentNote"></CommonMarkdownEditor>
    </UCarousel>

    <!-- Button group, will include:
     - a button to make forward (user can still slide backward)
     - a button to edit text format
     - a button to open the chatbox with the chatbot to help with the journaling process -->
    <div class="flex fixed justify-around w-[100vw] 0 bottom-1/10">
      <div>
        <UDropdownMenu
          :items="items"
          :ui="{
            group: 'flex gap-2',
          }">
          <UButton :variant="'soft'" class="rounded-full"
            ><ALargeSmall
          /></UButton>
        </UDropdownMenu>
        <UModal title="Preview">
          <UButton :variant="'soft'" class="rounded-full ml-2"
            ><Eye /> Preview</UButton
          >

          <template #body>
            <div v-html="currentPreviewContent"></div>
          </template>
        </UModal>
      </div>
      <div class="flex items-center gap-4">
        <UDrawer>
          <UButton :disabled="isEmptyJournal" class="font-semibold"
            >Go deeper</UButton
          >

          <template #content>
            <JournalChatScreen
              :currentPreviewContent
              :template-id="props.templateId"
              :mode="'new'" />
          </template>
        </UDrawer>
        <UButton :variant="'soft'" @click="nextNode"><ChevronRight /></UButton>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { ChevronRight, ALargeSmall, Eye } from "lucide-vue-next";
import type { DropdownMenuItem } from "@nuxt/ui";
import { CreateJournalRequest, Journal } from "~/types/user_journal";

const carousel = useTemplateRef("carousel");
const isOpen = defineModel({ type: Boolean });
const emits = defineEmits(["saveJournal", "closeModal"]);
const props = defineProps({
  templateId: {
    type: String,
    required: true,
  },
});

const currentTemplate = computed(() =>
  userJournalStore().templates.find(
    (template) => props.templateId === template.id
  )
);

const currentPreviewContent = computed(() => {
  // The preview show the template content or the current journal parsed
  return generateJournalHtml(
    [...(currentTemplate.value?.content || [...carouselItems.value.map((item) => item.questionContent)] || [])],
    [...carouselItems.value.map((item) => item.currentNote)]
  );
});

const carouselItems = ref(
  currentTemplate.value?.content.map((question) => {
    return {
      questionContent: question,
      currentNote: "",
    };
  }) || []
);

const isEmptyJournal = computed(() =>
  carouselItems.value.every(
    (item) => item.currentNote === "" || item.currentNote === "<p></p>"
  )
);

const nextNode = () => {
  if (!carousel.value?.emblaApi?.canScrollNext()) {
    const createJournalPayload: CreateJournalRequest = {
      title: "Journal",
      content: currentPreviewContent.value,
      mood: "Neutral",
      template_id: props.templateId,
    };

    //The journal will be created if the journal is not empty or
    // user have interact with the chatbot in that journal session
    if (
      !isEmptyJournal.value &&
      isEmptyObject(userJournalStore().currentJournal)
    ) {
      emits("saveJournal", createJournalPayload, props.templateId);
    }

    //update the journal content to the latest content when user finish journaling
    if (!isEmptyObject(userJournalStore().currentJournal)) {
      userJournalStore().updateJournal({
        ...userJournalStore().currentJournal,
        content: currentPreviewContent.value,
      });
    }
    emits("closeModal");
  } else {
    carousel.value?.emblaApi?.scrollNext();
  }

  //Reset the current journal

  userJournalStore().currentJournal = {} as Journal;
  useChatlogtore().messages = [];
};

const items = [
  {
    // label: 'Profile',
    icon: "i-lucide-user",
  },
  {
    // label: 'Billing',
    icon: "i-lucide-credit-card",
  },
  {
    // label: 'Settings',
    icon: "i-lucide-cog",
  },
] satisfies DropdownMenuItem[];

onMounted(() => {
  if (userJournalStore().currentJournal.id) {
    carouselItems.value = parseJournalHtml(userJournalStore().currentJournal.content)
    useChatlogtore().getChatlogs(userJournalStore().currentJournal.id)
  }

  console.log(useChatlogtore().messages)
});
</script>
