<template>
  <div v-if="pendingItems.length > 0" class="px-4 mb-6">
    <div class="rounded-xl border border-muted bg-elevated p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <ClipboardCheck class="w-4 h-4 text-muted" />
          <h3 class="text-sm font-semibold">{{ $t('home.homework.title') }}</h3>
        </div>
        <button
          class="text-xs text-dimmed hover:text-default transition-colors"
          @click="navigateTo('/toolkit')"
        >
          {{ $t('home.homework.viewAll') }}
        </button>
      </div>

      <!-- Pending items (max 3) -->
      <div class="space-y-2">
        <div
          v-for="item in displayItems"
          :key="item.id"
          class="flex items-center gap-3"
        >
          <button
            class="w-[18px] h-[18px] rounded border-[1.5px] border-accented shrink-0 transition-colors hover:border-muted active:border-green-500"
            @click="$emit('toggle', item.id)"
          />
          <span class="text-sm text-default flex-1 leading-snug">{{ item.content }}</span>
        </div>
      </div>

      <!-- More count -->
      <p v-if="pendingItems.length > 3" class="text-xs text-dimmed mt-2 pl-[30px]">
        {{ $t('home.homework.moreItems', { count: pendingItems.length - 3 }) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ClipboardCheck } from "lucide-vue-next";
import type { HomeworkItem } from "~/types/therapy_toolkit";

const props = defineProps<{
  pendingItems: HomeworkItem[];
}>();

defineEmits<{
  toggle: [id: string];
}>();

const displayItems = computed(() => props.pendingItems.slice(0, 3));
</script>
