<template>
  <div class="flex items-center justify-center">
    <div class="text-center">
      <h2>{{ content?.title || content?.headline }}</h2>
      <p class="text-sm text-muted">{{ content?.content || content?.subtext }}</p>
      <JournalTemplateCardV2
        :slide_group="findSlideGroup(content?.config?.collection_id || content?.collection_id, content?.config?.slide_group_id || content?.slide_group_id)"
        @click="
          openSlideGroup(content?.config?.slide_group_id || content?.slide_group_id, content?.config?.collection_id || content?.collection_id)
        " />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { JournalModalContents, JournalTemplateCardV2 } from "#components";
import { testCollection } from "~/mock/testCollection";

const { openSlideGroup, activeSlideGroup, findSlideGroup } = useSlideGroup();

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});
</script>
