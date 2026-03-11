<template>
  <div>
    <JournalTemplateListV2 />
  </div>
</template>

<script lang="ts" setup>
import { TOOLKIT_COLLECTION_IDS } from "~/types/therapy_toolkit";

definePageMeta({ layout: "detail" });

const route = useRoute();
const collectionId = computed(() => route.params?.id as string);

onMounted(() => {
  if (collectionId.value && !TOOLKIT_COLLECTION_IDS.includes(collectionId.value)) {
    navigateTo('/toolkit');
  }
});
</script>
