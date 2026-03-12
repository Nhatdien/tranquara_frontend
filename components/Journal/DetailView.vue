<template>
  <div class="flex flex-col h-full bg-background">
    <!-- Header -->
    <header
      class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <UButton
        variant="ghost"
        icon="i-lucide-arrow-left"
        @click="emit('back')" />
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold truncate max-w-[180px] md:max-w-sm lg:max-w-md">
          {{ journal.title || $t('journal.untitledJournal') }}
        </h1>
        <SyncBadge
          :needs-sync="journal.needs_sync"
          :syncing="isSyncing" />
      </div>
      <UDropdownMenu :items="menuItems" :ui="{ content: 'w-40' }">
        <UButton variant="ghost" icon="i-lucide-more-vertical" />
      </UDropdownMenu>
    </header>

    <!-- Content Scrollable -->
    <main class="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full">
      <!-- Meta Info -->
      <div class="flex flex-col gap-2">
        <span class="text-sm text-muted">{{ formatDate(journal.created_at) }}</span>

        <div v-if="journal.mood_label" class="flex items-center gap-2">
          <span
            class="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium flex items-center gap-2">
            <Icon name="i-lucide-smile" class="w-4 h-4" />
            {{ journal.mood_label }}
          </span>
          <span
            v-if="journal.mood_score !== null && journal.mood_score !== undefined"
            class="text-xs text-muted">
            {{ $t('journal.score', { score: journal.mood_score }) }}
          </span>
        </div>
      </div>

      <!-- Journal Content -->
      <div class="prose dark:prose-invert max-w-none md:max-w-prose journal-content">
        <div v-html="journal.content_html || journal.content"></div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteConfirm">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-2">{{ $t('journal.deleteJournal') }}</h3>
          <p class="text-muted mb-6">
            {{ $t('journal.deleteConfirmMessage') }}
          </p>
          <div class="flex gap-3">
            <UButton
              variant="outline"
              block
              @click="showDeleteConfirm = false">
              {{ $t('common.cancel') }}
            </UButton>
            <UButton
              color="error"
              block
              @click="handleDelete"
              :loading="isDeleting">
              {{ $t('common.delete') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { LocalJournal } from '~/types/user_journal';
import type { DropdownMenuItem } from '@nuxt/ui';

const { t, locale } = useI18n();
const { formatDateTime } = useLocalizedDate();

const props = defineProps<{
  journal: LocalJournal;
  isSyncing: boolean;
  isDeleting?: boolean;
}>();

const emit = defineEmits<{
  back: [];
  edit: [];
  delete: [];
}>();

const showDeleteConfirm = ref(false);

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: t('common.edit'),
      icon: 'i-lucide-edit',
      onSelect: () => emit('edit'),
    },
  ],
  [
    {
      label: t('common.delete'),
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => { showDeleteConfirm.value = true; },
    },
  ],
]);

const formatDate = (dateString: string) => {
  return formatDateTime(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleDelete = () => {
  emit('delete');
};
</script>

<style scoped lang="scss">
.journal-content :deep(.journal-question) {
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.75rem;
  margin-bottom: 0.5rem;
}
.journal-content :deep(.journal-answer) {
  font-size: 1rem;
  line-height: 1.5rem;
  margin-bottom: 1.5rem;
}
.journal-content :deep(.ai-suggestion) {
  color: var(--color-old-neutral-500);
  border-left: 1px solid var(--color-old-neutral-500);
  padding-left: 0.5rem;
  font-size: 0.875rem;
  margin: 0.75rem 0;
}
</style>
