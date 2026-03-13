<template>
  <section class="px-4 py-6 pb-20 lg:pb-0">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold lg:text-3xl">{{ $t('toolkit.title') }}</h1>
      <p class="text-muted text-sm mt-1">{{ $t('toolkit.subtitle') }}</p>
    </div>

    <!-- Prep Pack + Session Tracker: side-by-side on desktop -->
    <div class="lg:grid lg:grid-cols-2 lg:gap-6">
    <!-- Section 1: Prep Pack (AI Summary) -->
    <div class="mb-8 lg:mb-0">
      <h2 class="text-sm text-muted tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.prepPack.title') }}
      </h2>
      <div class="p-5 rounded-xl border border-default bg-elevated">
        <p class="text-muted text-sm mb-3">{{ $t('toolkit.prepPack.description') }}</p>

        <!-- Last generated info -->
        <div v-if="toolkitStore.latestPrepPack" class="flex items-center justify-between mb-3">
          <span class="text-xs text-dimmed">
            {{ $t('toolkit.prepPack.lastGenerated') }}: {{ formatDate(toolkitStore.latestPrepPack.created_at) }}
          </span>
          <button
            class="text-xs text-muted hover:text-highlighted transition-colors underline"
            @click="navigateTo(`/toolkit/prep-pack/${toolkitStore.latestPrepPack.id}`)"
          >
            {{ $t('common.view') }}
          </button>
        </div>

        <UButton
          variant="soft"
          color="neutral"
          size="lg"
          class="w-full"
          :disabled="!hasJournals"
          @click="navigateTo('/toolkit/prep-pack')"
        >
          {{ toolkitStore.latestPrepPack ? $t('toolkit.prepPack.viewAll') : $t('toolkit.prepPack.generate') }}
        </UButton>
        <p v-if="!hasJournals" class="text-xs text-dimmed mt-2 text-center">
          {{ $t('toolkit.prepPack.noJournals') }}
        </p>
      </div>
    </div>

    <!-- Section 2: Session Tracker -->
    <div class="mb-8 lg:mb-0">
      <h2 class="text-sm text-muted tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.session.title') }}
      </h2>

      <!-- Upcoming session card -->
      <div v-if="toolkitStore.upcomingSession" class="p-5 rounded-xl border border-default bg-elevated mb-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">{{ formatDate(toolkitStore.upcomingSession.session_date) }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 rounded-full"
              :class="toolkitStore.upcomingSession.status === 'before_completed'
                ? 'bg-green-900/30 text-green-400'
                : 'bg-accented text-default'">>
              {{ $t(`toolkit.session.status.${toolkitStore.upcomingSession.status === 'before_completed' ? 'beforeCompleted' : 'scheduled'}`) }}
            </span>
            <!-- Delete button -->
            <button
            class="text-toned hover:text-red-400 transition-colors"
              @click="confirmDeleteSession(toolkitStore.upcomingSession.id)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="flex gap-2 mt-3">
          <!-- scheduled → Prepare for session -->
          <UButton
            v-if="toolkitStore.upcomingSession.status === 'scheduled'"
            variant="soft"
            color="neutral"
            size="sm"
            class="flex-1"
            @click="navigateTo(`/toolkit/session/new?step=before&sessionId=${toolkitStore.upcomingSession.id}`)"
          >
            {{ $t('toolkit.session.prepare') }}
          </UButton>
          <!-- before_completed → Log how it went -->
          <UButton
            v-if="toolkitStore.upcomingSession.status === 'before_completed'"
            variant="soft"
            color="neutral"
            size="sm"
            class="flex-1"
            @click="navigateTo(`/toolkit/session/new?step=after&sessionId=${toolkitStore.upcomingSession.id}`)"
          >
            {{ $t('toolkit.session.logAfter') }}
          </UButton>
        </div>
      </div>

      <!-- No session — inline schedule panel -->
      <div v-else class="rounded-xl border border-default bg-elevated overflow-hidden">
        <div class="p-5 text-center">
          <p class="text-muted text-sm mb-3">{{ $t('toolkit.session.noSession') }}</p>
          <UButton
            variant="soft"
            color="neutral"
            @click="showSchedulePanel = !showSchedulePanel"
          >
            {{ $t('toolkit.session.schedule') }}
          </UButton>
        </div>

        <!-- Date picker panel (expands inline) -->
        <Transition name="slide-down">
          <div v-if="showSchedulePanel" class="border-t border-default px-5 pb-5 pt-4">
            <p class="text-sm text-muted mb-3">{{ $t('toolkit.session.scheduleTitle') }}</p>
            <input
              type="date"
              v-model="scheduleDate"
              class="w-full px-4 py-3 rounded-xl bg-accented border border-default text-center text-sm focus:outline-none focus:border-accented transition-colors mb-3"
            />
            <div class="flex gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                class="flex-1"
                @click="showSchedulePanel = false"
              >
                {{ $t('common.cancel') }}
              </UButton>
              <UButton
                variant="soft"
                color="neutral"
                size="sm"
                class="flex-1"
                :disabled="!scheduleDate"
                @click="handleScheduleSession"
              >
                {{ $t('toolkit.session.scheduleConfirm') }}
              </UButton>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Past sessions -->
      <div v-if="toolkitStore.completedSessions.length > 0" class="mt-4">
        <h3 class="text-xs text-dimmed uppercase tracking-wider mb-2">
          {{ $t('toolkit.session.pastSessions') }}
        </h3>
        <div class="space-y-2">
          <div
            v-for="session in toolkitStore.completedSessions.slice(0, 5)"
            :key="session.id"
            class="flex items-center justify-between px-4 py-3 rounded-xl border border-muted bg-muted cursor-pointer active:bg-accented transition-colors"
            @click="navigateTo(`/toolkit/session/${session.id}`)"
          >
            <div>
              <span class="text-sm">{{ formatDate(session.session_date) }}</span>
              <div v-if="session.session_rating" class="flex gap-0.5 mt-0.5">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="text-xs"
                  :class="star <= session.session_rating ? 'text-yellow-400' : 'text-accented'"
                >★</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-dimmed">{{ $t('toolkit.session.status.completed') }}</span>
              <Icon name="i-lucide-chevron-right" class="w-4 h-4 text-toned" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div> <!-- End: Prep Pack + Session Tracker grid -->

    <!-- Section 3: Homework -->
    <div v-if="toolkitStore.homeworkItems.length > 0 || toolkitStore.upcomingSession" class="mb-8 lg:max-w-2xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm text-muted tracking-[0.2em] uppercase">
          {{ $t('toolkit.homework.title') }}
        </h2>
        <span v-if="toolkitStore.homeworkItems.length > 0" class="text-xs text-dimmed">
          {{ completedHomeworkCount }}/{{ toolkitStore.homeworkItems.length }}
        </span>
      </div>

      <!-- Add homework inline (when there's an upcoming session) -->
      <div v-if="toolkitStore.upcomingSession" class="flex gap-2 mb-3">
        <UInput
          v-model="newHomeworkText"
          :placeholder="$t('toolkit.homework.addPlaceholder')"
          class="flex-1"
          size="sm"
          @keyup.enter="handleAddHomework"
        />
        <button
          @click="handleAddHomework"
          :disabled="!newHomeworkText.trim()"
          class="w-9 h-9 rounded-full bg-accented border border-default flex items-center justify-center text-base transition-colors shrink-0"
          :class="newHomeworkText.trim() ? 'hover:bg-muted text-highlighted' : 'text-toned cursor-not-allowed'"
        >
          +
        </button>
      </div>

      <!-- Pending items -->
      <div v-if="pendingHomework.length > 0" class="space-y-2">
        <div
          v-for="item in pendingHomework"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl border border-muted bg-muted"
        >
          <button
            class="w-5 h-5 rounded border-2 border-accented shrink-0 transition-colors hover:border-muted"
            @click="toolkitStore.toggleHomework(item.id)"
          />
          <span class="text-sm flex-1">{{ item.content }}</span>
          <button
            class="text-toned hover:text-red-400 transition-colors shrink-0"
            @click="toolkitStore.deleteHomework(item.id)"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Completed items (collapsed) -->
      <div v-if="completedHomework.length > 0" class="mt-2">
        <button
          v-if="pendingHomework.length > 0"
          class="text-xs text-dimmed hover:text-muted mb-2 transition-colors"
          @click="showCompletedHomework = !showCompletedHomework"
        >
          {{ showCompletedHomework ? '▾' : '▸' }} {{ $t('toolkit.homework.completed') }} ({{ completedHomework.length }})
        </button>
        <div v-if="showCompletedHomework || pendingHomework.length === 0" class="space-y-2">
          <div
            v-for="item in completedHomework"
            :key="item.id"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border border-muted/50 bg-muted"
          >
            <button
              class="w-5 h-5 rounded border-2 border-green-500 bg-green-500/20 flex items-center justify-center shrink-0 transition-colors"
              @click="toolkitStore.toggleHomework(item.id)"
            >
              <Icon name="i-lucide-check" class="w-3 h-3 text-green-400" />
            </button>
            <span class="text-sm flex-1 line-through text-dimmed">{{ item.content }}</span>
            <button
              class="text-toned hover:text-red-400 transition-colors shrink-0"
              @click="toolkitStore.deleteHomework(item.id)"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="toolkitStore.homeworkItems.length === 0" class="py-4 text-center">
        <p class="text-sm text-dimmed">{{ $t('toolkit.homework.empty') }}</p>
      </div>
    </div>

    <!-- Section 4: Preparation Journey -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm text-muted tracking-[0.2em] uppercase">
          {{ $t('toolkit.journey.title') }}
        </h2>
        <span v-if="overallProgress > 0" class="text-xs text-dimmed">
          {{ $t('toolkit.journey.overallProgress', { percent: overallProgress }) }}
        </span>
      </div>

      <div class="flex flex-col gap-3 md:grid md:grid-cols-2 xl:grid-cols-3">
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

    <!-- Section 5: Grounding Exercises -->
    <div class="mb-8">
      <h2 class="text-sm text-muted tracking-[0.2em] uppercase mb-4">
        {{ $t('toolkit.grounding.title') }}
      </h2>
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <button
          v-for="tool in groundingTools"
          :key="tool.key"
          class="flex items-center gap-3 p-3 rounded-xl border border-default bg-elevated text-left hover:bg-muted hover:shadow-sm transition-all"
          @click="navigateTo(tool.path)"
        >
          <div class="w-10 h-10 rounded-lg bg-accented flex items-center justify-center shrink-0">
            <component :is="tool.icon" class="w-5 h-5 text-default" />
          </div>
          <div class="min-w-0">
            <p class="font-medium text-sm">{{ $t(tool.titleKey) }}</p>
            <p class="text-xs text-muted">{{ $t(tool.descriptionKey) }}</p>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { Wind, Trash2, X, Eye, HeartPulse, Sparkles, PenLine } from "lucide-vue-next";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useLearnedStore } from "~/stores/stores/user_learned";
import { useToolkitStore } from "~/stores/stores/therapy_toolkit_store";
import { JOURNEY_STEPS, TOOLKIT_COLLECTION_IDS } from "~/types/therapy_toolkit";
import type { LocalTemplate } from "~/types/user_journal";

const journalStore = userJournalStore();
const learnedStore = useLearnedStore();
const toolkitStore = useToolkitStore();

const journeySteps = JOURNEY_STEPS;

// ─── Schedule session panel ──────────────────────────
const showSchedulePanel = ref(false);
const scheduleDate = ref(new Date().toISOString().split('T')[0]);

const handleScheduleSession = async () => {
  if (!scheduleDate.value) return;
  await toolkitStore.createSession({
    session_date: scheduleDate.value,
    status: 'scheduled',
  });
  showSchedulePanel.value = false;
  scheduleDate.value = new Date().toISOString().split('T')[0];
};

// ─── Delete session ──────────────────────────────────
const confirmDeleteSession = async (id: string) => {
  if (confirm(useI18n().t('toolkit.session.deleteConfirm'))) {
    await toolkitStore.deleteSession(id);
  }
};

// ─── Homework ────────────────────────────────────────
const newHomeworkText = ref('');
const showCompletedHomework = ref(false);

const pendingHomework = computed(() =>
  toolkitStore.homeworkItems.filter(h => !h.completed)
);

const completedHomework = computed(() =>
  toolkitStore.homeworkItems.filter(h => h.completed)
);

const completedHomeworkCount = computed(() => completedHomework.value.length);

const handleAddHomework = async () => {
  const text = newHomeworkText.value.trim();
  if (!text || !toolkitStore.upcomingSession) return;
  await toolkitStore.addHomework(toolkitStore.upcomingSession.id, text);
  newHomeworkText.value = '';
};

// Load templates + progress on mount
onMounted(async () => {
  await journalStore.getAllTemplates();
  await learnedStore.loadFromLocal();
  await toolkitStore.loadFromLocal();
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
  navigateTo(`/toolkit/journey/${collectionId}`);
};

// Format session date for display
const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const groundingTools = [
  {
    key: 'breathing',
    titleKey: 'toolkit.grounding.breathing.title',
    descriptionKey: 'toolkit.grounding.breathing.description',
    icon: Wind,
    path: '/toolkit/grounding/breathing',
  },
  {
    key: 'fiveSenses',
    titleKey: 'toolkit.grounding.fiveSenses.title',
    descriptionKey: 'toolkit.grounding.fiveSenses.description',
    icon: Eye,
    path: '/toolkit/grounding/five-senses',
  },
  {
    key: 'bodyScan',
    titleKey: 'toolkit.grounding.bodyScan.title',
    descriptionKey: 'toolkit.grounding.bodyScan.description',
    icon: HeartPulse,
    path: '/toolkit/grounding/body-scan',
  },
  {
    key: 'affirmations',
    titleKey: 'toolkit.grounding.affirmations.title',
    descriptionKey: 'toolkit.grounding.affirmations.description',
    icon: Sparkles,
    path: '/toolkit/grounding/affirmations',
  },
  {
    key: 'quickJournal',
    titleKey: 'toolkit.grounding.quickJournal.title',
    descriptionKey: 'toolkit.grounding.quickJournal.description',
    icon: PenLine,
    path: '/journaling',
  },
];
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 200px;
  opacity: 1;
}
</style>
