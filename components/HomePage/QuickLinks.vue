<template>
  <section class="flex">
    <div class="grid flex-1 grid-cols-2 gap-4">
      <UButton
        v-for="item in cardItems"
        variant="link"
        :key="item.title"
        class="flex flex-1 flex-col items-start justify-center p-6 gap-2"
        :ui="{
          base: 'border border-gray-600 hover:bg-gray-800',
        }">
        <div class="flex items-center gap-2 mb-2">
          <component :is="item.icon" class="w-8 h-8" />
          <span class="font-semibold">{{ item.title }}</span>
        </div>
        <p class="text-center text-sm text-gray-400">{{ item.description }}</p>
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Book, ClipboardCheck } from "lucide-vue-next";

const cardItems = [
  {
    title: "New Entry",
    description:
      "Start a new journal entry to reflect on your thoughts and feelings.",
    icon: Book,
    link: "/journal",
  },
  {
    title: "Therapy Prep",
    description: "Prepare for your therapy sessions with helpful resources.",
    icon: ClipboardCheck,
    link: "/library",
  },
];
</script>
