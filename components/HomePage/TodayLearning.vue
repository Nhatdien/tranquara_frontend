<template>
  <UCard variant="soft">
    <template #header>
      <div class="flex justify-between items-center">
        <span class="font-bold">Today's learning</span>
        <UBadge color="primary" size="sm">3 min read</UBadge>
      </div>
    </template>
    <div class="flex gap-4">
      <img
        class="object-fill w-24 h-24 w-auto black-to-white"
        src="@/assets/img/journaling.png" />
      <div>
        <p class="font-semibold mb-2">
          Understanding Cognitive Behavioral Therapy
        </p>
        <p class="text-gray-300">
          Learn how CBT helps identify and change negative thought patterns that
          affect your emotions and behaviors.
        </p>
        <UButton
          size="sm"
          color="primary"
          class="mt-4"
          variant="subtle"
          href="/articles/cognitive-behavioral-therapy"
          >Read More</UButton
        >
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.black-to-white {
  filter: invert(100%);
}
</style>
