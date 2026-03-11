<template>
  <section class="px-4 py-6 pb-20">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="navigateTo('/toolkit/prep-pack')" class="text-neutral-400 hover:text-white transition-colors">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold">{{ $t('toolkit.prepPack.title') }}</h1>
        <p v-if="prepPack" class="text-xs text-neutral-400 mt-0.5">
          {{ formatDateRange(prepPack.date_range_start, prepPack.date_range_end) }}
          · {{ $t('toolkit.prepPack.journalsAnalyzed', { count: prepPack.journal_count }) }}
        </p>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="!prepPack && !isLoading" class="text-center py-16">
      <p class="text-neutral-500">{{ $t('toolkit.prepPack.notFound') }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoading" class="text-center py-16">
      <div class="w-8 h-8 border-2 border-neutral-600 border-t-white rounded-full animate-spin mx-auto" />
    </div>

    <!-- Content -->
    <div v-else-if="prepPack" class="space-y-6">

      <!-- Mood Overview -->
      <div v-if="prepPack.mood_overview" class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <BarChart3 class="w-4 h-4 text-neutral-400" />
          {{ $t('toolkit.prepPack.moodOverview') }}
        </h2>

        <div class="grid grid-cols-3 gap-3 mb-3">
          <div class="text-center p-2 rounded-lg bg-neutral-800/50">
            <p class="text-xs text-neutral-500">{{ $t('toolkit.prepPack.moodAverage') }}</p>
            <p class="text-lg font-bold mt-0.5">{{ prepPack.mood_overview.average?.toFixed(1) }}</p>
          </div>
          <div class="text-center p-2 rounded-lg bg-neutral-800/50">
            <p class="text-xs text-neutral-500">{{ $t('toolkit.prepPack.moodTrend') }}</p>
            <p class="text-sm font-medium mt-1" :class="trendColor">
              {{ $t(`toolkit.prepPack.${prepPack.mood_overview.trend}`) }}
            </p>
          </div>
          <div class="text-center p-2 rounded-lg bg-neutral-800/50">
            <p class="text-xs text-neutral-500">{{ $t('toolkit.prepPack.moodHighest') }}</p>
            <p class="text-lg font-bold mt-0.5">{{ prepPack.mood_overview.highest?.score }}</p>
          </div>
        </div>

        <!-- Highest / Lowest entries -->
        <div class="space-y-2 text-xs">
          <div v-if="prepPack.mood_overview.highest" class="flex items-start gap-2 text-neutral-400">
            <TrendingUp class="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
            <span>
              <strong class="text-green-400">{{ prepPack.mood_overview.highest.score }}</strong>
              — {{ prepPack.mood_overview.highest.title }}
              <span class="text-neutral-600"> · {{ formatDate(prepPack.mood_overview.highest.date) }}</span>
            </span>
          </div>
          <div v-if="prepPack.mood_overview.lowest" class="flex items-start gap-2 text-neutral-400">
            <TrendingDown class="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
            <span>
              <strong class="text-red-400">{{ prepPack.mood_overview.lowest.score }}</strong>
              — {{ prepPack.mood_overview.lowest.title }}
              <span class="text-neutral-600"> · {{ formatDate(prepPack.mood_overview.lowest.date) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Key Themes -->
      <div v-if="prepPack.key_themes?.length" class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Hash class="w-4 h-4 text-neutral-400" />
          {{ $t('toolkit.prepPack.keyThemes') }}
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(theme, i) in prepPack.key_themes"
            :key="i"
            class="px-3 py-1.5 rounded-full bg-neutral-800 border border-neutral-700 text-xs text-neutral-300"
          >
            {{ theme }}
          </span>
        </div>
      </div>

      <!-- Emotional Highlights -->
      <div v-if="prepPack.emotional_highlights?.length" class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-neutral-400" />
          {{ $t('toolkit.prepPack.emotionalHighlights') }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="(highlight, i) in prepPack.emotional_highlights"
            :key="i"
            class="p-3 rounded-lg bg-neutral-800/50"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium">{{ highlight.title }}</span>
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-neutral-500">{{ formatDate(highlight.date) }}</span>
                <span class="text-xs px-1.5 py-0.5 rounded bg-neutral-700">{{ highlight.mood }}/10</span>
              </div>
            </div>
            <p class="text-xs text-neutral-400 italic mb-1">"{{ highlight.excerpt }}"</p>
            <p class="text-xs text-neutral-500">{{ highlight.significance }}</p>
          </div>
        </div>
      </div>

      <!-- Patterns -->
      <div v-if="prepPack.patterns?.length" class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Repeat class="w-4 h-4 text-neutral-400" />
          {{ $t('toolkit.prepPack.patterns') }}
        </h2>
        <div class="space-y-2">
          <div
            v-for="(pattern, i) in prepPack.patterns"
            :key="i"
            class="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50"
          >
            <span
              class="w-2 h-2 rounded-full mt-1.5 shrink-0"
              :class="patternCategoryColor(pattern.category)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm">{{ pattern.pattern }}</p>
              <span class="text-xs text-neutral-500 capitalize">{{ pattern.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Discussion Points -->
      <div v-if="prepPack.discussion_points?.length" class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageCircle class="w-4 h-4 text-neutral-400" />
          {{ $t('toolkit.prepPack.discussionPoints') }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="(point, i) in prepPack.discussion_points"
            :key="i"
            class="flex items-start gap-2 text-sm text-neutral-300"
          >
            <span class="text-neutral-600 mt-0.5 shrink-0">{{ i + 1 }}.</span>
            <span>{{ point }}</span>
          </li>
        </ul>
      </div>

      <!-- Growth Moments -->
      <div v-if="prepPack.growth_moments?.length" class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <h2 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sprout class="w-4 h-4 text-green-400" />
          {{ $t('toolkit.prepPack.growthMoments') }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="(moment, i) in prepPack.growth_moments"
            :key="i"
            class="flex items-start gap-2 text-sm text-neutral-300"
          >
            <span class="text-green-500 mt-0.5 shrink-0">✦</span>
            <span>{{ moment }}</span>
          </li>
        </ul>
      </div>

      <!-- Personal Notes (editable in future) -->
      <div v-if="prepPack.personal_notes" class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50">
        <h2 class="text-sm font-semibold mb-2 flex items-center gap-2">
          <FileText class="w-4 h-4 text-neutral-400" />
          {{ $t('toolkit.prepPack.personalNotes') }}
        </h2>
        <p class="text-sm text-neutral-400">{{ prepPack.personal_notes }}</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {
  ChevronLeft, BarChart3, Hash, Sparkles, Repeat,
  MessageCircle, Sprout, FileText, TrendingUp, TrendingDown
} from "lucide-vue-next";
import { useToolkitStore } from "~/stores/stores/therapy_toolkit_store";
import type { PrepPack } from "~/types/therapy_toolkit";

const route = useRoute();
const toolkitStore = useToolkitStore();

const isLoading = ref(true);
const prepPack = ref<PrepPack | null>(null);

const trendColor = computed(() => {
  if (!prepPack.value?.mood_overview?.trend) return 'text-neutral-400';
  switch (prepPack.value.mood_overview.trend) {
    case 'improving': return 'text-green-400';
    case 'declining': return 'text-red-400';
    default: return 'text-neutral-400';
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

onMounted(async () => {
  const id = route.params.id as string;
  const pack = await toolkitStore.loadPrepPack(id);
  prepPack.value = pack;
  isLoading.value = false;
});
</script>
