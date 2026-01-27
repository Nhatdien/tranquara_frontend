<template>
  <section class="">
    <div class="h-32 rounded-2xl border border-neutral-400">
    </div>
    <p class="text-center mt-2">{{ template.title }}</p>
    {{ template.id }}
  </section>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { JournalTemplate } from "~/types/user_journal";

const props = defineProps({
  template: {
    type: Object as PropType<JournalTemplate>,
    required: true,
  },
});

const startJournaling = () => {
    navigateTo({
        path: "journal/guider-chat",
        query: {
            templateId: props.template.id
        }
    })
}
</script>
