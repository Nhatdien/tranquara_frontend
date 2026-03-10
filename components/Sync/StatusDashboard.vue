<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div 
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="statusBgClass"
          >
            <UIcon 
              :name="syncStore.statusIcon" 
              class="w-5 h-5"
              :class="[syncStore.currentState === 'syncing' ? 'animate-spin' : '', statusIconClass]"
            />
          </div>
          <div>
            <h3 class="text-base font-semibold text-highlighted">{{ $t('sync.dataSync') }}</h3>
            <p class="text-xs text-muted">{{ syncStore.statusText }}</p>
          </div>
        </div>
        
        <!-- Sync Button -->
        <UButton
          v-if="!compact"
          :loading="syncStore.currentState === 'syncing'"
          :disabled="!syncStore.canSync"
          :color="syncStore.canSync ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          icon="i-lucide-refresh-cw"
          @click="handleSync"
        >
          {{ $t('sync.syncNow') }}
        </UButton>
      </div>
    </template>

    <!-- Progress Bar (when syncing) -->
    <div v-if="syncStore.currentState === 'syncing'" class="mb-4">
      <UProgress 
        :value="syncStore.currentProgress" 
        color="primary"
        size="sm"
      />
      <p class="text-xs text-muted mt-1">{{ syncStore.currentMessage }}</p>
    </div>

    <!-- Status Details -->
    <div class="space-y-4">
      <!-- Network Status -->
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2">
          <UIcon 
            :name="syncStore.isOnline ? 'i-lucide-wifi' : 'i-lucide-wifi-off'" 
            class="w-4 h-4"
            :class="syncStore.isOnline ? 'text-success-500' : 'text-muted'"
          />
          <span class="text-sm text-default">{{ $t('sync.networkStatus') }}</span>
        </div>
        <UBadge 
          :color="syncStore.isOnline ? 'success' : 'neutral'" 
          variant="subtle"
          size="sm"
        >
          {{ $t(syncStore.isOnline ? 'sync.online' : 'sync.offline') }}
        </UBadge>
      </div>

      <USeparator />

      <!-- Pending Uploads -->
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-cloud-upload" class="w-4 h-4 text-muted" />
          <span class="text-sm text-default">{{ $t('sync.pendingUploads') }}</span>
        </div>
        <UBadge 
          :color="syncStore.pendingCount > 0 ? 'warning' : 'success'" 
          variant="subtle"
          size="sm"
        >
          {{ $t('sync.items', { count: syncStore.pendingCount }) }}
        </UBadge>
      </div>

      <USeparator />

      <!-- Last Sync -->
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-clock" class="w-4 h-4 text-muted" />
          <span class="text-sm text-default">{{ $t('sync.lastSync') }}</span>
        </div>
        <span class="text-sm text-muted">{{ localizedLastSync }}</span>
      </div>

      <!-- Error Message -->
      <div v-if="syncStore.lastSyncError" class="mt-4">
        <UAlert
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :title="$t(syncStore.lastSyncResult === 'partial' ? 'sync.partialSync' : 'sync.syncError')"
          :description="syncStore.lastSyncError"
        >
          <template #actions>
            <UButton 
              color="error" 
              variant="ghost" 
              size="xs"
              @click="handleRetry"
            >
              {{ $t('sync.retry') }}
            </UButton>
            <UButton 
              color="neutral" 
              variant="ghost" 
              size="xs"
              @click="syncStore.clearError()"
            >
              {{ $t('sync.dismiss') }}
            </UButton>
          </template>
        </UAlert>
      </div>

      <!-- Statistics Section (expanded view) -->
      <div v-if="showStats && !compact" class="mt-4">
        <USeparator class="my-4" />
        
        <h4 class="text-sm font-medium text-muted mb-3">{{ $t('sync.syncStatistics') }}</h4>
        
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="p-3 rounded-lg bg-muted">
            <p class="text-2xl font-bold text-highlighted">{{ syncStore.stats.totalUploads }}</p>
            <p class="text-xs text-muted">{{ $t('sync.uploaded') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-muted">
            <p class="text-2xl font-bold text-highlighted">{{ syncStore.stats.totalDownloads }}</p>
            <p class="text-xs text-muted">{{ $t('sync.downloaded') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-muted">
            <p class="text-2xl font-bold" :class="syncStore.stats.totalErrors > 0 ? 'text-error-500' : 'text-highlighted'">
              {{ syncStore.stats.totalErrors }}
            </p>
            <p class="text-xs text-muted">{{ $t('sync.errors') }}</p>
          </div>
        </div>

        <!-- Last Successful Sync -->
        <p v-if="syncStore.stats.lastSuccessfulSync" class="text-xs text-muted mt-3 text-center">
          {{ $t('sync.lastSuccessful', { date: formatDate(syncStore.stats.lastSuccessfulSync) }) }}
        </p>
      </div>

      <!-- History Section (expanded view) -->
      <div v-if="showHistory && !compact && syncStore.syncHistory.length > 0" class="mt-4">
        <USeparator class="my-4" />
        
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-muted">{{ $t('sync.recentActivity') }}</h4>
          <UButton 
            v-if="syncStore.syncHistory.length > 5"
            color="neutral" 
            variant="ghost" 
            size="xs"
            @click="$emit('viewHistory')"
          >
            {{ $t('sync.viewAll') }}
          </UButton>
        </div>

        <div class="space-y-2">
          <div 
            v-for="(entry, index) in recentHistory" 
            :key="index"
            class="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted"
          >
            <UIcon 
              :name="entry.success ? 'i-lucide-check-circle' : 'i-lucide-x-circle'" 
              class="w-4 h-4 flex-shrink-0"
              :class="entry.success ? 'text-success-500' : 'text-error-500'"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-default truncate">
                {{ getHistoryLabel(entry) }}
              </p>
              <p class="text-xs text-muted">{{ formatRelativeTime(entry.timestamp) }}</p>
            </div>
            <UBadge 
              :color="entry.success ? 'success' : 'error'" 
              variant="subtle"
              size="xs"
            >
              {{ entry.itemsProcessed }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Actions (expanded view) -->
      <div v-if="showActions && !compact" class="mt-4">
        <USeparator class="my-4" />
        
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            class="flex-1"
            icon="i-lucide-trash-2"
            @click="handleClearHistory"
          >
            {{ $t('sync.clearHistory') }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            class="flex-1"
            icon="i-lucide-refresh-ccw"
            @click="handleResetStats"
          >
            {{ $t('sync.resetStats') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Compact footer -->
    <template v-if="compact" #footer>
      <UButton
        block
        :loading="syncStore.currentState === 'syncing'"
        :disabled="!syncStore.canSync"
        :color="syncStore.pendingCount > 0 ? 'primary' : 'neutral'"
        variant="soft"
        size="sm"
        @click="handleSync"
      >
        <template #leading>
          <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
        </template>
        {{ syncStore.pendingCount > 0 ? $t('sync.syncItems', { count: syncStore.pendingCount }) : $t('sync.syncNow') }}
      </UButton>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useSyncStatusStore } from '~/stores/stores/sync_status';
import { userJournalStore } from '~/stores/stores/user_journal';

const { t } = useI18n();
const { formatDateTime, formatDate: formatDateLocalized } = useLocalizedDate();

const props = withDefaults(defineProps<{
  /**
   * Compact mode - shows minimal info with sync button
   */
  compact?: boolean;
  /**
   * Show sync statistics section
   */
  showStats?: boolean;
  /**
   * Show sync history section
   */
  showHistory?: boolean;
  /**
   * Show action buttons (clear history, reset stats)
   */
  showActions?: boolean;
}>(), {
  compact: false,
  showStats: true,
  showHistory: true,
  showActions: false,
});

const emit = defineEmits<{
  (e: 'sync'): void;
  (e: 'viewHistory'): void;
}>();

const syncStore = useSyncStatusStore();
const journalStore = userJournalStore();

// Localized last sync time (replaces store's English-only getter)
const localizedLastSync = computed(() => {
  if (!syncStore.lastSyncTime) return t('sync.notSynced');
  return formatRelativeTime(syncStore.lastSyncTime);
});

// Computed classes for status indicator
const statusBgClass = computed(() => {
  const colorMap: Record<string, string> = {
    success: 'bg-success-100 dark:bg-success-900/30',
    warning: 'bg-warning-100 dark:bg-warning-900/30',
    error: 'bg-error-100 dark:bg-error-900/30',
    info: 'bg-info-100 dark:bg-info-900/30',
    neutral: 'bg-muted',
  };
  return colorMap[syncStore.statusColor] || 'bg-muted';
});

const statusIconClass = computed(() => {
  const colorMap: Record<string, string> = {
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    info: 'text-info-500',
    neutral: 'text-muted',
  };
  return colorMap[syncStore.statusColor] || 'text-muted';
});

// Get recent history (first 5 items)
const recentHistory = computed(() => {
  return syncStore.syncHistory.slice(0, 5);
});

// Format date helper
const formatDate = (isoString: string) => {
  return formatDateTime(isoString);
};

// Format relative time helper
const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return t('sync.justNow');
  if (diffMins < 60) return t('sync.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('sync.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('sync.daysAgo', { count: diffDays });
  
  return formatDateLocalized(date);
};

// Get history entry label
const getHistoryLabel = (entry: { type: string; success: boolean; error?: string }) => {
  const typeLabels: Record<string, string> = {
    upload: t('sync.uploadedToCloud'),
    download: t('sync.downloadedFromCloud'),
    full: t('sync.fullSync'),
  };
  
  if (!entry.success && entry.error) {
    return entry.error;
  }
  
  return typeLabels[entry.type] || t('sync.synced');
};

// Handle sync button click
const handleSync = async () => {
  emit('sync');
  
  try {
    syncStore.onSyncStart('full');
    
    const result = await journalStore.fullBiDirectionalSync();
    
    if (result.errors.length > 0) {
      await syncStore.onSyncPartial({
        uploadedCount: result.upload?.syncedCount || 0,
        downloadedCount: result.download?.count || 0,
        failedCount: result.upload?.failedCount || 0,
        error: result.errors.join(', '),
      });
    } else {
      await syncStore.onSyncSuccess({
        uploadedCount: result.upload?.syncedCount || 0,
        downloadedCount: result.download?.count || 0,
        type: 'full',
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await syncStore.onSyncError(errorMessage);
  }
};

// Handle retry after error
const handleRetry = () => {
  syncStore.clearError();
  handleSync();
};

// Handle clear history
const handleClearHistory = async () => {
  await syncStore.clearHistory();
};

// Handle reset stats
const handleResetStats = async () => {
  await syncStore.resetStats();
};

// Initialize sync store on mount
onMounted(async () => {
  await syncStore.initialize();
});
</script>
