<template>
  <div class="flex flex-col w-full min-h-screen pb-20 px-4">
    <div class="py-6">
      <h1 class="text-3xl font-bold mb-2">Inspirations</h1>
      <p class="text-muted text-sm">Daily prompts and writing ideas</p>
    </div>

    <!-- Daily Prompt Featured -->
    <HomePageDailyPrompt />

    <!-- Past Prompts List -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-4 text-default">Past Prompts</h2>
      
      <div class="space-y-3">
        <div 
          v-for="prompt in pastPrompts" 
          :key="prompt.id"
          class="bg-muted rounded-lg p-4 cursor-pointer hover:bg-accented transition"
          @click="navigateTo(`/journaling?prompt=${prompt.id}`)"
        >
          <p class="text-sm text-default mb-2">{{ prompt.question }}</p>
          <p class="text-xs text-muted">{{ prompt.template }}</p>
        </div>
      </div>
    </div>

    <!-- Quote Collection -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-4 text-default">Inspirational Quotes</h2>
      
      <div class="space-y-4">
        <div 
          v-for="quote in quotes" 
          :key="quote.id"
          class="bg-muted rounded-lg p-5 text-center"
        >
          <p class="text-sm text-default italic mb-2">"{{ quote.text }}"</p>
          <p class="text-xs text-muted">— {{ quote.author }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: Replace with actual data from store/API
const pastPrompts = ref([
  {
    id: 1,
    question: "What made you smile today?",
    template: "Daily Gratitude • Day 1 of 7"
  },
  {
    id: 2,
    question: "Describe a moment when you felt truly alive.",
    template: "Mindful Moments • Day 3 of 7"
  },
  {
    id: 3,
    question: "What's something you're looking forward to?",
    template: "Future Self • Day 2 of 7"
  }
]);

const quotes = ref([
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    id: 2,
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon"
  }
]);
</script>
