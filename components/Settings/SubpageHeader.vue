<template>
  <div class="sticky top-0 z-10 bg-default border-b border-default">
    <UContainer>
      <div class="flex items-center gap-3 py-4">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          @click="$router.back()"
        />
        <h1 class="text-lg font-semibold text-highlighted">{{ title }}</h1>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
