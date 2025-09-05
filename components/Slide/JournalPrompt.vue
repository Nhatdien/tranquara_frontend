<template>
  <div>
    <div class="mb-4">
    <h2 class="text-left">{{ content?.question_content }}</h2>
    <blockquote class="text-neutral-300 text-sm">{{
      content?.question_description
    }}</blockquote>
    </div>
    <CommonMarkdownEditor
      @on-update="
        () =>
          userJournalStore().updateCurrentWritingContent(
            content?.question_content,
            currentNote
          )
      "
      v-model="currentNote" />
  </div>
</template>

<script lang="ts" setup>
const currentNote = ref("");

const onUpdate = (key: string, value: string) => {};
const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

watch(
  () => userJournalStore().currentWritingContent,
  () => {
    const htmlString = generateJournalHtml(userJournalStore().currentWritingContent)
    console.log(htmlString);
    console.log(parseJournalHtml(htmlString))
  },
  { deep: true }
);
</script>
