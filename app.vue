<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { userJournalStore } from "./stores/stores/user_journal";
import TranquaraSDK from "./stores/tranquara_sdk";
import { useWebSocket } from "@vueuse/core";

const config = useRuntimeConfig();
const userInfoStore = userInformationStore();

onMounted(async () => {
  await waitForToken()
  userJournalStore().getAllTemplates()
  userInfoStore.getMe();
});

</script>
