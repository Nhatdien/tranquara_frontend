<template>
  <section
    class="flex flex-col justify-center items-center gap-16 h-full w-full">
    <div class="flex flex-col items-center w-full gap-8">
      <h2>How is your mood now ?</h2>
      <CommonEmotionSlider class="" v-model="currentValue" :currentEmotion="2" />
    </div>
    <div class="flex flex-col items-center gap-8">
      <h2>What makes you feel that way ?</h2>
      <UTextarea class="w-full" :rows="12"></UTextarea>
    </div>
  </section>
</template>

<script setup lang="ts">
import { emotions } from "~/data/emotionArray";

const currentValue = ref(1);
const journalText = ref("");
</script>
