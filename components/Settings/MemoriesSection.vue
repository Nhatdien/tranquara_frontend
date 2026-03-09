<template>
  <div class="space-y-4">
    <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">{{ $t('settings.memories.heading') }}</h2>

    <p class="text-xs text-muted px-1">
      {{ $t('settings.memories.description') }}
    </p>

    <!-- Loading skeleton -->
    <div v-if="memoriesStore.loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-12 bg-muted/30 rounded-lg animate-pulse" />
    </div>

    <!-- Empty state -->
    <UCard v-else-if="!memoriesStore.hasMemories" class="text-center">
      <div class="py-6 space-y-2">
        <Brain class="w-10 h-10 text-muted mx-auto" />
        <p class="text-sm text-muted">{{ $t('settings.memories.noMemories') }}</p>
        <p class="text-xs text-dimmed">
          {{ $t('settings.memories.noMemoriesDesc') }}
        </p>
      </div>
    </UCard>

    <!-- Memories list grouped by category -->
    <template v-else>
      <div
        v-for="category in memoriesStore.categories"
        :key="category"
        class="space-y-2"
      >
        <div class="flex items-center gap-2 px-1">
          <component :is="categoryIcon(category)" class="w-3.5 h-3.5 text-muted" />
          <span class="text-xs font-medium text-muted uppercase tracking-wider">
            {{ categoryLabel(category) }}
          </span>
        </div>

        <UCard>
          <div class="divide-y divide-default">
            <div
              v-for="memory in memoriesStore.memoriesByCategory[category]"
              :key="memory.id"
              class="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
            >
              <p class="text-sm text-default flex-1">{{ memory.content }}</p>
              <UButton
                icon="i-lucide-trash-2"
                color="neutral"
                variant="ghost"
                size="xs"
                :loading="deletingId === memory.id"
                @click="handleDelete(memory.id)"
              />
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  Brain,
  Heart,
  Repeat,
  Users,
  Target,
  Cloud,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-vue-next";
import type { Component } from "vue";
import { useMemoriesStore } from "~/stores/stores/memories_store";

const memoriesStore = useMemoriesStore();
const toast = useToast();
const { t } = useI18n();
const deletingId = ref<string | null>(null);

// Fetch memories on mount
onMounted(() => {
  memoriesStore.fetchMemories();
});

// ─── Category Display Helpers ───────────────────────────────────────────────

const categoryIcons: Record<string, Component> = {
  values: Heart,
  habits: Repeat,
  relationships: Users,
  goals: Target,
  struggles: Cloud,
  preferences: Star,
  patterns: Sparkles,
  growth: TrendingUp,
};

const categoryLabels: Record<string, string> = {
  values: "values",
  habits: "habits",
  relationships: "relationships",
  goals: "goals",
  struggles: "struggles",
  preferences: "preferences",
  patterns: "patterns",
  growth: "growth",
};

const categoryIcon = (category: string): Component => {
  return categoryIcons[category] || Brain;
};

const categoryLabel = (category: string): string => {
  const key = categoryLabels[category] || category;
  return t(`settings.memories.categories.${key}`);
};

// ─── Delete Handler ─────────────────────────────────────────────────────────

const handleDelete = async (memoryId: string) => {
  deletingId.value = memoryId;
  try {
    await memoriesStore.deleteMemory(memoryId);
    toast.add({
      title: t('settings.memories.memoryRemoved'),
      icon: "i-lucide-check",
      color: "success",
    });
  } catch {
    toast.add({
      title: t('settings.memories.memoryRemoveFailed'),
      icon: "i-lucide-alert-triangle",
      color: "error",
    });
  } finally {
    deletingId.value = null;
  }
};
</script>
