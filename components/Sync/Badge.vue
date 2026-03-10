<template>
  <div v-if="show" class="flex items-center gap-1">
    <!-- Not Synced Badge -->
    <div 
      v-if="needsSync && !syncing" 
      class="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full"
      :title="$t('sync.notSyncedTitle')"
    >
      <div class="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
      <span v-if="showLabel" class="text-xs text-yellow-600 dark:text-yellow-400">{{ $t('sync.notSynced') }}</span>
    </div>

    <!-- Syncing Badge -->
    <div 
      v-else-if="syncing" 
      class="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-full"
      :title="$t('sync.syncingTitle')"
    >
      <Icon name="i-lucide-loader-2" class="w-3 h-3 text-blue-500 animate-spin" />
      <span v-if="showLabel" class="text-xs text-blue-600 dark:text-blue-400">{{ $t('sync.syncing') }}</span>
    </div>

    <!-- Synced Badge (optional - can be hidden) -->
    <div 
      v-else-if="showSynced" 
      class="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full"
      :title="$t('sync.syncedTitle')"
    >
      <Icon name="i-lucide-check" class="w-3 h-3 text-green-500" />
      <span v-if="showLabel" class="text-xs text-green-600 dark:text-green-400">{{ $t('sync.synced') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  needsSync: boolean | number;
  syncing?: boolean;
  showLabel?: boolean;
  showSynced?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  needsSync: false,
  syncing: false,
  showLabel: false,
  showSynced: false,
});

// Show badge only if not synced, syncing, or if we want to show synced state
const show = computed(() => {
  const needsSyncBool = props.needsSync === 1 || props.needsSync === true;
  return needsSyncBool || props.syncing || props.showSynced;
});
</script>
