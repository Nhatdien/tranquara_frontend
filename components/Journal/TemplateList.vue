<template>
  <section>
    <div class="mt-8" v-for="(templates, category) in tempalteByCategory">
      <h2>{{ category }}</h2>
      <div class="flex flex-col gap-4 items-center mt-4 overflow-x-scroll">
        <JournalTemplateCard
          class="flex-1/3 w-full"
          v-for="template in templates"
          :template />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
const journalStore = userJournalStore();

const tempalteByCategory = computed(
  () => journalStore.templateGroupedByCategory
);
</script>
