<template>
  <section>
    <UTabs
      :items="items"
      :default-value="activeValue"
      v-model="activeValue"
      variant="link"
      :ui="{ trigger: 'grow' }"
      class="gap-4 w-full">

      <template #learn>
        <JournalCollectionList :collections="testCollection.collections.filter(collection => collection.type === 'learn')" />
      </template>

      <template #prepare>
        <JournalCollectionList :collections="testCollection.collections.filter(collection => collection.type === 'prepare')" />
      </template>
    </UTabs>

  </section>
</template>

<script lang="ts" setup>
import { testCollection } from "~/mock/testCollection";
import type { TabsItem } from "@nuxt/ui";

const activeValue = ref('0')
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
