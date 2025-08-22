<template>
  <section class="h-full">
    <h1>Latest entries</h1>

    <div class="grid grid-cols-1 gap-4 mt-4">
      <UCard v-for="journal in userJournalStore().journals" class="flex-1" variant="soft">
        <template #header>
          <h2>{{ journal.title }}</h2>
        </template>

        <div class="mt-auto" v-html="journal.content">
          
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">


onMounted(async () => {
  await waitForToken()
  userJournalStore().getJournals()
})
</script>
