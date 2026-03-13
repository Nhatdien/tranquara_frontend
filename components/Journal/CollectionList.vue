<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex flex-col min-h-[125px] rounded-md border border-default p-4 text-sm"
      v-for="collection in collections"
      @click="navigateTo(`/learn_and_prepare/collection/${collection.id}`)">
      <p>{{ collection.title }}</p>
      <p class="text-dimmed">{{ collection.description }}</p>
      <p class="self-end mt-auto">
        {{ collection.slide_groups.length }} lessons
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";

const props = defineProps({
  collections: {
    type: Object as PropType<any>,
    required: true,
  },
});
</script>
