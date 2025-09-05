<template>
    <section class="">
      <div class="h-32 rounded-2xl border border-neutral-400">
      </div>
      <p class="text-center mt-2">{{ slide_group?.title }}</p>
    </section>
  </template>
  
  <script lang="ts" setup>
  import { PropType } from "vue";
  
  const props = defineProps({
    slide_group: {
      type: Object as PropType<any>,
      required: true,
    },
  });
</script>
  