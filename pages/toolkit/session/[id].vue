<template>
  <section class="px-4 py-6 pb-24 lg:pb-6 max-w-2xl mx-auto">
    <!-- Desktop Breadcrumbs -->
    <DesktopBreadcrumb :items="breadcrumbs" />

    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="navigateTo('/toolkit')" class="text-muted hover:text-highlighted transition-colors lg:hidden">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <h1 class="text-lg font-semibold lg:text-2xl">{{ $t('toolkit.session.detail.title') }}</h1>
    </div>

    <div v-if="session">
      <!-- Date & Rating row -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-sm text-muted">{{ formatDate(session.session_date) }}</p>
          <span class="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
            :class="session.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-accented text-default'">
            {{ $t(`toolkit.session.status.${session.status}`) }}
          </span>
        </div>
        <div v-if="session.session_rating" class="flex gap-0.5">
          <span
            v-for="star in 5"
            :key="star"
            class="text-lg"
            :class="star <= session.session_rating ? 'text-yellow-400' : 'text-accented'"
          >★</span>
        </div>
      </div>

      <!-- Mood comparison -->
      <div v-if="session.mood_before || session.mood_after" class="mb-6 p-4 rounded-xl border border-default bg-elevated">
        <p class="text-xs text-muted uppercase tracking-wider mb-3">{{ $t('toolkit.session.detail.moodComparison') }}</p>
        <div class="flex items-center gap-4">
          <div v-if="session.mood_before" class="flex-1 text-center">
            <p class="text-2xl font-bold">{{ session.mood_before }}<span class="text-sm text-dimmed">/10</span></p>
            <p class="text-xs text-muted mt-1">{{ $t('toolkit.session.detail.moodBefore') }}</p>
          </div>
          <div v-if="session.mood_before && session.mood_after" class="flex flex-col items-center">
            <ArrowRight class="w-4 h-4 text-toned" />
            <span class="text-xs mt-1"
              :class="moodDelta > 0 ? 'text-green-400' : moodDelta < 0 ? 'text-red-400' : 'text-dimmed'">
              {{ moodDelta > 0 ? `+${moodDelta}` : moodDelta }}
            </span>
          </div>
          <div v-if="session.mood_after" class="flex-1 text-center">
            <p class="text-2xl font-bold">{{ session.mood_after }}<span class="text-sm text-dimmed">/10</span></p>
            <p class="text-xs text-muted mt-1">{{ $t('toolkit.session.detail.moodAfter') }}</p>
          </div>
        </div>
      </div>

      <!-- Talking points -->
      <div v-if="session.talking_points" class="mb-5">
        <p class="text-xs text-muted uppercase tracking-wider mb-2">{{ $t('toolkit.session.detail.talkingPoints') }}</p>
        <div class="p-4 rounded-xl border border-muted bg-muted">
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ stripHtml(session.talking_points) }}</p>
        </div>
      </div>

      <!-- Session priority -->
      <div v-if="session.session_priority" class="mb-5">
        <p class="text-xs text-muted uppercase tracking-wider mb-2">{{ $t('toolkit.session.detail.priority') }}</p>
        <div class="p-4 rounded-xl border border-muted bg-muted">
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ stripHtml(session.session_priority) }}</p>
        </div>
      </div>

      <!-- Key takeaways -->
      <div v-if="session.key_takeaways" class="mb-5">
        <p class="text-xs text-muted uppercase tracking-wider mb-2">{{ $t('toolkit.session.detail.takeaways') }}</p>
        <div class="p-4 rounded-xl border border-muted bg-muted">
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ stripHtml(session.key_takeaways) }}</p>
        </div>
      </div>

      <!-- Homework items -->
      <div v-if="sessionHomework.length > 0" class="mb-5">
        <p class="text-xs text-muted uppercase tracking-wider mb-2">
          {{ $t('toolkit.homework.title') }}
          <span class="text-toned ml-1">({{ completedHomeworkCount }}/{{ sessionHomework.length }})</span>
        </p>
        <div class="space-y-2">
          <div
            v-for="item in sessionHomework"
            :key="item.id"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border bg-muted cursor-pointer transition-colors"
            :class="item.completed ? 'border-green-900/40' : 'border-muted'"
            @click="toolkitStore.toggleHomework(item.id)"
          >
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="item.completed ? 'border-green-500 bg-green-500/20' : 'border-accented'"
            >
              <Icon v-if="item.completed" name="i-lucide-check" class="w-3 h-3 text-green-400" />
            </div>
            <span
              class="text-sm flex-1"
              :class="item.completed ? 'line-through text-dimmed' : ''"
            >
              {{ item.content }}
            </span>
          </div>
        </div>
      </div>

      <!-- Delete session -->
      <div class="mt-8 border-t border-muted pt-5">
        <button
          class="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
          @click="handleDelete"
        >
          <Trash2 class="w-4 h-4" />
          {{ $t('toolkit.session.delete') }}
        </button>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-16 text-dimmed">
      <p>{{ $t('toolkit.session.detail.notFound') }}</p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'
import { ChevronLeft, ArrowRight, Trash2 } from 'lucide-vue-next';
import { useToolkitStore } from '~/stores/stores/therapy_toolkit_store';

definePageMeta({ layout: 'default' });

const route = useRoute();
const toolkitStore = useToolkitStore();
const { t } = useI18n();

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.session.detail.title') },
])

const sessionId = route.params.id as string;

/** Strip HTML tags and decode entities, returning clean plain text */
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
};

// Load data if not already loaded
onMounted(async () => {
  if (toolkitStore.sessions.length === 0) {
    await toolkitStore.loadFromLocal();
  }
});

const session = computed(() =>
  toolkitStore.sessions.find(s => s.id === sessionId) || null
);

const sessionHomework = computed(() =>
  toolkitStore.getHomeworkForSession(sessionId)
);

const completedHomeworkCount = computed(() =>
  sessionHomework.value.filter(h => h.completed).length
);

const moodDelta = computed(() => {
  if (!session.value?.mood_before || !session.value?.mood_after) return 0;
  return session.value.mood_after - session.value.mood_before;
});

const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const handleDelete = async () => {
  if (confirm(t('toolkit.session.deleteConfirm'))) {
    await toolkitStore.deleteSession(sessionId);
    navigateTo('/toolkit');
  }
};
</script>
