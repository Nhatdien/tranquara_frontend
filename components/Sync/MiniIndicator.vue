<template>
  <UTooltip :text="tooltipText">
    <button
      :class="[
        'relative p-1 rounded-md transition-colors',
        buttonColorClass,
      ]"
      @click="handleClick"
    >
      <UIcon 
        :name="syncStore.statusIcon" 
        :class="[
          iconSizeClass,
          syncStore.currentState === 'syncing' ? 'animate-spin' : '',
        ]"
      />
      
      <!-- Pending indicator dot -->
      <span
        v-if="syncStore.hasPendingSync && syncStore.currentState !== 'syncing'"
        class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-warning-500 rounded-full"
      />
      
      <!-- Error indicator dot -->
      <span
        v-if="syncStore.currentState === 'error'"
        class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error-500 rounded-full"
      />
    </button>
  </UTooltip>
</template>

<script setup lang="ts">
import { useSyncStatusStore } from '~/stores/stores/sync_status';

const props = withDefaults(defineProps<{
  /**
   * Size of the indicator
   */
  size?: 'xs' | 'sm' | 'md';
}>(), {
  size: 'sm',
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const syncStore = useSyncStatusStore();
const { t } = useI18n();
const { formatDate: formatDateLocalized } = useLocalizedDate();

// Icon size based on button size
const iconSizeClass = computed(() => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  };
  return sizeMap[props.size];
});

// Button color class based on status
const buttonColorClass = computed(() => {
  const colorMap: Record<string, string> = {
    success: 'text-success-500 hover:bg-success-50 dark:hover:bg-success-950',
    warning: 'text-warning-500 hover:bg-warning-50 dark:hover:bg-warning-950',
    error: 'text-error-500 hover:bg-error-50 dark:hover:bg-error-950',
    info: 'text-info-500 hover:bg-info-50 dark:hover:bg-info-950',
    neutral: 'text-muted hover:bg-muted',
  };
  return colorMap[syncStore.statusColor] || 'text-muted hover:bg-muted';
});

// Tooltip text
const tooltipText = computed(() => {
  if (!syncStore.isOnline) {
    return t('sync.offlineTooltip');
  }
  
  if (syncStore.currentState === 'syncing') {
    return t('sync.syncingTooltip');
  }
  
  if (syncStore.currentState === 'error') {
    return t('sync.syncErrorTooltip', { error: syncStore.lastSyncError });
  }
  
  if (syncStore.hasPendingSync) {
    return t('sync.pendingSyncTooltip', { count: syncStore.pendingCount });
  }
  
  const lastSyncFormatted = syncStore.lastSyncTime
    ? formatDateLocalized(syncStore.lastSyncTime)
    : t('sync.notSynced');
  return t('sync.lastSyncedTooltip', { time: lastSyncFormatted });
});

// Handle click
const handleClick = () => {
  emit('click');
};

// Initialize on mount
onMounted(async () => {
  await syncStore.initialize();
});
</script>
