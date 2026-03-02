<template>
  <div class="space-y-4">
    <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">data management.</h2>

    <UCard>
      <div class="divide-y divide-default">
        <!-- Export Data -->
        <UButton
          :padded="false"
          color="neutral"
          variant="ghost"
          block
          class="justify-start"
          @click="handleExportData"
        >
          <div class="py-4 flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Download class="w-5 h-5 text-muted" />
              </div>
              <div class="text-left">
                <p class="text-sm font-medium text-default">Export Data</p>
                <p class="text-xs text-muted">Download your entries as JSON</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-muted" />
          </div>
        </UButton>

        <!-- Delete Account -->
        <UButton
          :padded="false"
          color="neutral"
          variant="ghost"
          block
          class="justify-start"
          @click="showDeleteModal = true"
        >
          <div class="py-4 flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <Trash2 class="w-5 h-5 text-error" />
              </div>
              <div class="text-left">
                <p class="text-sm font-medium text-error">Delete Account</p>
                <p class="text-xs text-muted">Permanently delete all data</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-muted" />
          </div>
        </UButton>
      </div>
    </UCard>

    <!-- Delete Account Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #header>
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-error" />
          <span class="font-semibold text-highlighted">Delete Account</span>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <!-- Step 1: Warning -->
          <div v-if="deleteStep === 1" class="space-y-4">
            <p class="text-sm text-muted">
              This will permanently delete all your data including:
            </p>
            <ul class="text-sm text-muted space-y-1 ml-4">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-error rounded-full" />
                Journal entries
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-error rounded-full" />
                Learning progress
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-error rounded-full" />
                AI memory & context
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-error rounded-full" />
                Account settings
              </li>
            </ul>
            <UAlert
              color="warning"
              icon="i-lucide-download"
              title="Download your data first?"
              description="We recommend exporting your data before deleting your account."
            />
          </div>

          <!-- Step 2: Confirm with username -->
          <div v-if="deleteStep === 2" class="space-y-4">
            <p class="text-sm text-muted">
              Enter your username <strong class="text-highlighted">{{ username }}</strong> to confirm deletion:
            </p>
            <UInput
              v-model="confirmUsername"
              placeholder="Enter username"
              :color="confirmError ? 'error' : undefined"
            />
            <p v-if="confirmError" class="text-xs text-error">
              Username does not match
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex gap-3 justify-end w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="cancelDelete"
          >
            Cancel
          </UButton>

          <template v-if="deleteStep === 1">
            <UButton
              color="neutral"
              variant="outline"
              @click="handleExportData"
            >
              <template #leading>
                <Download class="w-4 h-4" />
              </template>
              Export First
            </UButton>
            <UButton
              color="error"
              @click="deleteStep = 2"
            >
              Continue
            </UButton>
          </template>

          <template v-if="deleteStep === 2">
            <UButton
              color="error"
              :loading="deleting"
              :disabled="!confirmUsername"
              @click="confirmDelete"
            >
              Delete Account
            </UButton>
          </template>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { Download, Trash2, ChevronRight, AlertTriangle } from 'lucide-vue-next';
import { useAuthStore } from '~/stores/stores/auth_store';
import { useSettingsStore } from '~/stores/stores/settings_store';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const toast = useToast();

const username = computed(() => authStore.user?.preferred_username || '');

// ─── Export ─────────────────────────────────────────────────────────────────

const handleExportData = () => {
  // TODO: Implement data export in a future phase
  toast.add({
    title: 'Export coming soon',
    description: 'Data export will be available in a future update.',
    icon: 'i-lucide-info',
    color: 'info',
  });
};

// ─── Delete Account ─────────────────────────────────────────────────────────

const showDeleteModal = ref(false);
const deleteStep = ref(1);
const confirmUsername = ref('');
const confirmError = ref(false);
const deleting = ref(false);

const cancelDelete = () => {
  showDeleteModal.value = false;
  deleteStep.value = 1;
  confirmUsername.value = '';
  confirmError.value = false;
};

const confirmDelete = async () => {
  if (confirmUsername.value !== username.value) {
    confirmError.value = true;
    return;
  }

  confirmError.value = false;
  deleting.value = true;

  try {
    // Clear all local settings data
    await settingsStore.clearLocalData();

    // TODO: Call backend DELETE /api/account when ready

    // Log out the user
    await authStore.logout();

    toast.add({
      title: 'Account deleted',
      description: 'All your data has been removed.',
      icon: 'i-lucide-check',
      color: 'success',
    });
  } catch (error) {
    console.error('Failed to delete account:', error);
    toast.add({
      title: 'Deletion failed',
      description: 'Please try again later.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
    });
  } finally {
    deleting.value = false;
    cancelDelete();
  }
};

// Reset confirm error when user types
watch(confirmUsername, () => {
  confirmError.value = false;
});
</script>
