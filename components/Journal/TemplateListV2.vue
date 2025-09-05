<template>
  <section>
    <section>
      <div
        class="mt-8"
        v-for="(collection, index) in testCollection.collections.filter(
          (collection) => collection.id === useRoute().params?.id
        )"
        :key="index">
        <p class="text-neutral-400 text-center text-sm">{{ collection?.slide_groups?.length }} lessons </p>
        <h1 class="text-center">{{ collection.title }}</h1>
        <p class="text-neutral-400 text-center text-sm">{{ collection.description }} </p>
        <div class="flex flex-col gap-4 items-center mt-4 overflow-x-scroll">
          <JournalTemplateCardV2
            v-for="slide_group in collection.slide_groups"
            :key="slide_group.id"
            class="flex-1/3 w-full cursor-pointer"
            :slide_group="slide_group"
            @click="openSlideGroup(slide_group.id, collection.id)" />
        </div>
      </div>
    </section>
    <!-- Single shared modal -->

  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { testCollection } from "~/mock/testCollection";

const { openSlideGroup} = useSlideGroup()
</script>
