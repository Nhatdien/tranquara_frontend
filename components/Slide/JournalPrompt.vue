<template>
  <div>
    <div class="mb-4">
      <h2 class="text-left">{{ content?.question_content }}</h2>
      <blockquote class="text-neutral-300 text-sm">
        {{ content?.question_description }}
      </blockquote>
    </div>
    {{ currentNote }}
    <CommonMarkdownEditor
      ref="editor"
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

const editor = ref()
const onUpdate = (key: string, value: string) => {};
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
});

onMounted(() => {
  useTiptapEditorStore().editors[props.index] = editor.value?.editor
}),

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
