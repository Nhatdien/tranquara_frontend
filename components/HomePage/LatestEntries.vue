<template>
  <section class="h-full">
    <h1>Latest entries</h1>

    <div class="grid grid-cols-1 gap-4 mt-4">
      <UCard @click="() => openModal(journal)" v-for="journal in userJournalStore().journals" class="flex-1" variant="soft">
        <template #header>
          <h2>{{ journal.title }}</h2>
        </template>

        <div class="mt-auto" v-html="journal.content"></div>
      </UCard>
    </div>
    <UModal
      :title="userJournalStore().currentJournal.title"
      v-model:open="isOpen"
      v-on:after:leave="closeModal"
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

<script setup lang="ts">
import { CreateJournalRequest, Journal } from '~/types/user_journal';

const isOpen = ref(false);
const activeTemplate = ref<any | null>(null);

const openModal = (journal: Journal) => {
  
  userJournalStore().currentJournal = journal
  isOpen.value = true;
};

const closeModal = () => {
  console.log("called")
  userJournalStore().currentJournal = {} as Journal
  useChatlogtore().$reset
  isOpen.value = false;
};

const saveJournal = (journal: CreateJournalRequest, templateId?: string) => {
  if (templateId) {
    console.log("journal saved with template", templateId);
  } else {
    console.log("journal saved without any template");
  }
  userJournalStore().createJournal({
    ...journal,
  });
};

onMounted(async () => {
  await waitForToken();
  userJournalStore().getJournals();
});
</script>
