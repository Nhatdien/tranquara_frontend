<template>
  <div class="min-h-screen bg-default pb-20">
    <!-- Header -->
    <UContainer class="sticky top-0 z-10 bg-default border-b">
      <div class="flex items-center justify-between py-4">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          @click="$router.back()"
        />
        <h1 class="text-xl font-semibold text-highlighted">Profile & Settings</h1>
        <div class="w-10"></div>
      </div>
    </UContainer>

    <UContainer>
      <!-- User Profile Section -->
      <div class="py-6">
        <UCard>
          <div class="flex items-center gap-4">
            <UAvatar
              :alt="user?.preferred_username || 'User'"
              size="xl"
            >
              <template #fallback>
                <Icon name="lucide:user" class="w-8 h-8" />
              </template>
            </UAvatar>
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-highlighted">{{ user?.preferred_username || 'User' }}</h2>
              <p class="text-sm text-muted">{{ user?.email || 'email@example.com' }}</p>
            </div>
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              @click="editProfile"
            />
          </div>
        </UCard>
      </div>

      <!-- Notifications Section -->
      <div class="space-y-4">
        <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">notifications.</h2>

        <!-- Daily Reflections Card -->
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-highlighted">Daily Reflections</h3>
          </template>

          <div class="space-y-4">
            <!-- Morning Preparation -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-default">Morning Preparation</p>
                  <p class="text-xs text-muted">Start your day mindfully</p>
                </div>
                <USwitch v-model="notifications.morningPreparation.enabled" size="lg" />
              </div>
              <div v-if="notifications.morningPreparation.enabled" class="pl-4">
                <UInput
                  v-model="notifications.morningPreparation.time"
                  type="time"
                  size="sm"
                  :ui="{ base: 'w-auto' }"
                />
              </div>
            </div>

            <USeparator />

            <!-- Evening Reflection -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-default">Evening Reflection</p>
                  <p class="text-xs text-muted">Reflect on your day</p>
                </div>
                <USwitch v-model="notifications.eveningReflection.enabled" size="lg" />
              </div>
              <div v-if="notifications.eveningReflection.enabled" class="pl-4">
                <UInput
                  v-model="notifications.eveningReflection.time"
                  type="time"
                  size="sm"
                  :ui="{ base: 'w-auto' }"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Other Notifications Card -->
        <UCard>
          <template #header>
            <h3 class="text-base font-semibold text-highlighted">Other Notifications</h3>
          </template>

          <div class="space-y-4">
            <!-- Daily Focus -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-default">Daily Focus</p>
                <p class="text-xs text-muted">Set your intention</p>
              </div>
              <USwitch v-model="notifications.dailyFocus.enabled" size="lg" />
            </div>

            <USeparator />

            <!-- Daily Journaling Prompt -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-default">Daily Journaling Prompt</p>
                  <p class="text-xs text-muted">Writing inspiration</p>
                </div>
                <USwitch v-model="notifications.dailyPrompt.enabled" size="lg" />
              </div>
              <div v-if="notifications.dailyPrompt.enabled" class="pl-4">
                <UInput
                  v-model="notifications.dailyPrompt.time"
                  type="time"
                  size="sm"
                  :ui="{ base: 'w-auto' }"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Data & Sync Section -->
      <div class="space-y-4 mt-8">
        <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">data & sync.</h2>
        
        <SyncStatusDashboard 
          :show-stats="true" 
          :show-history="true"
          :show-actions="true"
        />
      </div>

      <!-- Settings Section -->
      <div class="space-y-4 mt-8">
        <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">settings.</h2>

        <UCard>
          <template #body>
            <div class="p-0">
              <div class="divide-y">
            <!-- Dark Mode -->
            <div class="p-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name="lucide:moon" class="w-5 h-5 text-muted" />
                </div>
                <div>
                  <p class="text-sm font-medium text-default">Dark Mode</p>
                  <p class="text-xs text-muted">Always on</p>
                </div>
              </div>
              <USwitch v-model="darkMode" size="lg" disabled />
            </div>

            <!-- Language -->
            <UButton
              to="/settings/language"
              :padded="false"
              color="neutral"
              variant="ghost"
              block
              class="justify-start"
            >
              <div class="p-4 flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="lucide:globe" class="w-5 h-5 text-muted" />
                  </div>
                  <div class="text-left">
                    <p class="text-sm font-medium text-default">Language</p>
                    <p class="text-xs text-muted">English</p>
                  </div>
                </div>
                <Icon name="lucide:chevron-right" class="w-5 h-5 text-muted" />
              </div>
            </UButton>

            <!-- Privacy & Security -->
            <UButton
              to="/settings/privacy"
              :padded="false"
              color="neutral"
              variant="ghost"
              block
              class="justify-start"
            >
              <div class="p-4 flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="lucide:shield" class="w-5 h-5 text-muted" />
                  </div>
                  <div class="text-left">
                    <p class="text-sm font-medium text-default">Privacy & Security</p>
                    <p class="text-xs text-muted">Manage your data</p>
                  </div>
                </div>
                <Icon name="lucide:chevron-right" class="w-5 h-5 text-muted" />
              </div>
            </UButton>

            <!-- Export Data -->
            <UButton
              :padded="false"
              color="neutral"
              variant="ghost"
              block
              class="justify-start"
              @click="handleExportData"
            >
              <div class="p-4 flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="lucide:download" class="w-5 h-5 text-muted" />
                  </div>
                  <div class="text-left">
                    <p class="text-sm font-medium text-default">Export Data</p>
                    <p class="text-xs text-muted">Download your entries</p>
                  </div>
                </div>
                <Icon name="lucide:chevron-right" class="w-5 h-5 text-muted" />
              </div>
            </UButton>
          </div>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Account Actions -->
      <div class="space-y-3 mt-8 mb-6">
        <UButton
          block
          color="neutral"
          variant="outline"
          size="lg"
          @click="handleLogout"
        >
          <template #leading>
            <Icon name="lucide:log-out" class="w-5 h-5" />
          </template>
          Logout
        </UButton>

        <!-- Delete Account Modal -->
        <UModal v-model:open="showDeleteConfirm" title="Delete Account">
          <UButton
            block
            color="error"
            variant="outline"
            size="lg"
          >
            <template #leading>
              <Icon name="lucide:trash-2" class="w-5 h-5" />
            </template>
            Delete Account
          </UButton>

          <template #body>
            <div class="flex items-start gap-3">
              <Icon name="lucide:alert-triangle" class="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-muted">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
            </div>
          </template>

          <template #footer>
            <div class="flex gap-3 justify-end w-full">
              <UButton
                color="neutral"
                variant="ghost"
                @click="showDeleteConfirm = false"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                @click="handleDeleteAccount"
              >
                Delete Account
              </UButton>
            </div>
          </template>
        </UModal>
      </div>

      <!-- App Info -->
      <div class="text-center py-6 space-y-2">
        <p class="text-xs text-muted">TheraPrep v1.0.0</p>
        <div class="flex items-center justify-center gap-3">
          <UButton to="/terms" size="xs" color="neutral" variant="link">Terms</UButton>
          <span class="text-dimmed">•</span>
          <UButton to="/privacy" size="xs" color="neutral" variant="link">Privacy</UButton>
          <span class="text-dimmed">•</span>
          <UButton to="/support" size="xs" color="neutral" variant="link">Support</UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/stores/auth_store";

definePageMeta({
  layout: "detail",
});

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const darkMode = ref(true);
const showDeleteConfirm = ref(false);

// Notification settings
const notifications = ref({
  morningPreparation: {
    enabled: true,
    time: "08:00"
  },
  eveningReflection: {
    enabled: false,
    time: "20:00"
  },
  dailyFocus: {
    enabled: false
  },
  dailyPrompt: {
    enabled: true,
    time: "12:00"
  }
});

const editProfile = () => {
  // TODO: Navigate to profile edit page
  console.log("Edit profile");
};

const handleExportData = () => {
  // TODO: Implement data export
  console.log("Export data");
};

const handleLogout = async () => {
  await authStore.logout();
};

const handleDeleteAccount = async () => {
  // TODO: Implement account deletion
  console.log("Delete account");
  showDeleteConfirm.value = false;
  // await authStore.deleteAccount();
  // await authStore.logout();
};

// Save notification settings when changed
watch(notifications, (newSettings) => {
  // TODO: Save to backend/local storage
  console.log("Notification settings updated:", newSettings);
}, { deep: true });
</script>
