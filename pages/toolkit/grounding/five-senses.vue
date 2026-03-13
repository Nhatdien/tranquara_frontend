<template>
  <section class="min-h-screen px-6 pb-20 lg:pb-0 pt-6">
    <!-- Desktop Breadcrumbs -->
    <DesktopBreadcrumb :items="breadcrumbs" />

    <!-- Back Button (mobile) -->
    <div class="mb-6 lg:hidden">
      <UButton variant="ghost" size="lg" icon="i-lucide-chevron-left" @click="navigateTo('/toolkit')" />
    </div>

    <h1 class="text-xl font-semibold mb-2 lg:text-2xl">{{ $t('toolkit.grounding.fiveSenses.title') }}</h1>
    <p class="text-muted text-sm mb-6">{{ $t('toolkit.grounding.fiveSenses.description') }}</p>

    <!-- Step indicator -->
    <div class="text-xs text-dimmed mb-4">
      {{ $t('common.step', { count: currentStepIndex + 1, total: steps.length }) }}
    </div>

    <div class="p-4 rounded-xl border border-default bg-elevated mb-6">
      <h2 class="text-sm font-semibold mb-3">{{ stepLabel }}</h2>

      <div class="space-y-3">
        <div
          v-for="(value, i) in currentInputs"
          :key="i"
          class="flex items-center gap-3"
        >
          <span class="text-xs text-dimmed w-5">{{ i + 1 }}.</span>
          <UInput
            v-model="currentInputs[i]"
            size="sm"
            class="flex-1"
            :placeholder="$t('toolkit.grounding.fiveSenses.inputPlaceholder')"
          />
        </div>
      </div>
    </div>

    <div class="flex gap-2">
      <UButton
        variant="ghost"
        color="neutral"
        class="flex-1"
        :disabled="currentStepIndex === 0"
        @click="prevStep"
      >
        {{ $t('common.prev') }}
      </UButton>
      <UButton
        variant="soft"
        color="neutral"
        class="flex-1"
        @click="nextStep"
      >
        {{ currentStepIndex === steps.length - 1 ? $t('common.done') : $t('common.next') }}
      </UButton>
    </div>

    <p v-if="isComplete" class="text-green-400 text-sm mt-6 text-center">
      {{ $t('toolkit.grounding.fiveSenses.complete') }}
    </p>
  </section>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui'

definePageMeta({ layout: 'detail' });

const { t } = useI18n();

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('nav.toolkit'), icon: 'i-lucide-heart-handshake', to: '/toolkit' },
  { label: t('toolkit.grounding.fiveSenses.title') },
])

const steps = [
  { key: 'see', count: 5, labelKey: 'toolkit.grounding.fiveSenses.steps.see' },
  { key: 'touch', count: 4, labelKey: 'toolkit.grounding.fiveSenses.steps.touch' },
  { key: 'hear', count: 3, labelKey: 'toolkit.grounding.fiveSenses.steps.hear' },
  { key: 'smell', count: 2, labelKey: 'toolkit.grounding.fiveSenses.steps.smell' },
  { key: 'taste', count: 1, labelKey: 'toolkit.grounding.fiveSenses.steps.taste' },
];

const currentStepIndex = ref(0);
const isComplete = ref(false);

const responses = reactive<Record<string, string[]>>({
  see: Array(5).fill(''),
  touch: Array(4).fill(''),
  hear: Array(3).fill(''),
  smell: Array(2).fill(''),
  taste: Array(1).fill(''),
});

const stepLabel = computed(() => t(steps[currentStepIndex.value].labelKey));
const currentInputs = computed(() => responses[steps[currentStepIndex.value].key]);

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value += 1;
  } else {
    isComplete.value = true;
  }
};

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value -= 1;
  }
};
</script>
