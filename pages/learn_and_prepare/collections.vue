<template>
  <section class="min-h-screen pb-20 lg:pb-0">
    <!-- Desktop Breadcrumbs -->
    <div class="px-4 pt-4">
      <DesktopBreadcrumb :items="breadcrumbs" />
    </div>

    <!-- Back Button (mobile) -->
    <div class="px-4 pt-4 lg:hidden">
      <UButton 
        variant="ghost" 
        size="lg" 
        icon="i-lucide-chevron-left" 
        class="p-0"
        @click="navigateTo('/learn_and_prepare')" 
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-24">
      <Icon name="i-lucide-loader" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="px-6 pt-8 pb-8 text-center">
        <h1 class="text-3xl font-bold mb-3">{{ $t('learnSub.collections') }}</h1>
        <p class="text-muted text-sm leading-relaxed max-w-sm mx-auto">
          {{ $t('learnSub.collectionsDescription') }}
        </p>
      </div>

      <!-- Collections List -->
      <div class="px-4 flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="collection in allCollections"
          :key="collection.id"
          class="p-5 rounded-2xl border border-default bg-elevated cursor-pointer hover:bg-muted hover:shadow-sm transition-all"
          @click="navigateTo(`/learn_and_prepare/collection/${collection.id}`)">
          <div class="flex items-center gap-5">
            <!-- Icon -->
            <div class="w-20 h-28 flex items-center justify-center shrink-0">
              <component :is="getCollectionIcon(collection.category, collection.title)" class="w-14 h-20 text-default" />
            </div>
            
            <!-- Content -->
            <div class="flex-1">
              <h3 class="font-semibold text-lg mb-1">{{ collection.title }}</h3>
              <p class="text-sm text-muted mb-4">{{ $t('learnSub.chapters', { count: collection.slide_groups?.length || 0 }) }}</p>
              <UProgress :model-value="getCollectionProgress(collection.id)" size="md" color="neutral" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'
import { userJournalStore } from "~/stores/stores/user_journal";
import { useLearnedStore } from "~/stores/stores/user_learned";
import { 
  Feather, 
  Moon, 
  Leaf, 
  Cloud, 
  Sun,
  Heart,
  Brain,
  Sparkles,
  AlertCircle,
  Wind,
  Smile,
  CheckSquare
} from "lucide-vue-next";

const { t } = useI18n();
const journalStore = userJournalStore();
const learnedStore = useLearnedStore();
const isLoading = ref(true);

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.library'), icon: 'i-lucide-book-open', to: '/learn_and_prepare' },
  { label: t('learnSub.collections') },
])

// Load templates and progress on mount
onMounted(async () => {
  try {
    await Promise.all([
      journalStore.getAllTemplates(),
      learnedStore.loadFromLocal(),
    ]);
  } catch (error) {
    console.error("Error loading templates:", error);
  } finally {
    isLoading.value = false;
  }
});

// Only learn-type collections
const allCollections = computed(() => {
  return journalStore.templates.filter(t => t.type === 'learn');
});

// Get icon based on category or title keywords
const getCollectionIcon = (category: string, title: string) => {
  const text = `${category || ""} ${title || ""}`.toLowerCase();
  
  // Sleep
  if (text.includes("sleep") || text.includes("night") || text.includes("bedtime")) return Moon;
  // Journaling
  if (text.includes("journal")) return Feather;
  // Anxiety
  if (text.includes("anxiety") || text.includes("worry")) return AlertCircle;
  // Stress & Mental Health
  if (text.includes("stress") || text.includes("mental")) return Cloud;
  // ADHD & Mind
  if (text.includes("adhd") || text.includes("mind") || text.includes("emotion")) return Brain;
  // Relationships
  if (text.includes("love") || text.includes("relationship")) return Heart;
  // Gratitude & Joy
  if (text.includes("gratitude") || text.includes("happy") || text.includes("joy")) return Sparkles;
  // Therapy
  if (text.includes("therapy") || text.includes("preparation")) return Feather;
  // Mindfulness
  if (text.includes("mindful")) return Wind;
  // Self-compassion
  if (text.includes("compassion") || text.includes("self-care") || text.includes("self_care")) return Smile;
  // Check-ins
  if (text.includes("check") || text.includes("daily") || text.includes("reflection")) return CheckSquare;
  // Positivity
  if (text.includes("positiv")) return Sun;
  
  return Feather; // Default icon
};

// Get collection progress from learned store
const getCollectionProgress = (collectionId: string) => {
  const collection = allCollections.value.find(c => c.id === collectionId);
  const totalSlideGroups = collection?.slide_groups?.length || 0;
  if (totalSlideGroups === 0) return 0;
  return learnedStore.getProgress(collectionId, totalSlideGroups);
};
</script>
