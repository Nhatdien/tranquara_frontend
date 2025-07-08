<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import TranquaraSDK from "./stores/tranquara_sdk";
import { useWebSocket } from "@vueuse/core";

const config = useRuntimeConfig();

onMounted(async () => {

});
</script>
