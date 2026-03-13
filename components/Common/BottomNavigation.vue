<template>
  <nav class="fixed bottom-0 left-0 w-full h-16 bg-elevated border-t z-50 lg:hidden">
    <div class="flex h-full items-center justify-around px-2">
      <NuxtLink
        v-for="item in bottomNavSchema"
        :key="item.link"
        :to="item.link"
        class="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
        :class="{ 'text-primary': isActive(item.link), 'text-muted': !isActive(item.link) }"
      >
        <component 
          :is="iconComponents[item.icon]" 
          :size="24"
          :stroke-width="isActive(item.link) ? 2.5 : 2"
        />
        <span class="text-xs font-medium">{{ $t(item.titleKey) }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { bottomNavSchema } from "./bottomNavSchema";
import { Home, HeartHandshake, BookOpen, Clock } from "lucide-vue-next";

const route = useRoute();

const iconComponents = {
  "home": Home,
  "heart-handshake": HeartHandshake,
  "book-open": BookOpen,
  "clock": Clock,
} as Record<string, any>;

const isActive = (link: string) => {
  if (link === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(link);
};
</script>
