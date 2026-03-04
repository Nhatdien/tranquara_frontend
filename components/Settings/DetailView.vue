<template>
  <!--
    Desktop (>= 768px): Render a USlideover (right-side drawer).
    Mobile (< 768px): Render nothing — mobile uses dedicated subpages.
  -->
  <USlideover
    v-if="isDesktop"
    v-model:open="model"
    :title="title"
    side="right"
  >
    <!-- Hidden trigger (opened programmatically via v-model) -->
    <span class="hidden" />

    <template #body>
      <div class="pb-6">
        <slot />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';

defineProps<{
  title: string;
}>();

const model = defineModel<boolean>('open', { default: false });

const { width } = useWindowSize();
const isDesktop = computed(() => width.value >= 768);
</script>
