<template>
  <div class="min-h-screen bg-default pb-20 lg:pb-0">
    <!-- Header -->
    <UContainer class="sticky top-0 z-10 bg-default border-b">
      <div class="flex items-center justify-between py-4">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          @click="$router.back()"
        />
        <h1 class="text-xl font-semibold text-highlighted">{{ $t('progress.title') }}</h1>
        <div class="w-10"></div>
      </div>
    </UContainer>

    <UContainer class="py-6 space-y-6">
      <!-- Summary Cards Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <UCard class="text-center">
          <div>
            <p class="text-3xl font-bold text-highlighted">{{ totalCompletedDays }}</p>
            <p class="text-xs text-muted mt-1">{{ $t('progress.totalCompletedDays') }}</p>
          </div>
        </UCard>

        <UCard class="text-center">
          <div>
            <p class="text-3xl font-bold text-highlighted">{{ totalWordsWritten }}</p>
            <p class="text-xs text-muted mt-1">{{ $t('progress.wordsWritten') }}</p>
          </div>
        </UCard>

        <UCard class="text-center">
          <div>
            <p class="text-3xl font-bold text-highlighted">{{ averageMoodLabel }}</p>
            <p class="text-xs text-muted mt-1">{{ $t('progress.avgMood') }}</p>
          </div>
        </UCard>

        <UCard class="text-center">
          <div>
            <p class="text-3xl font-bold text-highlighted">{{ streakStore.totalEntries }}</p>
            <p class="text-xs text-muted mt-1">{{ $t('progress.journalEntries') }}</p>
          </div>
        </UCard>
      </div>

      <!-- General Section -->
      <div class="space-y-3">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-widest text-center">
          {{ $t('progress.general') }}
        </h2>

        <UCard>
          <div class="space-y-4">
            <!-- Current Streak -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Flame class="w-5 h-5 text-primary" />
                <span class="text-sm font-medium text-default">{{ $t('progress.currentStreak') }}</span>
              </div>
              <span class="text-sm font-semibold text-highlighted">
                {{ streakStore.currentStreak }} {{ $t('progress.day', streakStore.currentStreak) }}
              </span>
            </div>

            <USeparator />

            <!-- Total Completed Days -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <CalendarCheck class="w-5 h-5 text-primary" />
                <span class="text-sm font-medium text-default">{{ $t('progress.totalCompletedDays') }}</span>
              </div>
              <span class="text-sm font-semibold text-highlighted">
                {{ totalCompletedDays }} {{ $t('progress.day', totalCompletedDays) }}
              </span>
            </div>

            <USeparator />

            <!-- Longest Streak -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Trophy class="w-5 h-5 text-primary" />
                <span class="text-sm font-medium text-default">{{ $t('progress.longestStreak') }}</span>
              </div>
              <span class="text-sm font-semibold text-highlighted">
                {{ streakStore.longestStreak }} {{ $t('progress.day', streakStore.longestStreak) }}
              </span>
            </div>

            <USeparator />

            <!-- Average Mood -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <SmilePlus class="w-5 h-5 text-primary" />
                <span class="text-sm font-medium text-default">{{ $t('progress.averageMood') }}</span>
              </div>
              <span class="text-sm font-semibold text-highlighted">
                {{ averageMoodLabel }}
              </span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Emotion Distribution Section -->
      <div v-if="activeJournals.length > 0" class="space-y-3">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-widest text-center">
          {{ $t('progress.emotionDistribution') }}
        </h2>

        <UCard>
          <ProgressEmotionDistributionChart :journals="activeJournals" />
        </UCard>
      </div>

      <!-- Journaling Activity Heatmap Section -->
      <div v-if="activeJournals.length > 0" class="space-y-3">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-widest text-center">
          {{ $t('progress.journalingActivity') }}
        </h2>

        <UCard>
          <ProgressJournalingHeatmap :journals="activeJournals" />
        </UCard>
      </div>

      <!-- Empty State -->
      <div v-if="streakStore.totalEntries === 0" class="text-center py-8 space-y-4">
        <p class="text-sm text-muted">
          {{ $t('progress.emptyState') }}
        </p>
        <UButton
          :label="$t('progress.startJournaling')"
          color="primary"
          @click="$router.push('/journaling')"
        />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { Flame, CalendarCheck, Trophy, SmilePlus } from "lucide-vue-next";
import { useUserStreakStore } from "~/stores/stores/user_streak";
import { userJournalStore } from "~/stores/stores/user_journal";
import { computed, onMounted } from "vue";

const streakStore = useUserStreakStore();
const journalStore = userJournalStore();
const { t } = useI18n();

definePageMeta({
  layout: "detail",
});
// Ensure data is loaded
onMounted(async () => {
  if (!streakStore.streak) {
    await streakStore.fetchStreak();
  }
});

/**
 * Active (non-deleted) journals — shared filter for all computed metrics and chart components.
 */
const activeJournals = computed(() =>
  journalStore.journals.filter((j) => !j.is_deleted)
);

/**
 * Total unique days the user has journaled.
 * Computed from local journals by counting distinct dates.
 */
const totalCompletedDays = computed(() => {
  if (!journalStore.journals.length) return 0;

  const uniqueDays = new Set(
    journalStore.journals
      .filter((j) => !j.is_deleted)
      .map((j) => {
        const d = new Date(j.created_at);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );
  return uniqueDays.size;
});

/**
 * Total words written across all journals.
 * Strips HTML/JSON to count plain text words.
 */
const totalWordsWritten = computed(() => {
  return journalStore.journals
    .filter((j) => !j.is_deleted)
    .reduce((total, journal) => {
      const text = stripToPlainText(journal.content);
      const words = text.trim().split(/\s+/).filter(Boolean);
      return total + words.length;
    }, 0);
});

// Mood labels matching the journaling emotion slider (1-10 scale)
// Uses i18n keys for translation

/**
 * Average mood as a text label.
 * Rounds the average score to the nearest integer and maps to a translated label.
 */
const averageMoodLabel = computed(() => {
  const journalsWithMood = journalStore.journals.filter(
    (j) => !j.is_deleted && j.mood_score != null && j.mood_score > 0
  );
  if (journalsWithMood.length === 0) return "—";

  const avg =
    journalsWithMood.reduce((sum, j) => sum + (j.mood_score || 0), 0) /
    journalsWithMood.length;
  const rounded = Math.round(avg);
  return t(`progress.mood.${rounded}`);
});

/**
 * Strip HTML tags and TipTap JSON to extract plain text for word counting.
 */
function stripToPlainText(content: string): string {
  if (!content) return "";

  // Try parsing as TipTap JSON first
  try {
    const doc = JSON.parse(content);
    if (doc && doc.type === "doc" && Array.isArray(doc.content)) {
      return extractTextFromNodes(doc.content);
    }
  } catch {
    // Not JSON, treat as HTML or plain text
  }

  // Strip HTML tags
  return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

/**
 * Recursively extract text from TipTap node tree.
 */
function extractTextFromNodes(nodes: any[]): string {
  let text = "";
  for (const node of nodes) {
    if (node.text) {
      text += node.text + " ";
    }
    if (Array.isArray(node.content)) {
      text += extractTextFromNodes(node.content);
    }
  }
  return text;
}
</script>
