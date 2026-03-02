<template>
  <div class="space-y-4">
    <h2 class="text-sm font-semibold text-muted uppercase tracking-wider px-1">ai & privacy.</h2>

    <UCard>
      <div class="divide-y divide-default">
        <!-- AI Personalization Toggle -->
        <div class="py-4 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Bot class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">AI Personalization</p>
                <p class="text-xs text-muted">Personalized questions & insights</p>
              </div>
            </div>
            <USwitch
              :model-value="settingsStore.aiEnabled"
              size="lg"
              @update:model-value="handleAIToggle"
            />
          </div>
        </div>

        <!-- Your Story -->
        <div class="py-4 first:pt-0 last:pb-0">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <BookOpen class="w-5 h-5 text-muted" />
            </div>
            <div>
              <p class="text-sm font-medium text-default">Your Story</p>
              <p class="text-xs text-muted">Help AI understand your context</p>
            </div>
          </div>
          <div :class="{ 'opacity-50 pointer-events-none': !settingsStore.aiEnabled }">
            <UTextarea
              v-model="storyDraft"
              placeholder="e.g. I'm preparing for my first therapy session and dealing with work-related anxiety..."
              :rows="3"
              :maxlength="500"
              autoresize
              class="w-full"
              @blur="saveStory"
            />
            <p class="text-xs text-muted text-right mt-1">{{ storyDraft.length }}/500</p>
          </div>
        </div>

        <!-- Data Collection -->
        <div class="py-4 first:pt-0 last:pb-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <BarChart3 class="w-5 h-5 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium text-default">Analytics</p>
                <p class="text-xs text-muted">Help improve the app</p>
              </div>
            </div>
            <USwitch
              :model-value="settingsStore.dataCollection"
              size="lg"
              @update:model-value="handleDataCollection"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- AI Disabled Warning -->
    <UAlert
      v-if="showAIDisabledWarning"
      color="warning"
      icon="i-lucide-alert-triangle"
      title="AI features disabled"
      description="Journal entries will be saved normally but won't receive personalized follow-up questions or AI insights."
      :close="true"
      @close="showAIDisabledWarning = false"
    />
  </div>
</template>

<script setup lang="ts">
import { Bot, BookOpen, BarChart3 } from 'lucide-vue-next';
import { useSettingsStore } from '~/stores/stores/settings_store';

const settingsStore = useSettingsStore();
const toast = useToast();

// ─── Your Story ─────────────────────────────────────────────────────────────

const storyDraft = ref(settingsStore.yourStory);

// Keep draft in sync if store changes externally
watch(() => settingsStore.yourStory, (newVal) => {
  storyDraft.value = newVal;
});

const saveStory = async () => {
  if (storyDraft.value !== settingsStore.yourStory) {
    await settingsStore.setYourStory(storyDraft.value);
    toast.add({
      title: 'Your story updated',
      icon: 'i-lucide-check',
      color: 'success',
    });
  }
};

// ─── AI Toggle ──────────────────────────────────────────────────────────────

const showAIDisabledWarning = ref(false);

const handleAIToggle = async (value: boolean) => {
  if (!value) {
    showAIDisabledWarning.value = true;
  } else {
    showAIDisabledWarning.value = false;
  }
  await settingsStore.setAIEnabled(value);
};

// ─── Data Collection ────────────────────────────────────────────────────────

const handleDataCollection = async (value: boolean) => {
  await settingsStore.setDataCollection(value);
};
</script>
