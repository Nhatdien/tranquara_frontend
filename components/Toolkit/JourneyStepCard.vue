<template>
  <div
    class="flex items-center gap-4 p-4 rounded-xl border border-default bg-elevated cursor-pointer hover:bg-muted hover:shadow-sm transition-all"
    @click="$emit('tap')"
  >
    <!-- Step number + icon -->
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      :class="isComplete ? 'bg-green-500/20 text-green-400' : 'bg-accented text-muted'"
    >
      <CheckCircle v-if="isComplete" class="w-6 h-6" />
      <component v-else :is="stepIcon" class="w-6 h-6" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-xs text-dimmed font-medium">{{ step.step }}</span>
        <h3 class="font-medium truncate">{{ $t(step.labelKey) }}</h3>
      </div>
      <p class="text-xs text-muted mt-0.5">
        {{ $t('toolkit.journey.chaptersProgress', { completed: completedCount, total: totalCount }) }}
      </p>

      <!-- Progress bar -->
      <UProgress
        v-if="totalCount > 0"
        :model-value="progressPercent"
        size="xs"
        :color="isComplete ? 'success' : 'neutral'"
        class="mt-2"
      />
    </div>

    <!-- Arrow -->
    <Icon name="i-lucide-chevron-right" class="w-5 h-5 text-dimmed shrink-0" />
  </div>
</template>

<script lang="ts" setup>
import { BookOpen, History, Heart, ClipboardCheck, CheckCircle } from "lucide-vue-next";
import type { JourneyStep } from "~/types/therapy_toolkit";

const props = defineProps<{
  step: JourneyStep;
  collection: any;
  completedCount: number;
  totalCount: number;
}>();

defineEmits<{
  (e: 'tap'): void;
}>();

const iconMap: Record<string, any> = {
  'book-open': BookOpen,
  'history': History,
  'heart': Heart,
  'clipboard-check': ClipboardCheck,
};

const stepIcon = computed(() => iconMap[props.step.icon] || BookOpen);
const progressPercent = computed(() =>
  props.totalCount > 0 ? Math.round((props.completedCount / props.totalCount) * 100) : 0
);
const isComplete = computed(() => props.totalCount > 0 && props.completedCount >= props.totalCount);
</script>
