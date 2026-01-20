<template>
  <section>
    <div
      class="mt-8"
      v-for="(templates, category) in templatesByCategory"
      :key="category">
      <h2>{{ category }}</h2>
      <div class="flex flex-col gap-4 items-center mt-4 overflow-x-scroll">
        <JournalTemplateCard
          v-for="template in templates"
          :key="template.id"
          class="flex-1/3 w-full cursor-pointer"
          :template="template"
          @click="openModal(template)" />
      </div>
    </div>

    <!-- Single shared modal -->
    <UModal
      v-show="activeTemplate"
      v-model:open="isOpen"
      :title="activeTemplate?.title"
      description="'test'"
      fullscreen>
      <template #body>
        <JournalJournalingModalContent
          v-model="isOpen"
          :template-id="activeTemplate?.id"
          @saveJournal="saveJournal"
          @closeModal="closeModal" />
      </template>
    </UModal>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { CreateJournalRequest } from "~/types/user_journal";
const journalStore = userJournalStore();

const isOpen = ref(false);
const activeTemplate = ref<any | null>(null);

const templatesByCategory = computed(() => {
  const templates = journalStore.templates;
  const groups: Record<string, typeof templates> = {};
  
  templates.forEach((t: any) => {
    const cat = t.category || 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(t);
  });
  
  return groups;
});


const openModal = (template: any) => {
  activeTemplate.value = template;
  isOpen.value = true;
};

const closeModal = (template: any) => {
  activeTemplate.value = null;
  isOpen.value = false;
};

const saveJournal = (journal: CreateJournalRequest, templateId?: string, ) => {
  if (templateId) {
    console.log("journal saved with template", templateId);
  } else {
    console.log("journal saved without any template");
  }
  userJournalStore().createJournal({
    ...journal,
  });
};

// const tempalteByCategory = computed(
//   () => journalStore.templateGroupedByCategory
// );
</script>
