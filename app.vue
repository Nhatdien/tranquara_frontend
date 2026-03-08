<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { useSettingsStore } from "~/stores/stores/settings_store";
import type { FontSize } from "~/types/settings";

const config = useRuntimeConfig();
const settingsStore = useSettingsStore();

// ─── Apply font size to <html> element reactively ─────────────────────────
const fontSizeMap: Record<FontSize, string> = {
  small: 'app-font-small',
  medium: 'app-font-medium',
  large: 'app-font-large',
};

watch(
  () => settingsStore.fontSize,
  (newSize, oldSize) => {
    if (import.meta.client) {
      const html = document.documentElement;
      // Remove previous font size class
      if (oldSize) html.classList.remove(fontSizeMap[oldSize]);
      html.classList.add(fontSizeMap[newSize]);
    }
  },
  { immediate: true },
);

// ─── Apply reduce-motion preference reactively ───────────────────────────
watch(
  () => settingsStore.reduceMotion,
  (enabled) => {
    if (import.meta.client) {
      document.documentElement.classList.toggle('reduce-motion', enabled);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  // await waitForToken();
  // userJournalStore().getAllTemplates();
  // userInfoStore.getMe();
});
</script>
<style>
/* ─── Font Size Scaling ──────────────────────────────────────────────────── */
html.app-font-small {
  font-size: 14px;
}
html.app-font-medium {
  font-size: 16px;
}
html.app-font-large {
  font-size: 18px;
}

/* ─── Reduce Motion ──────────────────────────────────────────────────────── */
html.reduce-motion *,
html.reduce-motion *::before,
html.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  transform: scale(90%);
  opacity: 0;
}


.layout-enter-active,
.layout-leave-active {
  transition: all 0.2s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>