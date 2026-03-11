<template>
  <section class="px-4 py-6 pb-20">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold">{{ $t('toolkit.title') }}</h1>
      <p class="text-neutral-400 text-sm mt-1">{{ $t('toolkit.subtitle') }}</p>
    </div>

    <!-- Section 1: Preparation Journey -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase">
          {{ $t('toolkit.journey.title') }}
        </h2>
        <span v-if="overallProgress > 0" class="text-xs text-neutral-500">
          {{ $t('toolkit.journey.overallProgress', { percent: overallProgress }) }}
        </span>
      </div>

      <div class="flex flex-col gap-3">
        <ToolkitJourneyStepCard
          v-for="step in journeySteps"
          :key="step.collectionId"
          :step="step"
          :collection="getCollection(step.collectionId)"
          :completed-count="learnedStore.getCompletedCount(step.collectionId)"
          :total-count="getSlideGroupCount(step.collectionId)"
          @tap="navigateToCollection(step.collectionId)"
        />
      </div>
    </div>

    <!-- Section 2: Prep Pack (Phase 3 — placeholder) -->
    <div class="mb-8">
      <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.prepPack.title') }}
      </h2>
      <div class="p-5 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <p class="text-neutral-400 text-sm mb-3">{{ $t('toolkit.prepPack.description') }}</p>
        <UButton
          variant="soft"
          color="neutral"
          size="lg"
          class="w-full"
          :disabled="!hasJournals"
          @click="navigateTo('/toolkit/prep-pack')"
        >
          {{ $t('toolkit.prepPack.generate') }}
        </UButton>
        <p v-if="!hasJournals" class="text-xs text-neutral-500 mt-2 text-center">
          {{ $t('toolkit.prepPack.noJournals') }}
        </p>
      </div>
    </div>

    <!-- Section 3: Session Tracker (Phase 2 — placeholder) -->
    <div class="mb-8">
      <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.session.title') }}
      </h2>
      <div class="p-5 rounded-xl border border-neutral-700 bg-neutral-900/50 text-center">
        <p class="text-neutral-400 text-sm mb-3">{{ $t('toolkit.session.noSession') }}</p>
        <UButton
          variant="soft"
          color="neutral"
          @click="navigateTo('/toolkit/session/new')"
        >
          {{ $t('toolkit.session.schedule') }}
        </UButton>
      </div>
    </div>

    <!-- Section 4: Grounding Exercises -->
    <div class="mb-8">
      <h2 class="text-sm text-neutral-400 tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.grounding.title') }}
      </h2>
      <div
        class="flex items-center rounded-xl border border-neutral-700 bg-neutral-900/50 overflow-hidden cursor-pointer hover:bg-neutral-800/50 transition-colors"
        @click="navigateTo('/toolkit/grounding/breathing')"
      >
        <div class="w-20 h-16 flex items-center justify-center bg-neutral-800 shrink-0">
          <Wind class="w-8 h-8 text-neutral-300" />
        </div>
        <div class="flex-1 px-4 py-3">
          <p class="font-medium">{{ $t('toolkit.grounding.breathing.title') }}</p>
          <p class="text-xs text-neutral-400">{{ $t('toolkit.grounding.breathing.description') }}</p>
        </div>
        <Icon name="i-lucide-chevron-right" class="w-5 h-5 text-neutral-500 mr-4" />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { Wind } from "lucide-vue-next";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useLearnedStore } from "~/stores/stores/user_learned";
import { JOURNEY_STEPS, TOOLKIT_COLLECTION_IDS } from "~/types/therapy_toolkit";
import type { LocalTemplate } from "~/types/user_journal";

const journalStore = userJournalStore();
const learnedStore = useLearnedStore();

const journeySteps = JOURNEY_STEPS;

// Load templates + progress on mount
onMounted(async () => {
  await journalStore.getAllTemplates();
  await learnedStore.loadFromLocal();
});

// Get collection by ID
const getCollection = (collectionId: string): LocalTemplate | undefined => {
  return journalStore.templates.find(t => t.id === collectionId);
};

// Get slide group count for a collection
const getSlideGroupCount = (collectionId: string): number => {
  const collection = getCollection(collectionId);
  if (!collection) return 0;
  const groups = typeof collection.slide_groups === 'string'
    ? JSON.parse(collection.slide_groups)
    : collection.slide_groups;
  return groups?.length || 0;
};

// Overall journey progress
const overallProgress = computed(() => {
  let totalCompleted = 0;
  let totalGroups = 0;
  for (const step of JOURNEY_STEPS) {
    totalCompleted += learnedStore.getCompletedCount(step.collectionId);
    totalGroups += getSlideGroupCount(step.collectionId);
  }
  return totalGroups > 0 ? Math.round((totalCompleted / totalGroups) * 100) : 0;
});

// Check if user has any journals (for prep pack CTA)
const hasJournals = computed(() => journalStore.journals.length > 0);

// Navigate to collection — uses EXISTING slide viewer pages
const navigateToCollection = (collectionId: string) => {
  navigateTo(`/learn_and_prepare/collection/${collectionId}`);
};
</script>
