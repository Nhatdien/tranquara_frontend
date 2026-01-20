<template>
  <section>
    <!-- Sync Status Banner -->
    <div
      v-if="!journalStore.isOnline"
      class="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
      <Icon name="i-lucide-wifi-off" class="w-5 h-5 text-yellow-500" />
      <span class="text-sm text-yellow-500"
        >Working offline - templates from cache</span
      >
    </div>

    <!-- Refresh Button -->
    <div v-if="journalStore.isOnline" class="mb-4 flex justify-end">
      <UButton
        @click="refreshTemplates"
        :loading="isRefreshing"
        variant="ghost"
        size="sm">
        <Icon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2" />
        Refresh Templates
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <Icon name="i-lucide-loader" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <JournalCollectionList :collections="allCollections" />
  </section>
</template>

<script lang="ts" setup>
import { userJournalStore } from "~/stores/stores/user_journal";
import type { TabsItem } from "@nuxt/ui";

const journalStore = userJournalStore();
const isLoading = ref(true);
const isRefreshing = ref(false);
const activeValue = ref("0");

// Load templates on mount
onMounted(async () => {
  try {
    // Database already initialized by 02.database.client.ts plugin
    console.log("calling get templates");

    await journalStore.getAllTemplates();
  } catch (error) {
    console.error("Error loading templates:", error);
  } finally {
    isLoading.value = false;
  }
});

// Refresh templates from server
const refreshTemplates = async () => {
  isRefreshing.value = true;
  try {
    await journalStore.refreshTemplatesFromServer();
  } catch (error) {
    console.error("Error refreshing templates:", error);
  } finally {
    isRefreshing.value = false;
  }
};

// Filter templates by category
const allCollections = computed(() => {
  return journalStore.templates;
});

const prepareCollections = computed(() => {
  return journalStore.templates.filter(
    (template) =>
      template.category?.toLowerCase() === "prepare" ||
      template.category?.toLowerCase() === "therapy preparation",
  );
});

const items = [
  {
    label: "Prepare",
    description:
      "Get ready for therapy with guided prompts, reflections, and practical tips to make your first sessions easier.",
    icon: "i-lucide-lock",
    slot: "prepare" as const,
  },
  {
    label: "Learn",
    description:
      "Explore lessons and resources to better understand emotions, journaling, and the therapy process step by step.",
    icon: "i-lucide-user",
    slot: "learn" as const,
  },
] satisfies TabsItem[];
</script>
