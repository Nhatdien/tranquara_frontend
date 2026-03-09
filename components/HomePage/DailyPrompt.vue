<template>
  <div class="px-4 mb-6">
    <h2 class="text-lg font-semibold mb-3 text-default">{{ $t('home.dailyPrompt') }}</h2>
    
    <!-- Prompt Card -->
    <div class="bg-muted rounded-xl p-6 mb-4">
      <p class="text-lg text-center text-default mb-4 leading-relaxed">
        {{ prompt.question }}
      </p>
      
      <p class="text-xs text-center text-muted mb-4">
        {{ prompt.template }} • {{ $t('home.dayOf', { day: prompt.day, total: prompt.totalDays }) }}
      </p>
      
      <UButton
        block
        size="lg"
        color="primary"
        @click="startWriting"
        class="font-semibold"
      >
        {{ $t('home.startWriting') }}
      </UButton>
    </div>

    <!-- Quote Section -->
    <div class="text-center">
      <p class="text-sm text-toned mb-2 italic">
        "{{ quote.text }}"
      </p>
      <p class="text-xs text-muted">{{ quote.author }}</p>
    </div>

    <!-- Action Icons -->
    <div class="flex justify-center gap-4 mt-4">
      <button class="p-3 rounded-full border hover:bg-muted transition">
        <Star class="w-5 h-5 text-muted" />
      </button>
      <button class="p-3 rounded-full border hover:bg-muted transition">
        <PenLine class="w-5 h-5 text-muted" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, PenLine } from "lucide-vue-next";

// TODO: Replace with actual data from store/API
const prompt = ref({
  question: "When you think \"I'd do this again,\" what's the first memory that pops up?",
  template: "On It Was Worth It",
  day: 5,
  totalDays: 7
});

const quote = ref({
  text: "Stories of imagination tend to upset those without one.",
  author: "Terry Pratchett"
});

const startWriting = () => {
  // TODO: Navigate to journal entry with this prompt
  navigateTo('/journaling');
};
</script>
