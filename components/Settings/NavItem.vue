<template>
  <button
    class="w-full flex items-center justify-between py-4 first:pt-0 last:pb-0 text-left"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
        <component :is="icon" class="w-5 h-5 text-muted" />
      </div>
      <div>
        <p class="text-sm font-medium text-default">{{ label }}</p>
        <p v-if="subtitle" class="text-xs text-muted">{{ subtitle }}</p>
      </div>
    </div>
    <ChevronRight class="w-5 h-5 text-muted flex-shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import type { Component } from 'vue';

defineProps<{
  icon: Component;
  label: string;
  subtitle?: string;
}>();

defineEmits<{
  click: [];
}>();
</script>
