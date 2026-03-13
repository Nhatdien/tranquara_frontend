<template>
  <!-- Desktop breadcrumbs (hidden on mobile where back button is used) -->
  <nav v-if="items.length > 0" class="hidden lg:block mb-4">
    <UBreadcrumb :items="items" />
  </nav>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
