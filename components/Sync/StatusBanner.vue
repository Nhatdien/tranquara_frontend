<template>
  <div class="space-y-2">
    <!-- Offline Banner -->
    <div 
      v-if="!isOnline" 
      class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2"
    >
      <Icon name="i-lucide-wifi-off" class="w-5 h-5 text-yellow-500 flex-shrink-0" />
      <span class="text-sm text-yellow-600 dark:text-yellow-400">
        {{ $t('sync.offlineMessage') }}
      </span>
    </div>

    <!-- Syncing Banner -->
    <div 
      v-else-if="isSyncing" 
      class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2"
    >
      <Icon name="i-lucide-loader-2" class="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
      <span class="text-sm text-blue-600 dark:text-blue-400">
        {{ $t('sync.syncingJournals') }}
      </span>
    </div>

    <!-- Pending Sync Banner -->
    <div 
      v-else-if="pendingCount > 0" 
      class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <Icon name="i-lucide-cloud-upload" class="w-5 h-5 text-blue-500 flex-shrink-0" />
        <span class="text-sm text-blue-600 dark:text-blue-400">
          {{ $t('sync.pendingSync', { count: pendingCount }) }}
        </span>
      </div>
      <UButton 
        v-if="showSyncButton"
        @click="$emit('sync')" 
        :loading="isSyncing"
        :disabled="!isOnline"
        size="xs"
        variant="ghost"
        class="text-blue-600 dark:text-blue-400"
      >
        {{ $t('sync.syncNow') }}
      </UButton>
    </div>

    <!-- Sync Error Banner -->
    <div 
      v-if="error" 
      class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <Icon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500 flex-shrink-0" />
        <span class="text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </span>
      </div>
      <UButton 
        @click="$emit('retry')" 
        :disabled="!isOnline"
        size="xs"
        variant="ghost"
        class="text-red-600 dark:text-red-400"
      >
        {{ $t('sync.retry') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  error?: string | null;
  showSyncButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  error: null,
  showSyncButton: true,
});

defineEmits<{
  (e: 'sync'): void;
  (e: 'retry'): void;
}>();
</script>
