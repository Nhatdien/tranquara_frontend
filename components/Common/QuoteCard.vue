<template>
  <UCard class="quote-card">
    <section class="flex items-center gap-4">
      <div class="self-start mt-2 px-4">
        <Quote class="quote-icon" fill="amber"></Quote>
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-semibold">Today's Reflection</p>
        <p>
          "What small moment brought you peace yesterday, and how can you create
          more of those today?
        </p>
        <UButton class="self-start font-bold px-4 py-2">
          Start jounrling
        </UButton>
      </div>
    </section>
  </UCard>
</template>

<script lang="ts" setup>
import { Quote } from "lucide-vue-next";
</script>

<style lang="scss">
.quote-card {
  position: relative;
  background-image: linear-gradient(
    to left,
    var(--ui-color-neutral-800) 0%,
    var(--ui-bg) 100%
  );
  padding: 1rem;
  border-radius: 0.375rem;

  .quote-icon {
    fill: #f2b900;
    stroke-width: 0px;
  }
}
</style>
