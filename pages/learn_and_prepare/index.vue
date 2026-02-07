<template>
  <section class="px-4 py-6 pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Library</h1>
      <UButton variant="ghost" size="lg" icon="i-lucide-user" class="rounded-full" />
    </div>

    <!-- Sync Status Banner -->
    <div
      v-if="!journalStore.isOnline"
      class="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
      <Icon name="i-lucide-wifi-off" class="w-5 h-5 text-yellow-500" />
      <span class="text-sm text-yellow-500">Working offline - templates from cache</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <Icon name="i-lucide-loader" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Featured Section -->
      <div class="flex flex-col gap-3 mb-8">
        <div
          v-for="featured in featuredCollections"
          :key="featured.id"
          class="flex items-center rounded-xl border border-neutral-700 bg-neutral-900/50 overflow-hidden cursor-pointer hover:bg-neutral-800/50 transition-colors"
          @click="navigateTo(`/learn_and_prepare/collection/${featured.id}`)">
          <div class="w-24 h-20 flex items-center justify-center bg-neutral-800 shrink-0">
            <component :is="getFeaturedIcon(featured.category)" class="w-10 h-10 text-neutral-300" />
          </div>
          <div class="flex-1 px-4 py-3">
            <p class="text-xs text-neutral-400 mb-1">Featured</p>
            <p class="font-medium">{{ featured.title }}</p>
          </div>
          <Icon name="i-lucide-chevron-right" class="w-5 h-5 text-neutral-500 mr-4" />
        </div>
      </div>

      <!-- Collections Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Collections</h2>
          <NuxtLink to="/learn_and_prepare/collections" class="text-sm text-neutral-400 flex items-center gap-1 hover:text-neutral-200">
            See All
            <Icon name="i-lucide-chevron-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
        
        <!-- Collection Cards (Horizontal Scroll) -->
        <div class="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div
            v-for="collection in displayedCollections"
            :key="collection.id"
            class="flex-shrink-0 w-72 p-5 rounded-xl border border-neutral-700 bg-neutral-900/50 cursor-pointer hover:bg-neutral-800/50 transition-colors"
            @click="navigateTo(`/learn_and_prepare/collection/${collection.id}`)">
            <div class="flex items-start gap-4">
              <div class="w-16 h-24 flex items-center justify-center">
                <component :is="getCollectionIcon(collection.category)" class="w-12 h-20 text-neutral-300" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold mb-1">{{ collection.title }}</h3>
                <p class="text-sm text-neutral-400 mb-3">{{ collection.slide_groups?.length || 0 }} chapters</p>
                <UProgress :model-value="getCollectionProgress(collection.id)" size="sm" color="neutral" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Categories Section -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">All Categories</h2>
        
        <!-- Category Tabs (Horizontal Scroll) -->
        <div class="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide mb-4">
          <button
            v-for="category in categories"
            :key="category.id"
            class="flex flex-col items-center gap-2 px-4 py-2 rounded-lg shrink-0 transition-colors"
            :class="selectedCategory === category.id ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'"
            @click="selectedCategory = category.id">
            <component :is="category.icon" class="w-6 h-6" />
            <span class="text-xs whitespace-nowrap">{{ category.label }}</span>
          </button>
        </div>

        <!-- Category Cards Grid -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div
            v-for="template in categoryTemplates"
            :key="template.id"
            class="p-4 rounded-xl border border-neutral-700 bg-neutral-900/50 cursor-pointer hover:bg-neutral-800/50 transition-colors"
            @click="navigateTo(`/learn_and_prepare/collection/${template.id}`)">
            <h3 class="font-medium text-sm mb-2 line-clamp-2">{{ template.title }}</h3>
            <p class="text-xs text-neutral-400">{{ template.slide_groups?.length || 0 }} questions</p>
          </div>
        </div>

        <!-- See All Link -->
        <NuxtLink 
          v-if="categoryTemplates.length > 0"
          :to="`/learn_and_prepare/category/${selectedCategory}`" 
          class="flex items-center justify-center gap-1 text-sm text-neutral-400 hover:text-neutral-200">
          See All {{ totalCategoryCount }} Journals on {{ selectedCategoryLabel }}
          <Icon name="i-lucide-chevron-right" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Mindful Exercises Section -->
      <!-- <div>
        <h2 class="text-xl font-semibold mb-4">Mindful Exercises</h2>
        <div class="flex flex-col gap-3">
          <div
            v-for="exercise in mindfulExercises"
            :key="exercise.id"
            class="flex items-center rounded-xl border border-neutral-700 bg-neutral-900/50 overflow-hidden cursor-pointer hover:bg-neutral-800/50 transition-colors"
            @click="navigateTo(`/exercises/${exercise.id}`)">
            <div class="w-24 h-16 flex items-center justify-center bg-neutral-800 shrink-0">
              <component :is="exercise.icon" class="w-10 h-10 text-neutral-300" />
            </div>
            <div class="flex-1 px-4 py-3">
              <p class="font-medium">{{ exercise.title }}</p>
            </div>
            <Icon name="i-lucide-chevron-right" class="w-5 h-5 text-neutral-500 mr-4" />
          </div>
        </div>
      </div> -->
    </template>
  </section>
</template>

<script lang="ts" setup>
import { userJournalStore } from "~/stores/stores/user_journal";
import { 
  Feather, 
  Sun, 
  Leaf, 
  CheckSquare, 
  Umbrella, 
  Cloud, 
  Moon,
  Wind,
  CircleDot,
  Heart,
  Brain,
  Sparkles,
  AlertCircle,
  Users,
  Smile
} from "lucide-vue-next";

const journalStore = userJournalStore();
const isLoading = ref(true);
const selectedCategory = ref("check-ins");

// Load templates on mount
onMounted(async () => {
  try {
    console.log("calling get templates");
    await journalStore.getAllTemplates();
  } catch (error) {
    console.error("Error loading templates:", error);
  } finally {
    isLoading.value = false;
  }
});

// Featured collections (first 2)
const featuredCollections = computed(() => {
  return journalStore.templates.slice(0, 2);
});

// Display collections (for horizontal scroll, max 5)
const displayedCollections = computed(() => {
  return journalStore.templates.slice(0, 5);
});

// Category icon mapping
const categoryIconMap: Record<string, any> = {
  // Check-ins & Daily
  "check-in": CheckSquare,
  "check-ins": CheckSquare,
  "daily": Umbrella,
  "essential": Umbrella,
  "daily-essentials": Umbrella,
  // Well-being & Mental Health
  "well-being": Cloud,
  "wellbeing": Cloud,
  "wellness": Cloud,
  "sos": Cloud,
  "mental_health": Brain,
  "mental-health": Brain,
  // Sleep
  "bedtime": Moon,
  "sleep": Moon,
  "night": Moon,
  // Therapy & Journaling
  "therapy": Feather,
  "prepare": Feather,
  "journal": Feather,
  // Mindfulness & Meditation
  "mindfulness": Wind,
  "meditation": CircleDot,
  // Anxiety
  "anxiety": AlertCircle,
  "worry": AlertCircle,
  // Relationships
  "relationship": Heart,
  "relationships": Heart,
  "connection": Users,
  // Gratitude & Positivity
  "gratitude": Sparkles,
  "positivity": Sun,
  // Emotions
  "emotion": Brain,
  "emotions": Brain,
  // Self-care
  "self_care": Heart,
  "self-care": Heart,
  "compassion": Smile,
};

// Get icon for a category
const getCategoryIcon = (category: string) => {
  const lower = category?.toLowerCase() || "";
  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (lower.includes(key)) return icon;
  }
  return Leaf; // Default icon
};

// Dynamic categories from templates
const categories = computed(() => {
  const uniqueCategories = new Map<string, { id: string; label: string; icon: any; count: number }>();
  
  journalStore.templates.forEach(template => {
    const category = template.category?.trim();
    if (category) {
      const id = category.toLowerCase().replace(/\s+/g, '-');
      if (!uniqueCategories.has(id)) {
        uniqueCategories.set(id, {
          id,
          label: category,
          icon: getCategoryIcon(category),
          count: 1,
        });
      } else {
        uniqueCategories.get(id)!.count++;
      }
    }
  });
  
  return Array.from(uniqueCategories.values());
});

// Set default selected category when categories load
watch(categories, (newCategories) => {
  if (newCategories.length > 0 && !newCategories.find(c => c.id === selectedCategory.value)) {
    selectedCategory.value = newCategories[0].id;
  }
}, { immediate: true });

const selectedCategoryLabel = computed(() => {
  return categories.value.find(c => c.id === selectedCategory.value)?.label || "";
});

// Filter templates by selected category
const categoryTemplates = computed(() => {
  const selectedCat = categories.value.find(c => c.id === selectedCategory.value);
  if (!selectedCat) return [];
  
  return journalStore.templates.filter(template => {
    const templateCategory = template.category?.toLowerCase().replace(/\s+/g, '-');
    return templateCategory === selectedCategory.value;
  }).slice(0, 6);
});

const totalCategoryCount = computed(() => {
  const selectedCat = categories.value.find(c => c.id === selectedCategory.value);
  return selectedCat?.count || categoryTemplates.value.length;
});

// Mindful exercises (static for now)
const mindfulExercises = [
  { id: "breathing", title: "Breathing", icon: Wind },
  { id: "meditation", title: "Meditation", icon: CircleDot },
];

// Helper functions
const getFeaturedIcon = (category: string) => {
  const lower = category?.toLowerCase() || "";
  if (lower.includes("therapy")) return Feather;
  if (lower.includes("ode")) return Sun;
  return Leaf;
};

const getCollectionIcon = (category: string) => {
  const lower = category?.toLowerCase() || "";
  if (lower.includes("adhd")) return Leaf;
  if (lower.includes("anxiety")) return Cloud;
  return Feather;
};

const getCollectionProgress = (collectionId: string) => {
  // TODO: Implement actual progress tracking
  return Math.floor(Math.random() * 60) + 10;
};</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
