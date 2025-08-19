<template>
  <section class="h-full">
    <h1>Latest entries</h1>

    <div class="flex gap-4 mt-4">
      <UCard class="flex-1" variant="soft">
        <template #header>
          <h2>Last Emotion Log</h2>
        </template>

        <div class="mt-auto">
          <p class="text-2xl font-semibold">Calm</p>
          <p class="text-base">Yesterday</p>
        </div>

        <!-- <template #footer>
          <Placeholder class="h-8" />
        </template> -->
      </UCard>
      <UCard class="flex-1" variant="soft">
        <template #header>
          <h2>Last Journal</h2>
        </template>

        <div class="mt-auto h-full">
          <p class="text-2xl font-semibold">Afternoon reflection</p>
          <p class="text-base">Yesterday</p>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
