<template>
  <section
    v-if="currentJournal"
    class="fixed left-0 bottom-0 h-16 bg-[var(--ui-bg)] border-2 w-full">
    <p class="flex w-full h-full justify-around items-center ">
      {{ $t('journal.resumeJournaling') }} <span class="text-3xl"> > </span>
    </p>
    {{ currentJournal }}
  </section>
</template>

<script>
import { Notebook } from "lucide-vue-next";

const currentJournal = ref("");

</script>
