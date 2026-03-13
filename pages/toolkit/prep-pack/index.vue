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
        <h1 class="text-xl font-bold lg:text-2xl">{{ $t('toolkit.prepPack.title') }}</h1>
        <p class="text-muted text-xs mt-0.5">{{ $t('toolkit.prepPack.description') }}</p>
      </div>
    </div>

    <!-- Generate Section -->
    <div class="p-5 rounded-xl border border-default bg-elevated mb-6">
      <h2 class="text-sm font-medium mb-3">{{ $t('toolkit.prepPack.new') }}</h2>

      <!-- Date range selector -->
      <p class="text-xs text-muted mb-2">{{ $t('toolkit.prepPack.selectRange') }}</p>
      <div class="flex gap-2 mb-4">
        <button
          v-for="option in rangeOptions"
          :key="option.days"
          @click="selectedDays = option.days"
          class="flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors"
          :class="selectedDays === option.days
            ? 'border-default bg-elevated text-highlighted'
            : 'border-default bg-muted text-muted hover:border-accented'"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- Generate button -->
      <UButton
        variant="soft"
        color="neutral"
        size="lg"
        class="w-full"
        :disabled="!hasJournals || toolkitStore.isGeneratingPrepPack"
        :loading="toolkitStore.isGeneratingPrepPack"
        @click="handleGenerate"
      >
        {{ toolkitStore.isGeneratingPrepPack
          ? $t('toolkit.prepPack.generating')
          : $t('toolkit.prepPack.generate') }}
      </UButton>

      <p v-if="!hasJournals" class="text-xs text-dimmed mt-2 text-center">
        {{ $t('toolkit.prepPack.noJournals') }}
      </p>

      <p v-if="toolkitStore.error" class="text-xs text-red-400 mt-2 text-center">
        {{ $t('toolkit.prepPack.errorGenerate') }}
      </p>
    </div>

    <!-- Past Prep Packs -->
    <div v-if="toolkitStore.prepPacks.length > 0">
      <h2 class="text-sm text-muted tracking-[0.2em] uppercase mb-3">
        {{ $t('toolkit.prepPack.pastPacks') }}
      </h2>

      <div class="space-y-2">
        <div
          v-for="pack in toolkitStore.prepPacks"
          :key="pack.id"
          class="flex items-center justify-between px-4 py-3 rounded-xl border border-muted bg-muted cursor-pointer active:bg-accented transition-colors"
          @click="navigateTo(`/toolkit/prep-pack/${pack.id}`)"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ formatDateRange(pack.date_range_start, pack.date_range_end) }}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-dimmed">
                {{ $t('toolkit.prepPack.journalsAnalyzed', { count: pack.journal_count }) }}
              </span>
              <span class="text-xs text-toned">·</span>
              <span class="text-xs text-dimmed">{{ formatDate(pack.created_at) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              class="text-toned hover:text-red-400 transition-colors"
              @click.stop="handleDelete(pack.id)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <Icon name="i-lucide-chevron-right" class="w-4 h-4 text-toned" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12">
      <Sparkles class="w-10 h-10 text-toned mx-auto mb-3" />
      <p class="text-dimmed text-sm">{{ $t('toolkit.prepPack.description') }}</p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'
import { ChevronLeft, Trash2, Sparkles } from "lucide-vue-next";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useToolkitStore } from "~/stores/stores/therapy_toolkit_store";

const { t } = useI18n();
const journalStore = userJournalStore();
const toolkitStore = useToolkitStore();

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.prepPack.title') },
])

const selectedDays = ref(7);

const rangeOptions = computed(() => [
  { days: 7, label: t('toolkit.prepPack.last7Days') },
  { days: 14, label: t('toolkit.prepPack.last14Days') },
  { days: 30, label: t('toolkit.prepPack.last30Days') },
]);

const hasJournals = computed(() => journalStore.journals.length > 0);

const handleGenerate = async () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - selectedDays.value);

  const pack = await toolkitStore.generatePrepPack(
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0],
  );

  if (pack) {
    navigateTo(`/toolkit/prep-pack/${pack.id}`);
  }
};

const handleDelete = async (id: string) => {
  if (confirm(t('toolkit.prepPack.deleteConfirm'))) {
    await toolkitStore.deletePrepPack(id);
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
  await toolkitStore.loadFromLocal();
});
</script>
