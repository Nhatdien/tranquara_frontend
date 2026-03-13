<template>
  <section class="min-h-screen flex flex-col items-center justify-center px-6 pb-20 lg:pb-0 relative">
    <!-- Desktop Breadcrumbs (top-left) -->
    <div class="absolute top-4 left-4 z-10">
      <DesktopBreadcrumb :items="breadcrumbs" />
    </div>

    <!-- Back Button (mobile) -->
    <div class="fixed top-4 left-4 z-10 lg:hidden">
      <UButton variant="ghost" size="lg" icon="i-lucide-chevron-left" @click="navigateTo('/toolkit')" />
    </div>

    <!-- Title -->
    <h1 class="text-xl font-semibold mb-2">{{ $t('toolkit.grounding.breathing.title') }}</h1>
    <p class="text-muted text-sm mb-12">{{ $t('toolkit.grounding.breathing.description') }}</p>

    <!-- Breathing Circle -->
    <div class="relative w-48 h-48 mb-8">
      <!-- Outer ring -->
      <div
        class="absolute inset-0 rounded-full border-2 transition-all ease-linear"
        :class="isRunning ? phaseColorClass : 'border-default'"
        :style="circleStyle"
      />
      <!-- Phase label -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span v-if="isRunning" class="text-lg font-medium">{{ phaseLabel }}</span>
        <span v-else class="text-dimmed text-sm">{{ $t('toolkit.grounding.breathing.start') }}</span>
      </div>
    </div>

    <!-- Timer -->
    <p v-if="isRunning" class="text-muted text-sm mb-8">
      {{ $t('toolkit.grounding.breathing.elapsed', { time: formattedElapsed }) }}
    </p>

    <!-- Phase countdown -->
    <p v-if="isRunning" class="text-3xl font-bold mb-8 tabular-nums">{{ phaseCountdown }}</p>

    <!-- Completion message -->
    <p v-if="showComplete" class="text-green-400 text-sm mb-8 text-center">
      {{ $t('toolkit.grounding.breathing.complete', { duration: formattedElapsed }) }}
    </p>

    <!-- Start / Stop buttons -->
    <UButton
      v-if="!isRunning && !showComplete"
      variant="solid"
      color="neutral"
      size="xl"
      class="px-12 rounded-full"
      @click="startBreathing"
    >
      {{ $t('toolkit.grounding.breathing.start') }}
    </UButton>

    <UButton
      v-if="isRunning"
      variant="outline"
      color="neutral"
      size="lg"
      class="px-8 rounded-full"
      @click="stopBreathing"
    >
      {{ $t('toolkit.grounding.breathing.stop') }}
    </UButton>

    <UButton
      v-if="showComplete"
      variant="soft"
      color="neutral"
      size="lg"
      class="px-8 rounded-full"
      @click="resetBreathing"
    >
      {{ $t('toolkit.grounding.breathing.start') }}
    </UButton>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'
import { BOX_BREATHING_CONFIG } from '~/types/therapy_toolkit';

definePageMeta({ layout: 'detail' });

const { t } = useI18n();

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.grounding.breathing.title') },
])

const config = BOX_BREATHING_CONFIG;
const phases = [
  { key: 'inhale', duration: config.inhale, label: t('toolkit.grounding.breathing.inhale') },
  { key: 'holdIn', duration: config.holdIn, label: t('toolkit.grounding.breathing.holdIn') },
  { key: 'exhale', duration: config.exhale, label: t('toolkit.grounding.breathing.exhale') },
  { key: 'holdOut', duration: config.holdOut, label: t('toolkit.grounding.breathing.holdOut') },
];

const isRunning = ref(false);
const showComplete = ref(false);
const currentPhaseIndex = ref(0);
const phaseCountdown = ref(0);
const elapsedSeconds = ref(0);

let phaseTimer: ReturnType<typeof setInterval> | null = null;
let elapsedTimer: ReturnType<typeof setInterval> | null = null;

const currentPhase = computed(() => phases[currentPhaseIndex.value]);
const phaseLabel = computed(() => currentPhase.value.label);

const phaseColorClass = computed(() => {
  switch (currentPhase.value.key) {
    case 'inhale': return 'border-blue-400';
    case 'holdIn': return 'border-yellow-400';
    case 'exhale': return 'border-green-400';
    case 'holdOut': return 'border-purple-400';
    default: return 'border-muted';
  }
});

const circleStyle = computed(() => {
  if (!isRunning.value) return { transform: 'scale(0.7)' };
  const phase = currentPhase.value.key;
  if (phase === 'inhale') return { transform: 'scale(1)' };
  if (phase === 'exhale') return { transform: 'scale(0.7)' };
  // Hold phases keep current scale
  return {};
});

const formattedElapsed = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60);
  const secs = elapsedSeconds.value % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
});

const startBreathing = () => {
  isRunning.value = true;
  showComplete.value = false;
  currentPhaseIndex.value = 0;
  elapsedSeconds.value = 0;
  phaseCountdown.value = phases[0].duration;

  // Phase timer — ticks every second
  phaseTimer = setInterval(() => {
    phaseCountdown.value--;
    if (phaseCountdown.value <= 0) {
      // Move to next phase
      currentPhaseIndex.value = (currentPhaseIndex.value + 1) % phases.length;
      phaseCountdown.value = phases[currentPhaseIndex.value].duration;
    }
  }, 1000);

  // Elapsed timer
  elapsedTimer = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

const stopBreathing = () => {
  isRunning.value = false;
  showComplete.value = true;
  if (phaseTimer) clearInterval(phaseTimer);
  if (elapsedTimer) clearInterval(elapsedTimer);
};

const resetBreathing = () => {
  showComplete.value = false;
  elapsedSeconds.value = 0;
};

onUnmounted(() => {
  if (phaseTimer) clearInterval(phaseTimer);
  if (elapsedTimer) clearInterval(elapsedTimer);
});
</script>
