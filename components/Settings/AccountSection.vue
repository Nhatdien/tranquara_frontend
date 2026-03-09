<template>
  <div class="py-6">
    <UCard>
      <div class="flex items-center gap-4">
        <UAvatar
          :alt="displayName"
          size="xl"
        >
          <template #fallback>
            <User class="w-8 h-8 text-muted" />
          </template>
        </UAvatar>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-highlighted truncate">{{ displayName }}</h2>
          <p class="text-sm text-muted truncate">{{ email }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/stores/auth_store';

const authStore = useAuthStore();
const { t } = useI18n();

const displayName = computed(() => authStore.user?.preferred_username || t('settings.account.defaultName'));
const email = computed(() => authStore.user?.email || '');
</script>
