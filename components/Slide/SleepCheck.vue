<template>
  <section>
    <p class="font-bold text-center">{{ $t('slide.sleepQuestion') }}</p>
    <div class="flex flex-col gap-4 min-h-[60vh] justify-center items-center">
      <USlider :step="10" :default-value="50" />
    </div>
  </section>
</template>

<script lang="ts" setup>
const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});
</script>
