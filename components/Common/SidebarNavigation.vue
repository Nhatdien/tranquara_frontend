<template>
  <aside class="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-elevated border-r border-default z-50">
    <!-- Logo / Branding -->
    <div class="px-6 py-6">
      <NuxtLink to="/" class="flex items-center gap-2">
        <h1 class="text-xl font-bold text-primary">TheraPrep</h1>
      </NuxtLink>
      <p class="text-xs text-muted mt-1">{{ $t('app.name') }}</p>
    </div>

    <!-- New Journal Action -->
    <div class="px-3 mb-4">
      <UButton
        block
        color="primary"
        variant="solid"
        size="md"
        class="justify-start gap-2"
        @click="navigateTo('/journaling')"
      >
        <PenLine :size="18" />
        <span>{{ $t('nav.newJournal') }}</span>
      </UButton>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 px-3 space-y-1">
      <NuxtLink
        v-for="item in bottomNavSchema"
        :key="item.link"
        :to="item.link"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        :class="isActive(item.link)
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:bg-accented hover:text-default'
        "
      >
        <component
          :is="iconComponents[item.icon]"
          :size="20"
          :stroke-width="isActive(item.link) ? 2.5 : 2"
        />
        <span class="text-sm font-medium">{{ $t(item.titleKey) }}</span>
      </NuxtLink>
    </nav>

    <!-- Bottom Section: Profile -->
    <div class="px-3 pb-4 border-t border-default pt-3">
      <NuxtLink
        to="/profile"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        :class="isActive('/profile')
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:bg-accented hover:text-default'
        "
      >
        <User :size="20" :stroke-width="isActive('/profile') ? 2.5 : 2" />
        <span class="text-sm font-medium">{{ $t('nav.profile') }}</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { bottomNavSchema } from "./bottomNavSchema";
import { Home, HeartHandshake, BookOpen, Clock, User, PenLine } from "lucide-vue-next";

const route = useRoute();

const iconComponents: Record<string, any> = {
  "home": Home,
  "heart-handshake": HeartHandshake,
  "book-open": BookOpen,
  "clock": Clock,
};

const isActive = (link: string) => {
  if (link === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(link);
};
</script>
