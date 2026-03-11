<template>
  <section class="min-h-screen pb-20">
    <!-- Back Button -->
    <div class="px-4 pt-4">
      <UButton 
        variant="ghost" 
        size="lg" 
        icon="i-lucide-chevron-left" 
        class="p-0"
        @click="navigateTo(backPath)" 
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-24">
      <Icon name="i-lucide-loader" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Collection Not Found -->
    <div v-else-if="!currentCollection" class="text-center py-24 px-4">
      <p class="text-neutral-400 mb-4">{{ $t('journal.collectionNotFound') }}</p>
      <UButton @click="navigateTo(backPath)" variant="outline">
        {{ $t('journal.backToLibrary') }}
      </UButton>
    </div>

    <!-- Collection Detail -->
    <template v-else>
      <!-- Header -->
      <div class="px-6 pt-8 pb-12 text-center">
        <p class="text-xs text-neutral-400 tracking-[0.3em] uppercase mb-2">{{ $t('common.collection') }}</p>
        <h1 class="text-2xl font-bold mb-4">{{ currentCollection.title }}</h1>
        <p class="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto">
          {{ currentCollection.description }}
        </p>
      </div>

      <!-- Slide Groups Carousel -->
      <div class="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
        <div
          v-for="(slideGroup, index) in currentCollection.slide_groups"
          :key="slideGroup.id"
          class="flex-shrink-0 w-[85vw] max-w-md min-h-[320px] p-6 rounded-2xl border border-neutral-700 bg-neutral-900/50 flex flex-col snap-center">
          <!-- Chapter Number -->
          <div class="flex justify-end mb-8">
            <span class="text-neutral-500 text-sm font-medium">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h2 class="text-xl font-bold mb-3 uppercase">{{ slideGroup.title }}</h2>
            <p class="text-neutral-400 text-sm leading-relaxed">
              {{ slideGroup.description }}
            </p>
          </div>

          <!-- Begin Button -->
          <div class="flex flex-col items-center mt-6 gap-4">
            <UButton
              variant="solid"
              color="neutral"
              size="lg"
              class="px-8 rounded-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
              @click="openSlideGroup(slideGroup.id, currentCollection.id)">
              {{ $t('common.begin') }}
            </UButton>
            <!-- Completed tick -->
            <div v-if="learnedStore.isSlideGroupCompleted(currentCollection.id, slideGroup.id)" class="flex items-center gap-1">
              <Icon name="i-lucide-check-circle" class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { userJournalStore } from "~/stores/stores/user_journal";
import { useLearnedStore } from "~/stores/stores/user_learned";
import type { LocalTemplate } from "~/types/user_journal";

const { openSlideGroup } = useSlideGroup();
const route = useRoute();
const journalStore = userJournalStore();
const learnedStore = useLearnedStore();

const isLoading = ref(true);
const collectionId = computed(() => route.params?.id as string);
const backPath = computed(() =>
  route.path.startsWith('/toolkit/journey') ? '/toolkit/journey' : '/learn_and_prepare'
);

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
    // Load learned progress
    await learnedStore.loadFromLocal();
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

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
