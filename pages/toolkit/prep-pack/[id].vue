<template>
  <section class="px-4 py-6 pb-20 lg:pb-0">
    <!-- Desktop Breadcrumbs -->
    <DesktopBreadcrumb :items="breadcrumbs" />

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="navigateTo('/toolkit/prep-pack')" class="text-muted hover:text-highlighted transition-colors lg:hidden">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold lg:text-2xl">{{ $t('toolkit.prepPack.title') }}</h1>
        <p v-if="prepPack" class="text-xs text-muted mt-0.5">
          {{ formatDateRange(prepPack.date_range_start, prepPack.date_range_end) }}
          · {{ $t('toolkit.prepPack.journalsAnalyzed', { count: prepPack.journal_count }) }}
        </p>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="!prepPack && !isLoading" class="text-center py-16">
      <p class="text-dimmed">{{ $t('toolkit.prepPack.notFound') }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoading" class="text-center py-16">
      <div class="w-8 h-8 border-2 border-toned border-t-highlighted rounded-full animate-spin mx-auto" />
    </div>

    <!-- Content -->
    <div v-else-if="prepPack" class="space-y-6">

      <!-- Top cards: 2-col grid on desktop -->
      <div class="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">

      <!-- Mood Overview -->
      <div v-if="prepPack.mood_overview" class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <BarChart3 class="w-4 h-4 text-muted" />
          {{ $t('toolkit.prepPack.moodOverview') }}
        </h2>

        <div class="grid grid-cols-3 gap-3 mb-3">
          <div class="text-center p-2 rounded-lg bg-muted">
            <p class="text-xs text-dimmed">{{ $t('toolkit.prepPack.moodAverage') }}</p>
            <p class="text-lg font-bold mt-0.5">{{ prepPack.mood_overview.average?.toFixed(1) }}</p>
          </div>
          <div class="text-center p-2 rounded-lg bg-muted">
            <p class="text-xs text-dimmed">{{ $t('toolkit.prepPack.moodTrend') }}</p>
            <p class="text-sm font-medium mt-1" :class="trendColor">
              {{ $t(`toolkit.prepPack.${prepPack.mood_overview.trend}`) }}
            </p>
          </div>
          <div class="text-center p-2 rounded-lg bg-muted">
            <p class="text-xs text-dimmed">{{ $t('toolkit.prepPack.moodHighest') }}</p>
            <p class="text-lg font-bold mt-0.5">{{ prepPack.mood_overview.highest?.score }}</p>
          </div>
        </div>

        <!-- Highest / Lowest entries -->
        <div class="space-y-2 text-xs">
          <div v-if="prepPack.mood_overview.highest" class="flex items-start gap-2 text-muted">
            <TrendingUp class="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
            <span>
              <strong class="text-green-400">{{ prepPack.mood_overview.highest.score }}</strong>
              — {{ prepPack.mood_overview.highest.title }}
              <span class="text-toned"> · {{ formatDate(prepPack.mood_overview.highest.date) }}</span>
            </span>
          </div>
          <div v-if="prepPack.mood_overview.lowest" class="flex items-start gap-2 text-muted">
            <TrendingDown class="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
            <span>
              <strong class="text-red-400">{{ prepPack.mood_overview.lowest.score }}</strong>
              — {{ prepPack.mood_overview.lowest.title }}
              <span class="text-toned"> · {{ formatDate(prepPack.mood_overview.lowest.date) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Key Themes -->
      <div v-if="prepPack.key_themes?.length" class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Hash class="w-4 h-4 text-muted" />
          {{ $t('toolkit.prepPack.keyThemes') }}
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(theme, i) in prepPack.key_themes"
            :key="i"
            class="px-3 py-1.5 rounded-full bg-accented border border-default text-xs text-default"
          >
            {{ theme }}
          </span>
        </div>
      </div>

      <!-- Emotional Highlights -->
      <div v-if="prepPack.emotional_highlights?.length" class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-muted" />
          {{ $t('toolkit.prepPack.emotionalHighlights') }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="(highlight, i) in prepPack.emotional_highlights"
            :key="i"
            class="p-3 rounded-lg bg-muted"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium">{{ highlight.title }}</span>
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-dimmed">{{ formatDate(highlight.date) }}</span>
                <span class="text-xs px-1.5 py-0.5 rounded bg-accented">{{ highlight.mood }}/10</span>
              </div>
            </div>
            <p class="text-xs text-muted italic mb-1">"{{ highlight.excerpt }}"</p>
            <p class="text-xs text-dimmed">{{ highlight.significance }}</p>
          </div>
        </div>
      </div>

      <!-- Patterns -->
      <div v-if="prepPack.patterns?.length" class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Repeat class="w-4 h-4 text-muted" />
          {{ $t('toolkit.prepPack.patterns') }}
        </h2>
        <div class="space-y-2">
          <div
            v-for="(pattern, i) in prepPack.patterns"
            :key="i"
            class="flex items-start gap-3 p-3 rounded-lg bg-muted"
          >
            <span
              class="w-2 h-2 rounded-full mt-1.5 shrink-0"
              :class="patternCategoryColor(pattern.category)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm">{{ pattern.pattern }}</p>
              <span class="text-xs text-dimmed capitalize">{{ pattern.category }}</span>
            </div>
          </div>
        </div>
      </div>

      </div><!-- End 2-col grid -->

      <!-- Discussion Points -->
      <div v-if="prepPack.discussion_points?.length" class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageCircle class="w-4 h-4 text-muted" />
          {{ $t('toolkit.prepPack.discussionPoints') }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="(point, i) in prepPack.discussion_points"
            :key="i"
            class="flex items-start gap-2 text-sm text-default"
          >
            <span class="text-toned mt-0.5 shrink-0">{{ i + 1 }}.</span>
            <span>{{ point }}</span>
          </li>
        </ul>
      </div>

      <!-- Growth Moments -->
      <div v-if="prepPack.growth_moments?.length" class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sprout class="w-4 h-4 text-green-400" />
          {{ $t('toolkit.prepPack.growthMoments') }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="(moment, i) in prepPack.growth_moments"
            :key="i"
            class="flex items-start gap-2 text-sm text-default"
          >
            <span class="text-green-500 mt-0.5 shrink-0">✦</span>
            <span>{{ moment }}</span>
          </li>
        </ul>
      </div>

      <!-- Personal Notes (editable in future) -->
      <div v-if="prepPack.personal_notes" class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-2 flex items-center gap-2">
          <FileText class="w-4 h-4 text-muted" />
          {{ $t('toolkit.prepPack.personalNotes') }}
        </h2>
        <p class="text-sm text-muted">{{ prepPack.personal_notes }}</p>
      </div>

      <!-- Preparation Journey Status -->
      <div class="p-4 rounded-xl border border-default bg-elevated">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <BookOpen class="w-4 h-4 text-muted" />
          {{ $t('toolkit.prepPack.preparation.title') }}
        </h2>
        <div class="space-y-2.5">
          <div
            v-for="step in preparationStatus"
            :key="step.collectionId"
            class="flex items-center gap-3"
          >
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              :class="step.isComplete
                ? 'bg-green-500/20 border border-green-500/50'
                : 'bg-accented border border-default'"
            >
              <Icon
                v-if="step.isComplete"
                name="i-lucide-check"
                class="w-3 h-3 text-green-400"
              />
            </div>
            <span
              class="text-sm flex-1"
              :class="step.isComplete ? 'text-default' : 'text-dimmed'"
            >
              {{ step.label }}
            </span>
            <span class="text-xs text-toned">
              {{ step.completed }}/{{ step.total }}
            </span>
          </div>
        </div>

        <!-- Overall progress -->
        <div class="mt-3 pt-3 border-t border-muted">
          <div class="flex items-center justify-between text-xs">
            <span class="text-dimmed">{{ $t('toolkit.prepPack.preparation.overall') }}</span>
            <span :class="overallJourneyProgress === 100 ? 'text-green-400 font-medium' : 'text-muted'">
              {{ overallJourneyProgress }}%
            </span>
          </div>
          <div class="w-full h-1.5 bg-accented rounded-full mt-1.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="overallJourneyProgress === 100 ? 'bg-green-500' : 'bg-dimmed'"
              :style="{ width: `${overallJourneyProgress}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'
import {
  ChevronLeft, BarChart3, Hash, Sparkles, Repeat,
  MessageCircle, Sprout, FileText, TrendingUp, TrendingDown, BookOpen
} from "lucide-vue-next";
import { useToolkitStore } from "~/stores/stores/therapy_toolkit_store";
import { useLearnedStore } from "~/stores/stores/user_learned";
import { userJournalStore } from "~/stores/stores/user_journal";
import { JOURNEY_STEPS } from "~/types/therapy_toolkit";
import type { PrepPack } from "~/types/therapy_toolkit";

const { t } = useI18n();
const route = useRoute();
const toolkitStore = useToolkitStore();
const learnedStore = useLearnedStore();
const journalStore = userJournalStore();

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.prepPack.title'), to: '/toolkit/prep-pack' },
  { label: t('common.details') },
])

const isLoading = ref(true);
const prepPack = ref<PrepPack | null>(null);

const trendColor = computed(() => {
  if (!prepPack.value?.mood_overview?.trend) return 'text-muted';
  switch (prepPack.value.mood_overview.trend) {
    case 'improving': return 'text-green-400';
    case 'declining': return 'text-red-400';
    default: return 'text-muted';
  }
});

const patternCategoryColor = (category: string): string => {
  switch (category) {
    case 'triggers': return 'bg-red-400';
    case 'patterns': return 'bg-blue-400';
    case 'coping': return 'bg-yellow-400';
    case 'relationships': return 'bg-purple-400';
    case 'growth': return 'bg-green-400';
    default: return 'bg-neutral-400';
  }
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
};

// ─── Preparation Journey Status ────────────────────────
const getSlideGroupCount = (collectionId: string): number => {
  const collection = journalStore.templates.find(t => t.id === collectionId);
  if (!collection) return 0;
  const groups = typeof collection.slide_groups === 'string'
    ? JSON.parse(collection.slide_groups)
    : collection.slide_groups;
  return groups?.length || 0;
};

const preparationStatus = computed(() =>
  JOURNEY_STEPS.map(step => ({
    collectionId: step.collectionId,
    label: t(step.labelKey),
    completed: learnedStore.getCompletedCount(step.collectionId),
    total: getSlideGroupCount(step.collectionId),
    isComplete: getSlideGroupCount(step.collectionId) > 0
      && learnedStore.getCompletedCount(step.collectionId) >= getSlideGroupCount(step.collectionId),
  }))
);

const overallJourneyProgress = computed(() => {
  let totalCompleted = 0;
  let totalGroups = 0;
  for (const step of preparationStatus.value) {
    totalCompleted += step.completed;
    totalGroups += step.total;
  }
  return totalGroups > 0 ? Math.round((totalCompleted / totalGroups) * 100) : 0;
});

onMounted(async () => {
  const id = route.params.id as string;
  const [pack] = await Promise.all([
    toolkitStore.loadPrepPack(id),
    learnedStore.loadFromLocal(),
    journalStore.getAllTemplates(),
  ]);
  prepPack.value = pack;
  isLoading.value = false;
});
</script>
