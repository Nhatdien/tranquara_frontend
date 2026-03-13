<template>
  <section class="min-h-screen px-6 pb-20 lg:pb-0 pt-6">
    <!-- Desktop Breadcrumbs -->
    <DesktopBreadcrumb :items="breadcrumbs" />

    <!-- Back Button (mobile) -->
    <div class="mb-6 lg:hidden">
      <UButton variant="ghost" size="lg" icon="i-lucide-chevron-left" @click="navigateTo('/toolkit')" />
    </div>

    <h1 class="text-xl font-semibold mb-2 lg:text-2xl">{{ $t('toolkit.grounding.bodyScan.title') }}</h1>
    <p class="text-muted text-sm mb-6">{{ $t('toolkit.grounding.bodyScan.description') }}</p>

    <div class="p-5 rounded-xl border border-default bg-elevated mb-6 text-center">
      <p class="text-xs text-dimmed mb-2">
        {{ $t('toolkit.grounding.bodyScan.focusOn') }}
      </p>
      <p class="text-2xl font-semibold">{{ currentPart }}</p>
      <p class="text-muted text-sm mt-3">{{ $t('toolkit.grounding.bodyScan.prompt') }}</p>
    </div>

    <div class="flex gap-2">
      <UButton
        variant="ghost"
        color="neutral"
        class="flex-1"
        :disabled="currentIndex === 0"
        @click="prevPart"
      >
        {{ $t('common.prev') }}
      </UButton>
      <UButton
        variant="soft"
        color="neutral"
        class="flex-1"
        @click="nextPart"
      >
        {{ currentIndex === parts.length - 1 ? $t('common.done') : $t('common.next') }}
      </UButton>
    </div>

    <p v-if="isComplete" class="text-green-400 text-sm mt-6 text-center">
      {{ $t('toolkit.grounding.bodyScan.complete') }}
    </p>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'

definePageMeta({ layout: 'detail' });

const { t } = useI18n();

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.grounding.bodyScan.title') },
])

const parts = [
  'Head',
  'Shoulders',
  'Chest',
  'Arms',
  'Stomach',
  'Legs',
  'Feet',
];

const currentIndex = ref(0);
const isComplete = ref(false);

const currentPart = computed(() => parts[currentIndex.value]);

const nextPart = () => {
  if (currentIndex.value < parts.length - 1) {
    currentIndex.value += 1;
  } else {
    isComplete.value = true;
  }
};

const prevPart = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
};
</script>
