<template>
  <section>
    <h2>{{ $t('slide.furtherReading') }}</h2>
    <ul class="p-4">
      <li class="mb-2" v-for="item in (content?.config?.links || content?.contents || [])">
        {{ item.type }}
        <a class="underline" :href="item?.link">{{ item.title }}</a>
      </li>
    </ul>
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
