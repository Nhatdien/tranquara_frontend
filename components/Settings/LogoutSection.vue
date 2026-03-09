<template>
  <div class="space-y-3">
    <!-- Logout Button -->
    <UButton
      block
      color="neutral"
      variant="outline"
      size="lg"
      @click="showLogoutConfirm = true"
    >
      <template #leading>
        <LogOut class="w-5 h-5" />
      </template>
      {{ $t('settings.logout.button') }}
    </UButton>

    <!-- Logout Confirmation Modal -->
    <UModal v-model:open="showLogoutConfirm">
      <template #header>
        <span class="font-semibold text-highlighted">{{ $t('settings.logout.confirmTitle') }}</span>
      </template>

      <template #body>
        <p class="text-sm text-muted">
          {{ $t('settings.logout.confirmDesc') }}
        </p>
      </template>

      <template #footer>
        <div class="flex gap-3 justify-end w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="showLogoutConfirm = false"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            color="primary"
            @click="handleLogout"
          >
            {{ $t('settings.logout.confirmButton') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/stores/auth_store';

const authStore = useAuthStore();

const showLogoutConfirm = ref(false);

const handleLogout = async () => {
  showLogoutConfirm.value = false;
  await authStore.logout();
};
</script>
