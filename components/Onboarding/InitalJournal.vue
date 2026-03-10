<template>
  <section
    class="flex flex-col justify-center items-center gap-16 h-full w-full">
    <div class="flex flex-col items-center w-full gap-8">
      <h2>{{ $t('onboarding.initialJournal.moodQuestion') }}</h2>
      <CommonEmotionSlider class="" v-model="currentValue" :currentEmotion="2" />
    </div>
    <div class="flex flex-col items-center gap-8">
      <h2>{{ $t('onboarding.initialJournal.whatMakesYouFeel') }}</h2>
      <CommonMarkdownEditor v-model="journalText"></CommonMarkdownEditor>
    </div>
  </section>
</template>

<script setup lang="ts">
import { emotions } from "~/data/emotionArray";

const currentValue = ref(1);
const journalText = ref("");
</script>
