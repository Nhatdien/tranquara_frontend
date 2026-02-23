<template>
  <section class="min-h-screen pb-20">
    <!-- Back Button -->
    <div class="px-4 pt-4">
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

    <!-- Category Not Found -->
    <div v-else-if="categoryTemplates.length === 0" class="text-center py-24 px-4">
      <p class="text-neutral-400 mb-4">No templates found in this category</p>
      <UButton @click="navigateTo('/learn_and_prepare')" variant="outline">
        Back to Library
      </UButton>
    </div>

    <!-- Category Detail -->
    <template v-else>
      <!-- Header -->
      <div class="px-6 pt-8 pb-12 text-center">
        <p class="text-xs text-neutral-400 tracking-[0.3em] uppercase mb-2">Collection</p>
        <h1 class="text-2xl font-bold mb-4">{{ categoryLabel }}</h1>
        <p class="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto">
          {{ categoryDescription }}
        </p>
      </div>

      <!-- Slide Groups Carousel -->
      <div class="flex justify-center gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
        <div
          v-for="(template, templateIndex) in categoryTemplates"
          :key="template.id"
          class="flex-shrink-0 snap-center">
          <div
            v-for="(slideGroup, index) in template.slide_groups"
            :key="slideGroup.id"
            class="w-[85vw] max-w-md min-h-[320px] p-6 rounded-2xl border border-neutral-700 bg-neutral-900/50 flex flex-col mb-4">
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
            <div class="flex justify-center mt-6">
              <UButton
                variant="solid"
                color="neutral"
                size="lg"
                class="px-8 rounded-full bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
                @click="openSlideGroup(slideGroup.id, template.id)">
                Begin
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import { userJournalStore } from "~/stores/stores/user_journal";

definePageMeta({ layout: "detail" });

const { openSlideGroup } = useSlideGroup();
const route = useRoute();
const journalStore = userJournalStore();

const isLoading = ref(true);
const categoryId = computed(() => route.params?.id as string);

// Load templates on mount
onMounted(async () => {
  try {
    await journalStore.getAllTemplates();
  } catch (error) {
    console.error("Error loading templates:", error);
  } finally {
    isLoading.value = false;
  }
});

// Get category label from ID
const categoryLabel = computed(() => {
  // Convert hyphenated ID back to readable label
  const id = categoryId.value || "";
  return id
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

// Generate description based on category
const categoryDescription = computed(() => {
  const label = categoryLabel.value.toLowerCase();
  if (label.includes("check")) {
    return "Quick check-ins and reflections to help you stay connected with your thoughts and emotions throughout the day.";
  }
  if (label.includes("daily") || label.includes("essential")) {
    return "Essential daily practices and prompts to build healthy habits and maintain mental wellness.";
  }
  if (label.includes("well") || label.includes("sos")) {
    return "Support and guidance for challenging moments when you need immediate help and comfort.";
  }
  if (label.includes("bed") || label.includes("sleep")) {
    return "Calming exercises and reflections to help you unwind and prepare for restful sleep.";
  }
  return `A collection of lessons and journal prompts to help you explore and understand ${categoryLabel.value}.`;
});

// Filter templates by category
const categoryTemplates = computed(() => {
  const id = categoryId.value || "";
  return journalStore.templates.filter(template => {
    const templateCategory = template.category?.toLowerCase().replace(/\s+/g, "-");
    return templateCategory === id;
  });
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
