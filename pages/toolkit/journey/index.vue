<template>
  <section class="px-4 py-6 pb-20 lg:pb-0">
    <!-- Desktop Breadcrumbs -->
    <DesktopBreadcrumb :items="breadcrumbs" />

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="navigateTo('/toolkit')" class="text-muted hover:text-highlighted transition-colors lg:hidden">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-xl font-bold lg:text-2xl">{{ $t('toolkit.journey.title') }}</h1>
        <p class="text-muted text-xs mt-0.5">{{ $t('toolkit.journey.description') }}</p>
      </div>
    </div>

    <!-- Overall progress -->
    <div v-if="overallProgress > 0" class="mb-4 text-xs text-dimmed">
      {{ $t('toolkit.journey.overallProgress', { percent: overallProgress }) }}
    </div>

    <!-- Journey steps -->
    <div class="flex flex-col gap-3">
      <ToolkitJourneyStepCard
        v-for="step in journeySteps"
        :key="step.collectionId"
        :step="step"
        :collection="getCollection(step.collectionId)"
        :completed-count="learnedStore.getCompletedCount(step.collectionId)"
        :total-count="getSlideGroupCount(step.collectionId)"
        @tap="navigateTo(`/toolkit/journey/${step.collectionId}`)"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'
import { ChevronLeft } from "lucide-vue-next";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useLearnedStore } from "~/stores/stores/user_learned";
import { JOURNEY_STEPS } from "~/types/therapy_toolkit";
import type { LocalTemplate } from "~/types/user_journal";

definePageMeta({ layout: "default" });

const { t } = useI18n();
const journalStore = userJournalStore();
const learnedStore = useLearnedStore();
const journeySteps = JOURNEY_STEPS;

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.journey.title') },
])

onMounted(async () => {
  await journalStore.getAllTemplates();
  await learnedStore.loadFromLocal();
});

const getCollection = (collectionId: string): LocalTemplate | undefined => {
  return journalStore.templates.find(t => t.id === collectionId);
};

const getSlideGroupCount = (collectionId: string): number => {
  const collection = getCollection(collectionId);
  if (!collection) return 0;
  const groups = typeof collection.slide_groups === 'string'
    ? JSON.parse(collection.slide_groups)
    : collection.slide_groups;
  return groups?.length || 0;
};

const overallProgress = computed(() => {
  let totalCompleted = 0;
  let totalGroups = 0;
  for (const step of JOURNEY_STEPS) {
    totalCompleted += learnedStore.getCompletedCount(step.collectionId);
    totalGroups += getSlideGroupCount(step.collectionId);
  }
  return totalGroups > 0 ? Math.round((totalCompleted / totalGroups) * 100) : 0;
});
</script>
