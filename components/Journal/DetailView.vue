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
        <h1 class="text-xl font-bold truncate max-w-[180px]">
          {{ journal.title || 'Untitled Journal' }}
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
    <main class="flex-1 overflow-y-auto p-4 space-y-6">
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
            Score: {{ journal.mood_score }}/10
          </span>
        </div>
      </div>

      <!-- Journal Content -->
      <div class="prose dark:prose-invert max-w-none journal-content">
        <div v-html="journal.content_html || journal.content"></div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteConfirm">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-2">Delete Journal</h3>
          <p class="text-muted mb-6">
            Are you sure you want to delete this journal entry? This action
            cannot be undone.
          </p>
          <div class="flex gap-3">
            <UButton
              variant="outline"
              block
              @click="showDeleteConfirm = false">
              Cancel
            </UButton>
            <UButton
              color="error"
              block
              @click="handleDelete"
              :loading="isDeleting">
              Delete
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
      label: 'Edit',
      icon: 'i-lucide-edit',
      onSelect: () => emit('edit'),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => { showDeleteConfirm.value = true; },
    },
  ],
]);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
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
  color: red;
  font-style: italic;
}
</style>
