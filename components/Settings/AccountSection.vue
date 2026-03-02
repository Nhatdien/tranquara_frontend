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
          <p v-if="memberSince" class="text-xs text-dimmed mt-0.5">Member since {{ memberSince }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { User } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/stores/auth_store';
import { userInformationStore } from '~/stores/stores/user_information';

const authStore = useAuthStore();
const userInfoStore = userInformationStore();

const displayName = computed(() => authStore.user?.preferred_username || 'User');
const email = computed(() => authStore.user?.email || '');

const memberSince = computed(() => {
  const createdAt = userInfoStore.userInfomation?.created_at;
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
});
</script>
