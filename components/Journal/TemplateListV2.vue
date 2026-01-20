<template>
  <section>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <Icon name="i-lucide-loader" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Collection Not Found -->
    <div v-else-if="!currentCollection" class="text-center py-12">
      <p class="text-muted mb-4">Collection not found</p>
      <UButton @click="navigateTo('/learn_and_prepare')" variant="outline">
        Back to Collections
      </UButton>
    </div>

    <!-- Collection Detail -->
    <section v-else>
      <div class="mt-8">
        <p class="text-neutral-400 text-center text-sm">
          {{ currentCollection?.slide_groups?.length }} lessons
        </p>
        <h1 class="text-center">{{ currentCollection.title }}</h1>
        <p class="text-neutral-400 text-center text-sm">
          {{ currentCollection.description }}
        </p>
        
        <!-- Slide Groups List -->
        <div class="flex flex-col gap-4 items-center mt-4 overflow-x-scroll">
          <JournalTemplateCardV2
            v-for="slide_group in currentCollection.slide_groups"
            :key="slide_group.id"
            class="flex-1/3 w-full cursor-pointer"
            :slide_group="slide_group"
            @click="openSlideGroup(slide_group.id, currentCollection.id)" />
        </div>
      </div>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { userJournalStore } from "~/stores/stores/user_journal";
import type { LocalTemplate } from "~/types/user_journal";

const { openSlideGroup } = useSlideGroup();
const route = useRoute();
const journalStore = userJournalStore();

const isLoading = ref(true);
const collectionId = computed(() => route.params?.id as string);

// Load templates and find current collection
onMounted(async () => {
  try {
    // Wait for database to be ready if not initialized
    if (!journalStore.isInitialized) {
      console.log('[TemplateList] Waiting for database initialization...');
      // Give it some time to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await journalStore.getAllTemplates();
  } catch (error) {
    console.error('Error loading templates:', error);
  } finally {
    isLoading.value = false;
  }
});

// Find collection by ID from route params
const currentCollection = computed(() => {
  if (!collectionId.value) return null;
  return journalStore.templates.find(
    (template: LocalTemplate) => template.id === collectionId.value
  );
});
</script>
